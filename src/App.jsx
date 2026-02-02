/**
 * LifeLog - 极简模块化日记
 * Copyright (c) 2025 ChenHanyi
 * Licensed under CC BY-NC-SA 4.0 (Non-Commercial Use Only)
 */
import { useState, useEffect, useMemo } from "react";
import { TAG_OPTIONS } from "./constants/tags";
import Editor from "./components/Editor";
import EntryList from "./components/EntryList";
import TagView from "./components/TagView";
import DetailView from "./components/DetailView";
import CalendarView from "./components/CalendarView";
import diaryService from "./api/diaryService";

// 4. 主程序
const App = () => {
  const [view, setView] = useState("list"); // list, edit, tag
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  // 1. 获取数据
  const fetchEntries = async () => {
    try {
      const data = await diaryService.getAll();
      setEntries(data);
    } catch (err) {
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
    } catch (err) {
      alert("保存失败");
    }
  };

  // 3. 删除逻辑
  const deleteEntry = async (id) => {
    if (window.confirm("确定要删除这篇日记吗？")) {
      try {
        await diaryService.delete(id);
        await fetchEntries(); // 刷新
      } catch (err) {
        alert("删除失败");
      }
    }
  };

  // 页面初始化时调用
  useEffect(() => {
    fetchEntries();
  }, []);

  // // 保存数据V1版本，仅保存到浏览器缓存
  // const saveEntry = (newEntry) => {
  //   let newEntries;
  //   if (entries.find((e) => e.id === newEntry.id)) {
  //     newEntries = entries.map((e) => (e.id === newEntry.id ? newEntry : e));
  //   } else {
  //     newEntries = [newEntry, ...entries];
  //   }
  //   // 排序
  //   newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

  //   setEntries(newEntries);
  //   localStorage.setItem("lifeLogData", JSON.stringify(newEntries));
  //   setView("list");
  //   setCurrentEntry(null);
  // };

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
    <div className="min-h-screen pb-10">
      {/* 侧边栏/导航栏 - 移动端适配为顶部，PC端在侧边会更帅，这里简化为顶部 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* 左侧 Logo 区域 */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView("list")}
          >
            <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold group-hover:rotate-12 transition-transform">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              LifeLog
            </h1>
          </div>

          {/* 右侧操作区域：仅在主视图（列表、日历、标签）时显示 */}
          {(view === "list" ||
            view === "calendar" ||
            view === "tag" ||
            view == "detail") && (
            <div className="flex items-center gap-3 md:gap-4">
              {/* 1. 视图切换器 (Segmented Control) */}
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    view === "list"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="列表视图"
                >
                  <i className="fas fa-list-ul"></i>
                  <span className="hidden lg:inline">列表</span>
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    view === "calendar"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="日历视图"
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span className="hidden lg:inline">日历</span>
                </button>
              </div>

              {/* 2. 标签快捷过滤 (仅在较大屏幕显示) */}
              <div className="hidden sm:flex gap-1 border-r border-gray-200 pr-3 mr-1">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => openTagView(tag.id)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      activeTag === tag.id ? "bg-gray-200" : "hover:bg-gray-100"
                    }`}
                    title={`查看所有${tag.label}`}
                  >
                    <i
                      className={`fas fa-circle text-[6px] ${tag.color.split(" ")[1]}`}
                    ></i>
                  </button>
                ))}
              </div>

              {/* 3. 功能按钮组 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit()}
                  className="bg-black hover:bg-gray-800 text-white px-3 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                >
                  <i className="fas fa-plus text-xs"></i>
                  <span className="hidden sm:inline">写日记</span>
                </button>

                {/* 导入/导出隐藏文字，仅保留图标以节省空间 */}
                <div className="flex gap-1">
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
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 用 view 状态来控制页面切换的“单页面视图控制器”，而不是跳转页面 */}
      <main className="max-w-4xl mx-auto px-4">
        {/* 当 view 等于 "list" 时，渲染一个EntryList组件 */}
        {view === "list" && (
          <EntryList
            entries={entries}
            onEdit={openDetail}
            onViewTag={openTagView}
          />
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
        {/*  当 view 等于 "edit" 时，渲染一个 Editor组件*/}
        {view === "edit" && (
          <Editor
            entry={currentEntry}
            onSave={saveEntry}
            onCancel={() => setView("list")}
          />
        )}
        {/*  当 view 等于 "tag" 时，渲染一个 TagView组件*/}
        {view === "tag" && (
          <TagView
            entries={entries}
            tagId={activeTag}
            onClose={() => setView("list")}
          />
        )}
        {/*  当 view 等于 "tag" 时，渲染一个 DetailView组件*/}
        {view === "detail" && (
          <DetailView
            entry={currentEntry}
            onBack={() => setView("list")}
            onEdit={() => setView("edit")} // 从详情页点编辑，再切到编辑器
          />
        )}
      </main>
    </div>
  );
};

export default App;
