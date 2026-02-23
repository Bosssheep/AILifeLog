import React, { useState } from "react";
import diaryService from "../api/diaryService";

const AdminAuth = ({ onAuthed }) => {
  const [mode, setMode] = useState("login"); // login or register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        await diaryService.adminRegister(username, password, adminKey);
        alert("管理员注册成功！请重新登录");
        setMode("login");
      } else {
        await diaryService.adminLogin(username, password);
        onAuthed();
      }
    } catch (error) {
      alert(`操作失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded-xl shadow-sm bg-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          🔒 管理员 {mode === "login" ? "登录" : "注册"}
        </h2>
        <p className="text-gray-600 text-sm">
          {mode === "login"
            ? "请输入管理员账号密码"
            : "首次使用需要注册管理员账号"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            管理员用户名
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="输入管理员用户名"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="输入密码"
            required
          />
        </div>

        {mode === "register" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              管理员密钥
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="输入管理员密钥"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? "处理中..."
            : mode === "login"
              ? "管理员登录"
              : "注册管理员"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          {mode === "login" ? "首次使用？注册管理员" : "已有账号？返回登录"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium text-yellow-800 mb-2">⚠️ 重要提醒</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 管理员可以查看和管理所有用户数据</li>
          <li>• 请妥善保管管理员账号密码</li>
          <li>• 生产环境请修改默认管理员密钥</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminAuth;
