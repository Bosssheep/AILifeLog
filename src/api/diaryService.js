// 这是 前端的服务层 ，负责与后端 API 通信。它封装了所有的 HTTP 请求。

// 1. 基础配置
// 环境变量优先，否则本地地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const ENTRIES_URL = `${BASE_URL}/api/entries`;
const AUTH_URL = `${BASE_URL}/api`;

// 2. 认证辅助函数
const withAuth = (options = {}) => {
  const token = localStorage.getItem("lifelog_token");
  console.log("[Auth] 获取到的token:", token ? "存在" : "不存在");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log("[Auth] 请求头:", headers);
  return { ...options, headers };
};

// 3. 服务对象
const diaryService = {
  // 登录/注册
  register: async (username, password) => {
    const res = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("注册失败");
    return res.json();
  },
  login: async (username, password) => {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("登录失败");
    const data = await res.json();
    localStorage.setItem("lifelog_token", data.token);
    localStorage.setItem("lifelog_user", JSON.stringify(data.user));
    return data;
  },

  // 管理员注册
  adminRegister: async (username, password, adminKey) => {
    const res = await fetch(`${AUTH_URL}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, adminKey }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "管理员注册失败");
    }
    return res.json();
  },

  // 管理员登录
  adminLogin: async (username, password) => {
    const res = await fetch(`${AUTH_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "管理员登录失败");
    }
    const data = await res.json();
    localStorage.setItem("lifelog_token", data.token);
    localStorage.setItem("lifelog_user", JSON.stringify(data.user));
    return data;
  },

  // 获取所有用户（管理员）
  getAllUsers: async () => {
    const res = await fetch(`${AUTH_URL}/admin/users`, withAuth());
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "获取用户列表失败");
    }
    return res.json();
  },

  // 创建新用户（管理员）
  createUser: async (username, password) => {
    const res = await fetch(`${AUTH_URL}/admin/users`, {
      method: "POST",
      ...withAuth({
        body: JSON.stringify({ username, password }),
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "创建用户失败");
    }
    return res.json();
  },

  // 删除用户（管理员）
  deleteUser: async (userId) => {
    const res = await fetch(`${AUTH_URL}/admin/users/${userId}`, {
      method: "DELETE",
      ...withAuth(),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "删除用户失败");
    }
    return res.json();
  },

  // 重置用户密码（管理员）
  resetUserPassword: async (userId, password) => {
    const res = await fetch(`${AUTH_URL}/admin/users/${userId}/password`, {
      method: "PUT",
      ...withAuth({
        body: JSON.stringify({ password }),
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "重置密码失败");
    }
    return res.json();
  },

  // 备份所有数据（管理员）
  backupAllData: async () => {
    const res = await fetch(`${AUTH_URL}/admin/backup`, withAuth());
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "备份失败");
    }
    return res.json();
  },

  // 恢复数据（管理员）
  restoreData: async (backupData) => {
    const res = await fetch(`${AUTH_URL}/admin/restore`, {
      method: "POST",
      ...withAuth({
        body: JSON.stringify({ ...backupData, confirm: true }),
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "恢复失败");
    }
    return res.json();
  },
  logout: () => {
    localStorage.removeItem("lifelog_token");
    localStorage.removeItem("lifelog_user");
  },

  // 查：获取全部
  getAll: async () => {
    console.log("[API] 开始获取数据，URL:", ENTRIES_URL);
    const response = await fetch(ENTRIES_URL, withAuth());
    console.log("[API] 响应状态:", response.status, response.statusText);
    if (!response.ok) {
      console.error("[API] 获取数据失败，状态码:", response.status);
      throw new Error(`获取失败: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("[API] 获取到数据条数:", data.length);
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // 增：创建新日记
  create: async (entry) => {
    try {
      const response = await fetch(
        ENTRIES_URL,
        withAuth({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        }),
      );
      if (!response.ok) {
        throw new Error(`服务器拒绝: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      // 处理 ERR_CONNECTION_REFUSED (断网/服务没开)
      console.error("【网络层错误】:", error.message);
      throw error; // 抛给上层 UI 处理
    }
  },

  // 改：更新现有日记
  update: async (id, entry) => {
    const response = await fetch(
      `${ENTRIES_URL}/${id}`,
      withAuth({
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }),
    );
    return response.json();
  },

  // 删：删除日记
  delete: async (id) => {
    const response = await fetch(`${ENTRIES_URL}/${id}`, withAuth({ method: "DELETE" }));
    return response.ok;
  },

  // 手动更新 AI 回信
  updateAIReply: async (id) => {
    const response = await fetch(`${ENTRIES_URL}/${id}/ai-reply`, withAuth({ method: "POST" }));
    if (!response.ok) throw new Error("触发更新失败");
    return response.json();
  },

  // 批量覆盖数据（用于导入）
  // 注意：json-server 默认不直接支持批量覆盖，所以我们需要循环处理或特殊处理
  importAll: async (newEntries) => {
    const promises = newEntries.map((entry) =>
      fetch(
        ENTRIES_URL,
        withAuth({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        }),
      ),
    );
    return Promise.all(promises);
  },
};

export default diaryService;
