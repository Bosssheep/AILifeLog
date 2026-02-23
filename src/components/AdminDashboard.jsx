import React, { useState, useEffect } from "react";
import diaryService from "../api/diaryService";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userList = await diaryService.getAllUsers();
      setUsers(userList);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await diaryService.createUser(newUser.username, newUser.password);
      alert(`用户 ${newUser.username} 创建成功！`);
      setNewUser({ username: "", password: "" });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      alert(`创建用户失败: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复！`)) {
      try {
        await diaryService.deleteUser(userId);
        alert(`用户 ${username} 已删除`);
        fetchUsers();
      } catch (err) {
        alert(`删除用户失败: ${err.message}`);
      }
    }
  };

  const handleResetPassword = async (userId, username) => {
    const newPassword = prompt(`请输入用户 "${username}" 的新密码:`);
    if (newPassword && newPassword.trim()) {
      try {
        await diaryService.resetUserPassword(userId, newPassword.trim());
        alert(`用户 ${username} 的密码已重置为: ${newPassword.trim()}`);
      } catch (err) {
        alert(`重置密码失败: ${err.message}`);
      }
    }
  };

  const handleLogout = () => {
    diaryService.logout();
    window.location.reload();
  };

  const handleBackupData = async () => {
    try {
      const backup = await diaryService.backupAllData();

      // 创建下载链接
      const dataStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([dataStr], {
        type: "application/json;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `LifeLog_管理员备份_${new Date().toISOString().split("T")[0]}_${Date.now()}.json`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`备份成功！共备份了 ${backup.users.length} 个用户的数据`);
    } catch (err) {
      alert(`备份失败: ${err.message}`);
    }
  };

  const handleRestoreData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!confirm("⚠️ 警告：此操作将覆盖所有现有数据！确定要继续吗？")) {
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target.result);
          const result = await diaryService.restoreData(backupData);

          alert(
            `数据恢复成功！\n恢复用户数: ${result.restoredUsers}\n恢复数据条目: ${result.restoredData}\n备份文件已保存到服务器`,
          );
          fetchUsers(); // 刷新用户列表
        } catch (err) {
          alert(`数据恢复失败: ${err.message}`);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载用户列表中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium mb-2">加载失败</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👨‍💼 管理员控制台
              </h1>
              <p className="text-gray-600 mt-1">管理所有用户账号和数据</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBackupData}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                💾 备份数据
              </button>
              <button
                onClick={handleRestoreData}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                📁 恢复数据
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                ➕ 创建用户
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                🚪 退出管理
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              创建新用户
            </h3>
            <form
              onSubmit={handleCreateUser}
              className="flex space-x-4 items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入新用户名"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入初始密码"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              用户列表 ({users.length} 个用户)
            </h2>
            <button
              onClick={fetchUsers}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              🔄 刷新
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    管理员
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          👑 管理员
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          普通用户
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleResetPassword(user.id, user.username)
                          }
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          🔑 重置密码
                        </button>
                        {!user.isAdmin && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.username)
                            }
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            🗑️ 删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>暂无用户，点击上方"创建用户"按钮添加第一个用户</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium text-yellow-800 mb-2">📋 使用说明</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• 💾 备份数据：下载包含所有用户和数据的完整备份文件</li>
          <li>• 📁 恢复数据：从备份文件恢复所有用户和数据（会覆盖现有数据）</li>
          <li>• ➕ 创建新用户：设置用户名和初始密码</li>
          <li>• 🔑 重置密码：为用户设置新密码并显示给用户</li>
          <li>• 🗑️ 删除用户：删除普通用户及其所有数据（不能删除管理员）</li>
          <li>• 👑 管理员账号拥有所有权限，请妥善保管</li>
          <li>• ⚠️ 恢复数据前系统会自动创建当前数据的备份</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
