import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs";

const app = express();

// CORS 配置 - 支持 GitHub Pages 和本地开发
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4000",
    "https://bosssheep.github.io",
    "https://ailifelog-production-alex.up.railway.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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
  jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "未授权：缺少令牌" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
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
  return res.json({ token, user: { id: user.id, username: user.username } });
});

// --- Entries Routes (Protected) ---
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
  const edb = await getUserEntriesDb(userId);
  const idx = edb.data.entries.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ message: "未找到或无权限" });
  let updated;
  await runSerial(userId, async () => {
    edb.data.entries[idx] = { ...edb.data.entries[idx], ...req.body, id };
    updated = edb.data.entries[idx];
    await edb.write();
  });
  return res.json(updated);
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
  app.use(express.static(distDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
