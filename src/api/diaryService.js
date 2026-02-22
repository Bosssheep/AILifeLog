const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:4000";
const ENTRIES_URL = `${API_BASE}/api/entries`;
const AUTH_URL = `${API_BASE}/api`;

const withAuth = (options = {}) => {
  const token = localStorage.getItem("lifelog_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return { ...options, headers };
};

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
  logout: () => {
    localStorage.removeItem("lifelog_token");
    localStorage.removeItem("lifelog_user");
  },

  // 查：获取全部
  getAll: async () => {
    const response = await fetch(ENTRIES_URL, withAuth());
    if (!response.ok) throw new Error("获取失败");
    const data = await response.json();
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
    const response = await fetch(
      `${ENTRIES_URL}/${id}`,
      withAuth({
        method: "DELETE",
      }),
    );
    return response.ok;
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
