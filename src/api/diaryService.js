const BASE_URL = "http://localhost:3001/entries";

const diaryService = {
  // 查：获取全部
  getAll: async () => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("获取失败");
    const data = await response.json();
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  // 增：创建新日记
  create: async (entry) => {
    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!response.ok) {
        // 处理 404, 500 等服务器错误
        const errorData = await response.json();
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
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return response.json();
  },

  // 删：删除日记
  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  },

  // 批量覆盖数据（用于导入）
  // 注意：json-server 默认不直接支持批量覆盖，所以我们需要循环处理或特殊处理
  importAll: async (newEntries) => {
    const promises = newEntries.map((entry) =>
      fetch("http://localhost:3001/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }),
    );
    return Promise.all(promises);
  },
};

export default diaryService;
