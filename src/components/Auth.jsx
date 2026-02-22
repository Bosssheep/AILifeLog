import { useState } from "react";
import diaryService from "../api/diaryService";

const Auth = ({ onAuthed }) => {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        await diaryService.register(username, password);
      }
      await diaryService.login(username, password);
      onAuthed();
    } catch {
      alert(mode === "login" ? "登录失败" : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-24 p-6 border rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        {mode === "login" ? "登录 LifeLog" : "注册 LifeLog"}
      </h2>
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
      <div className="mt-3 text-sm text-center">
        {mode === "login" ? (
          <button
            onClick={() => setMode("register")}
            className="text-gray-600 underline"
          >
            没有账号？注册
          </button>
        ) : (
          <button
            onClick={() => setMode("login")}
            className="text-gray-600 underline"
          >
            已有账号？去登录
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
