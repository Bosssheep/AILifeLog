import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { generateReply } from "./aiService.js";

dotenv.config();

const app = express();

// CORS 配置 - 支持 GitHub Pages 和本地开发
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4000",
      "https://bosssheep.github.io",
      "https://ailifelog-production-alex.up.railway.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// --- Config ---
const PORT = process.env.PORT || 4000;
const JWT_SECRET =
  process.env.JWT_SECRET || "your-default-secret-for-development";

// Health check
app.get("/ping", (req, res) => res.send("pong"));

// --- Storage layout ---
const dataDir = path.resolve(process.cwd(), "server", "data");
const usersDir = path.join(dataDir, "users");
const usersFile = path.join(dataDir, "users.json");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });
const usersAdapter = new JSONFile(usersFile);
const usersDb = new Low(usersAdapter, { users: [] });
await usersDb.read();
usersDb.data ||= { users: [] };
await usersDb.write();

const entriesDbCache = new Map();
const userLocks = new Map();

const getUserEntriesDb = async (userId) => {
  if (entriesDbCache.has(userId)) return entriesDbCache.get(userId);
  const userPath = path.join(usersDir, userId);
  const filePath = path.join(userPath, "entries.json");
  if (!fs.existsSync(userPath)) fs.mkdirSync(userPath, { recursive: true });
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter, { entries: [] });
  await db.read();
  db.data ||= { entries: [] };
  await db.write();
  entriesDbCache.set(userId, db);
  return db;
};

const runSerial = async (userId, fn) => {
  const prev = userLocks.get(userId) || Promise.resolve();
  const next = prev.then(fn).catch((e) => {
    throw e;
  });
  userLocks.set(
    userId,
    next.catch(() => {}),
  );
  return next;
};

// --- One-off migration from legacy db.json ---
const legacyFile = path.join(dataDir, "db.json");
app.post("/admin/migrate", async (req, res) => {
  const secretRequired = !!process.env.MIGRATE_SECRET;
  if (secretRequired && req.query.secret !== process.env.MIGRATE_SECRET) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (!fs.existsSync(legacyFile)) {
    return res.status(404).json({ message: "legacy db.json not found" });
  }
  const raw = JSON.parse(fs.readFileSync(legacyFile, "utf-8"));
  const legacyUsers = Array.isArray(raw.users) ? raw.users : [];
  const legacyEntries = Array.isArray(raw.entries) ? raw.entries : [];

  let addedUsers = 0;
  for (const u of legacyUsers) {
    const existsByName = usersDb.data.users.find(
      (x) => x.username === u.username,
    );
    if (!existsByName) {
      usersDb.data.users.push({
        id: u.id,
        username: u.username,
        passwordHash: u.passwordHash,
      });
      addedUsers++;
    }
  }
  await usersDb.write();

  const byUser = new Map();
  for (const e of legacyEntries) {
    const uid = e.userId;
    if (!uid) continue;
    if (!byUser.has(uid)) byUser.set(uid, []);
    const { userId: _drop, ...rest } = e;
    byUser.get(uid).push(rest);
  }

  let migratedUsers = 0;
  for (const [uid, list] of byUser.entries()) {
    const edb = await getUserEntriesDb(uid);
    edb.data.entries = list;
    await edb.write();
    migratedUsers++;
  }

  return res.json({
    users_added: addedUsers,
    users_total: usersDb.data.users.length,
    users_with_entries_migrated: migratedUsers,
    entries_total_legacy: legacyEntries.length,
  });
});

// --- Helpers ---
const createToken = (user) =>
  jwt.sign(
    { sub: user.id, username: user.username, isAdmin: user.isAdmin || false },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "未授权：缺少令牌" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      username: payload.username,
      isAdmin: payload.isAdmin || false,
    };
    next();
  } catch {
    return res.status(401).json({ message: "未授权：令牌无效或过期" });
  }
};

// --- Auth Routes ---
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "用户名与密码必填" });

  const exists = usersDb.data.users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ message: "用户名已存在" });

  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  usersDb.data.users.push({ id, username, passwordHash: hash });
  await usersDb.write();
  await getUserEntriesDb(id);
  return res.status(201).json({ id, username });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user = usersDb.data.users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "用户名或密码错误" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "用户名或密码错误" });
  const token = createToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false,
    },
  });
});

// --- Admin Routes ---
// 管理员注册（首次使用）
app.post("/api/admin/register", async (req, res) => {
  const { username, password, adminKey } = req.body || {};

  // 简单的管理员密钥验证（生产环境应该更复杂）
  const ADMIN_KEY = process.env.ADMIN_KEY || "lifelog-admin-2024";
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ message: "管理员密钥错误" });
  }

  if (!username || !password) {
    return res.status(400).json({ message: "用户名与密码必填" });
  }

  const exists = usersDb.data.users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ message: "用户名已存在" });

  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  usersDb.data.users.push({ id, username, passwordHash: hash, isAdmin: true });
  await usersDb.write();
  await getUserEntriesDb(id);

  return res.status(201).json({ id, username, isAdmin: true });
});

// 管理员登录
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user = usersDb.data.users.find(
    (u) => u.username === username && u.isAdmin,
  );
  if (!user) return res.status(401).json({ message: "管理员用户名或密码错误" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "管理员用户名或密码错误" });
  const token = createToken(user);
  return res.json({
    token,
    user: { id: user.id, username: user.username, isAdmin: true },
  });
});

// --- Entries Routes (Protected) ---
// --- Admin User Management Routes ---
// 获取所有用户（管理员）
app.get("/api/admin/users", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }
  const users = usersDb.data.users.map(({ passwordHash, ...user }) => {
    void passwordHash;
    return user;
  });
  return res.json(users);
});

// 创建新用户（管理员）
app.post("/api/admin/users", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "用户名与密码必填" });
  }
  const exists = usersDb.data.users.find((u) => u.username === username);
  if (exists) return res.status(409).json({ message: "用户名已存在" });
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  usersDb.data.users.push({ id, username, passwordHash: hash });
  await usersDb.write();
  await getUserEntriesDb(id);
  return res.status(201).json({ id, username });
});

// 删除用户（管理员）
app.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }
  const userId = req.params.id;
  if (userId === req.user.id) {
    return res.status(400).json({ message: "不能删除自己的账号" });
  }
  const userIndex = usersDb.data.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: "用户不存在" });
  }
  usersDb.data.users.splice(userIndex, 1);
  await usersDb.write();
  // 删除用户数据目录
  const userDir = path.join(usersDir, userId);
  if (fs.existsSync(userDir)) {
    fs.rmSync(userDir, { recursive: true, force: true });
  }
  return res.json({ message: "用户已删除" });
});

// 重置用户密码（管理员）
app.put("/api/admin/users/:id/password", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }
  const userId = req.params.id;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "新密码必填" });
  }
  const user = usersDb.data.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "用户不存在" });
  }
  user.passwordHash = await bcrypt.hash(password, 10);
  await usersDb.write();
  return res.json({ message: "密码已重置" });
});

// 获取所有用户数据（管理员备份）
app.get("/api/admin/backup", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }

  const backup = {
    timestamp: new Date().toISOString(),
    users: usersDb.data.users.map(({ passwordHash, ...user }) => {
      void passwordHash;
      return user;
    }),
    userData: {},
  };

  // 获取所有用户的数据
  for (const user of usersDb.data.users) {
    try {
      const edb = await getUserEntriesDb(user.id);
      backup.userData[user.id] = edb.data.entries || [];
    } catch (err) {
      console.error(`获取用户 ${user.username} 数据失败:`, err);
      backup.userData[user.id] = [];
    }
  }

  return res.json(backup);
});

// 恢复数据（管理员）
app.post("/api/admin/restore", authMiddleware, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "需要管理员权限" });
  }

  const { users, userData } = req.body;
  if (!users || !userData) {
    return res.status(400).json({ message: "备份数据格式错误" });
  }

  // 确认恢复操作
  if (!req.body.confirm) {
    return res.status(400).json({
      message:
        "此操作将覆盖所有现有数据，请在请求体中添加 'confirm: true' 确认",
    });
  }

  try {
    // 备份当前数据
    const currentBackup = {
      timestamp: new Date().toISOString(),
      users: usersDb.data.users.map(({ passwordHash, ...user }) => {
        void passwordHash;
        return user;
      }),
      userData: {},
    };

    for (const user of usersDb.data.users) {
      try {
        const edb = await getUserEntriesDb(user.id);
        currentBackup.userData[user.id] = edb.data.entries || [];
      } catch {
        currentBackup.userData[user.id] = [];
      }
    }

    // 保存当前备份到文件
    const backupFile = path.join(dataDir, `backup_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(currentBackup, null, 2));

    // 清空现有用户（保留管理员权限）
    const adminUsers = usersDb.data.users.filter((u) => u.isAdmin);
    usersDb.data.users = adminUsers;

    // 恢复用户
    for (const user of users) {
      if (!adminUsers.find((a) => a.id === user.id)) {
        usersDb.data.users.push({
          id: user.id,
          username: user.username,
          passwordHash: user.passwordHash || (await bcrypt.hash("123456", 10)), // 默认密码
          isAdmin: user.isAdmin || false,
        });
      }
    }

    await usersDb.write();

    // 恢复用户数据
    for (const [userId, entries] of Object.entries(userData)) {
      try {
        const edb = await getUserEntriesDb(userId);
        edb.data.entries = entries || [];
        await edb.write();
      } catch (err) {
        console.error(`恢复用户 ${userId} 数据失败:`, err);
      }
    }

    return res.json({
      message: "数据恢复成功",
      backupFile: backupFile,
      restoredUsers: users.length,
      restoredData: Object.keys(userData).length,
    });
  } catch (err) {
    console.error("数据恢复失败:", err);
    return res.status(500).json({ message: "数据恢复失败: " + err.message });
  }
});

// --- 辅助函数：异步触发并保存 AI 回信 ---
const triggerAIReply = async (userId, entryId) => {
  try {
    // 延迟一小会儿，确保主进程写入已完成（虽然 runSerial 已经保证了，但这样更稳健）
    const edb = await getUserEntriesDb(userId);
    const entryIdx = edb.data.entries.findIndex((e) => e.id === entryId);
    if (entryIdx === -1) return;

    const entry = edb.data.entries[entryIdx];
    const aiResult = await generateReply(entry.blocks || [], entry.date);

    if (aiResult) {
      await runSerial(userId, async () => {
        const edbUpdate = await getUserEntriesDb(userId);
        const idx = edbUpdate.data.entries.findIndex((e) => e.id === entryId);
        if (idx !== -1) {
          const blocksWithoutReply = (
            edbUpdate.data.entries[idx].blocks || []
          ).filter((b) => b.tag !== "reply");
          edbUpdate.data.entries[idx].blocks = [
            ...blocksWithoutReply,
            {
              id: `reply-${crypto.randomUUID()}`,
              tag: "reply",
              content: aiResult.content,
              metadata: aiResult.metadata,
            },
          ];
          await edbUpdate.write();
          console.log(
            `[AI-Python] 异步成功为用户 ${userId} 的日记 ${entryId} 更新回信`,
          );
        }
      });
    }
  } catch (error) {
    console.error(`[AI-Python] 异步更新回信失败:`, error);
  }
};

app.get("/api/entries", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const edb = await getUserEntriesDb(userId);
  const list = edb.data.entries.sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  return res.json(list);
});

app.post("/api/entries", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const entry = req.body || {};
  if (!entry.date) return res.status(400).json({ message: "缺少日期" });

  const id = entry.id || crypto.randomUUID();
  const newEntry = { ...entry, id };
  await runSerial(userId, async () => {
    const edb = await getUserEntriesDb(userId);
    edb.data.entries.push(newEntry);
    await edb.write();
  });

  return res.status(201).json(newEntry);
});

app.put("/api/entries/:id", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const entry = req.body || {};

  const edb = await getUserEntriesDb(userId);
  const idx = edb.data.entries.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ message: "未找到或无权限" });
  let updated;
  await runSerial(userId, async () => {
    edb.data.entries[idx] = { ...edb.data.entries[idx], ...entry, id };
    updated = edb.data.entries[idx];
    await edb.write();
  });

  return res.json(updated);
});

// 手动触发回信更新
app.post("/api/entries/:id/ai-reply", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const edb = await getUserEntriesDb(userId);
  const exists = edb.data.entries.find((e) => e.id === id);
  if (!exists) return res.status(404).json({ message: "日记未找到" });

  // 异步触发回信逻辑
  triggerAIReply(userId, id);

  return res.json({ message: "已开始重新生成回信" });
});

app.delete("/api/entries/:id", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const edb = await getUserEntriesDb(userId);
  const exists = edb.data.entries.find((e) => e.id === id);
  if (!exists) return res.status(404).json({ message: "未找到或无权限" });
  await runSerial(userId, async () => {
    edb.data.entries = edb.data.entries.filter((e) => e.id !== id);
    await edb.write();
  });
  return res.status(204).send();
});

// --- Static hosting for production builds (optional) ---
const distDir = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distDir)) {
  console.log(`[Static] Serving dist from ${distDir}`);
  // 静态文件服务应该在 API 路由之后
  app.use(express.static(distDir));
  // 只有非 /api 开头的请求才回退到 index.html
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
