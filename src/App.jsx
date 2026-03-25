/**
 * LifeLog - 极简模块化日记
 * Copyright (c) 2025 ChenHanyi
 * Licensed under CC BY-NC-SA 4.0 (Non-Commercial Use Only)
 */
import { useState, useEffect } from "react";
import { TAG_OPTIONS } from "./constants/tags";
import Editor from "./components/Editor";
import EntryList from "./components/EntryList";
import TagView from "./components/TagView";
import DetailView from "./components/DetailView";
import Auth from "./components/Auth";
import AdminAuth from "./components/AdminAuth";
import AdminDashboard from "./components/AdminDashboard";
import CalendarView from "./components/CalendarView";
import SummaryView from "./components/SummaryView";
import diaryService from "./api/diaryService";
import { generateId } from "./utils/helpers";

// 4. 主程序
const App = () => {
  const [view, setView] = useState("list"); // list, calendar, summary, edit, tag, detail, admin
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [authed, setAuthed] = useState(!!localStorage.getItem("lifelog_token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);

  // 1. 获取数据
  const fetchEntries = async () => {
    try {
      const data = await diaryService.getAll();
      setEntries(data);
    } catch {
      alert("读取数据失败");
    }
  };

  // 2. 保存逻辑
  const saveEntry = async (newEntry) => {
    try {
      if (entries.some((e) => e.id === newEntry.id)) {
        await diaryService.update(newEntry.id, newEntry);
      } else {
        await diaryService.create(newEntry);
      }
      await fetchEntries(); // 刷新
      setView("list");
      setCurrentEntry(null);
    } catch {
      alert("保存失败");
    }
  };

  // 3. 删除逻辑
  const deleteEntry = async (id) => {
    try {
      const ok = await diaryService.delete(id);
      if (!ok) throw new Error("删除失败");
      await fetchEntries(); // 刷新
      setView("list");
      setCurrentEntry(null);
    } catch (err) {
      alert(err.message || "删除失败");
    }
  };

  // 4. 手动更新 AI 回信
  const updateAIReply = async (id) => {
    try {
      await diaryService.updateAIReply(id);
      // 由于是异步触发，前端提示用户即可
      alert("💌 信件已寄出，小含读完就会回信啦~");
    } catch (err) {
      alert(err?.message || "寄信失败，请检查网络");
    }
  };

  // 页面初始化时调用
  useEffect(() => {
    if (authed) {
      fetchEntries();
      // 检查是否是管理员
      const user = localStorage.getItem("lifelog_user");
      if (user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.isAdmin || false);
      }
    }
  }, [authed]);

  // --- 导出数据功能 ---
  const handleExportData = async () => {
    // 1. 直接从 Service 获取最新数据
    const data = await diaryService.getAll();

    if (!data || data.length === 0) {
      alert("服务器中暂无数据可导出");
      return;
    }

    // 2. 准备 Blob 对象（文件内容）
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], {
      type: "application/json;charset=utf-8",
    });

    // 3. 创建下载链接并触发点击
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `LifeLog_备份_${new Date().toISOString().split("T")[0]}.json`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // 释放内存
  };

  // --- 导入数据功能 ---
  const handleImportData = () => {
    // 创建文件输入框
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // 只允许选择 JSON 文件

    // 监听文件选择后的事件
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return; // 如果没有选择文件，直接返回

      // 读取完成后的回调
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target.result;
          const importedData = JSON.parse(result);
          if (!Array.isArray(importedData)) {
            throw new Error("格式错误：导入的数据必须是数组");
          }
          // 导入前先确认
          if (
            !window.confirm(
              `准备合并 ${importedData.length} 条数据，相同 ID 将被覆盖，是否继续？`,
            )
          ) {
            return;
          }

          // 1. 获取当前数据库中所有的 ID，存入 Set 方便快速查找
          const currentEntries = await diaryService.getAll();
          const existingIds = new Set(currentEntries.map((e) => e.id));

          // 2. 遍历导入的数据
          for (const item of importedData) {
            if (existingIds.has(item.id)) {
              // 如果 ID 已存在，先删除旧的
              await diaryService.delete(item.id);
            }
            // 插入新数据
            await diaryService.create(item);
          }

          // 3. 提示用户并刷新页面以加载新数据
          alert(`导入成功！合并导入 ${importedData.length} 篇日记。`);
          await fetchEntries(); // 刷新 UI
        } catch (err) {
          console.error(err);
          alert("文件解析失败，请确认文件格式是否正确。");
        }
      };

      // 读取文件内容
      reader.readAsText(file);
    };

    // 触发文件选择框
    input.click();
  };

  // 路由控制
  const startEdit = (payload = null) => {
    // 场景 A：从日历点击空白格传入了日期字符串 (例如 "2026-03-20")
    if (typeof payload === "string") {
      setCurrentEntry({
        id: generateId(),
        date: payload, // 直接锁定日历传来的日期
        title: "",
        blocks: [{ id: generateId(), tag: "schedule", content: "" }],
      });
    }
    // 场景 B：点击列表进入编辑 (传入的是已有的 entry 对象)
    else if (payload && typeof payload === "object") {
      setCurrentEntry(payload);
    }
    // 场景 C：点击顶部的“写日记” (传入 null)
    else {
      setCurrentEntry(null); // Editor 内部会默认处理为“今天”
    }

    setView("edit");
  };
  const openDetail = (entry = null) => {
    setCurrentEntry(entry);
    setView("detail");
  };

  const openTagView = (tagId) => {
    setActiveTag(tagId);
    setView("tag");
  };

  const quickEdit = (dateStr) => {
    setCurrentEntry({ date: dateStr, title: "", blocks: [] }); // 创建一个带日期的新日记对象
    setView("edit");
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {!authed && (
        <>
          {!showAdminAuth ? (
            <Auth
              onAuthed={() => {
                setAuthed(true);
                setView("list");
              }}
            />
          ) : (
            <AdminAuth
              onAuthed={() => {
                setAuthed(true);
                setIsAdmin(true);
                setView("admin");
              }}
            />
          )}
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAdminAuth(!showAdminAuth)}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {showAdminAuth ? "返回普通用户登录" : "管理员登录"}
            </button>
          </div>
        </>
      )}
      {authed && (
        <>
          <header className="sticky top-0 z-50 bg-white/45 supports-[backdrop-filter]:bg-white/35 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_24px_rgba(15,23,42,0.06)] mb-6">
            <div className="px-4 md:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
              <div
                className="flex items-center gap-3 cursor-pointer group justify-self-start"
                onClick={() => setView("list")}
              >
                <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:rotate-12 transition-transform">
                  L
                </div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  LifeLog
                </h1>
              </div>

              <div className="justify-self-center">
                <div className="hidden md:flex items-center gap-8">
                  {[
                    { id: "list", label: "列表" },
                    { id: "calendar", label: "日历" },
                    { id: "summary", label: "汇总" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`text-[18px] font-medium tracking-wide transition-all ${
                        view === item.id
                          ? "text-slate-800"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3 justify-self-end">
                <div className="md:hidden flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  {[
                    { id: "list", label: "列表" },
                    { id: "calendar", label: "日历" },
                    { id: "summary", label: "汇总" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        view === item.id
                          ? "bg-white text-black shadow-sm"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setView("admin")}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                    title="管理员控制台"
                  >
                    <i className="fas fa-cog text-xs"></i>
                    <span className="hidden sm:inline">管理</span>
                  </button>
                )}
                <button
                  onClick={() => startEdit()}
                  className="bg-black hover:bg-gray-800 text-white px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <i className="fas fa-plus text-xs"></i>
                  <span className="hidden sm:inline">写日记</span>
                </button>
                <div className="hidden sm:flex gap-1">
                  <button
                    onClick={() => handleExportData()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                    title="导出备份"
                  >
                    <i className="fas fa-download text-xs"></i>
                  </button>
                  <button
                    onClick={handleImportData}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                    title="导入备份"
                  >
                    <i className="fas fa-upload text-xs"></i>
                  </button>
                </div>
                <button
                  onClick={() => {
                    diaryService.logout();
                    setAuthed(false);
                    setIsAdmin(false);
                    setEntries([]);
                    setView("list");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm"
                  title="退出登录"
                >
                  退出
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 md:px-6 pb-8">
            <main className="max-w-6xl mx-auto">
            {/* list/tag 都复用同一侧边布局：保证宽度一致、滚动时圆点始终可见 */}
            {(view === "list" || view === "tag") && (
              <div className="flex gap-6 items-start">
                {/* 侧边筛选栏（随滚动保持可见） */}
                <aside className="hidden lg:block w-10 shrink-0">
                  <div className="sticky top-24 bg-white/60 supports-[backdrop-filter]:bg-white/35 backdrop-blur-xl border border-white/40 rounded-2xl px-1.5 py-2 flex flex-col gap-2">
                    {/* 第一个圆点：展示所有卡片（与点“列表”效果一致） */}
                    <button
                      onClick={() => {
                        setActiveTag(null);
                        setView("list");
                      }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        view === "list"
                          ? "bg-gray-200"
                          : "hover:bg-gray-100"
                      }`}
                      title="查看所有卡片"
                    >
                      <i className="fas fa-circle text-[6px] text-gray-500"></i>
                    </button>

                    {TAG_OPTIONS.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => openTagView(tag.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          view === "tag" && activeTag === tag.id
                            ? "bg-gray-200"
                            : "hover:bg-gray-100"
                        }`}
                        title={`查看所有${tag.label}`}
                      >
                        <i
                          className={`fas fa-circle text-[6px] ${tag.color.split(" ")[1]}`}
                        ></i>
                      </button>
                    ))}
                  </div>
                </aside>

                {/* 保证 list 卡片区域 & tag block 区域宽度/起始位置一致 */}
                <div className="flex-1 min-w-0">
                  {view === "list" ? (
                    <EntryList entries={entries} onEdit={openDetail} />
                  ) : (
                    <TagView
                      entries={entries}
                      tagId={activeTag}
                      onClose={() => setView("list")}
                    />
                  )}
                </div>
              </div>
            )}
            {/*  当 view 等于 "calendar" 时，渲染一个 CalendarView组件*/}
            {view === "calendar" && (
              <CalendarView
                entries={entries}
                onViewDetail={(e) => {
                  setCurrentEntry(e);
                  setView("detail");
                }}
                onQuickEdit={quickEdit}
              />
            )}
            {view === "summary" && <SummaryView entries={entries} />}
            {/*  当 view 等于 "edit" 时，渲染一个 Editor组件*/}
            {view === "edit" && (
              <Editor
                entry={currentEntry}
                onSave={saveEntry}
                onCancel={() => setView("list")}
              />
            )}
            {/* view === "tag" 已在上面的 list/tag 统一布局中渲染 */}
            {/*  当 view 等于 "tag" 时，渲染一个 DetailView组件*/}
            {view === "detail" && (
              <DetailView
                entry={currentEntry}
                onBack={() => setView("list")}
                onEdit={() => setView("edit")} // 从详情页点编辑，再切到编辑器
                onDelete={deleteEntry}
                onSendToXiaohan={updateAIReply}
              />
            )}
            {/*  当 view 等于 "admin" 时，渲染管理员控制台*/}
            {view === "admin" && <AdminDashboard />}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
