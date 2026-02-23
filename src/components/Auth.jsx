import { useState } from "react";
import diaryService from "../api/diaryService";

const Auth = ({ onAuthed }) => {
  const [mode, setMode] = useState("login"); // login | register | demo
  const DEMO_USERNAME = "testuser";
  const DEMO_PASSWORD = "test123";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        console.log("[Auth] 开始注册，用户名:", username);
        await diaryService.register(username, password);
        console.log("[Auth] 注册成功，开始登录");
      }
      console.log("[Auth] 开始登录，用户名:", username);
      await diaryService.login(username, password);
      console.log("[Auth] 登录成功");
      onAuthed();
    } catch (error) {
      console.error("[Auth] 登录/注册失败:", error.message);
      alert(`${mode === "login" ? "登录" : "注册"}失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      console.log("[Demo] 开始测试账号登录，用户名:", DEMO_USERNAME);
      await diaryService.login(DEMO_USERNAME, DEMO_PASSWORD);
      console.log("[Demo] 测试账号登录成功");
      onAuthed();
    } catch (error) {
      console.error("[Demo] 测试账号登录失败:", error.message);
      alert(`测试账号登录失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 p-6 border rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        {mode === "login"
          ? "登录 LifeLog"
          : mode === "demo"
            ? "试用 LifeLog"
            : "注册 LifeLog"}
      </h2>
      {mode === "demo" ? (
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">测试账号信息：</p>
            <p>
              用户名：
              <code className="bg-blue-100 px-1 rounded">{DEMO_USERNAME}</code>
            </p>
            <p>
              密码：
              <code className="bg-blue-100 px-1 rounded">{DEMO_PASSWORD}</code>
            </p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "登录中..." : "一键登录测试账号"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="用户名"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="密码"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2"
          >
            {loading ? "提交中..." : mode === "login" ? "登录" : "注册并登录"}
          </button>
        </form>
      )}
      <div className="mt-3 text-sm text-center space-y-2">
        {mode === "login" ? (
          <>
            <button
              onClick={() => setMode("demo")}
              className="block w-full text-blue-600 underline"
            >
              想试用？使用测试账号
            </button>
          </>
        ) : mode === "demo" ? (
          <button
            onClick={() => setMode("login")}
            className="text-gray-600 underline"
          >
            已有账号？去登录
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Auth;
