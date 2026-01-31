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

// 4. 主程序
const App = () => {
  const [view, setView] = useState("list"); // list, edit, tag
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [activeTag, setActiveTag] = useState(null);

  // 初始化加载数据
  useEffect(() => {
    const saved = localStorage.getItem("lifeLogData");
    if (saved) {
      setEntries(
        JSON.parse(saved).sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    }
  }, []);

  // 保存数据V1版本，仅保存到浏览器缓存
  const saveEntry = (newEntry) => {
    let newEntries;
    if (entries.find((e) => e.id === newEntry.id)) {
      newEntries = entries.map((e) => (e.id === newEntry.id ? newEntry : e));
    } else {
      newEntries = [newEntry, ...entries];
    }
    // 排序
    newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    setEntries(newEntries);
    localStorage.setItem("lifeLogData", JSON.stringify(newEntries));
    setView("list");
    setCurrentEntry(null);
  };

  // 保存数据V2版本，保存到浏览器缓存+自动下载文件本地存储
  const saveDownloadEntry = (newEntry) => {
    let newEntries;
    if (entries.find((e) => e.id === newEntry.id)) {
      newEntries = entries.map((e) => (e.id === newEntry.id ? newEntry : e));
    } else {
      newEntries = [newEntry, ...entries];
    }
    newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    setEntries(newEntries);

    // --- 第一步：保存到浏览器（为了当前网页能立刻读取） ---
    localStorage.setItem("lifeLogData", JSON.stringify(newEntries));

    // --- 第二步：自动下载 JSON 文件（为了跨浏览器/备份） ---
    // 准备数据
    const dataStr = JSON.stringify(newEntries, null, 2);
    const blob = new Blob([dataStr], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    // 创建虚拟链接进行下载
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // 文件名包含日期，方便区分
    link.setAttribute(
      "download",
      `LifeLog_自动备份_${new Date().toISOString().split("T")[0]}.json`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 返回列表页
    setView("list");
    setCurrentEntry(null);
  };

  // --- 导出数据功能 ---
  const handleExportData = () => {
    // 1. 从 localStorage 获取数据
    const savedData = localStorage.getItem("lifeLogData");
    if (!savedData) {
      alert("暂无数据可导出");
      return;
    }

    // 2. 准备 Blob 对象（文件内容）
    const dataStr = JSON.stringify(JSON.parse(savedData), null, 2); // 格式化输出，缩进2格
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

      const reader = new FileReader();

      // 读取完成后的回调
      reader.onload = (event) => {
        try {
          const result = event.target.result;
          const parsedData = JSON.parse(result);

          // 1. 保存到 localStorage
          localStorage.setItem("lifeLogData", JSON.stringify(parsedData));

          // 2. 提示用户并刷新页面以加载新数据
          alert(`导入成功！共导入 ${parsedData.length} 篇日记。`);
          window.location.reload(); // 刷新页面
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
  const startEdit = (entry = null) => {
    setCurrentEntry(entry);
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

  return (
    <div className="min-h-screen pb-10">
      {/* 侧边栏/导航栏 - 移动端适配为顶部，PC端在侧边会更帅，这里简化为顶部 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setView("list")}
          >
            <div className="bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              LifeLog
            </h1>
          </div>

          {(view === "list" || view === "tag") && (
            <div className="flex gap-4">
              <div className="hidden sm:flex gap-1">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => openTagView(tag.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-all"
                    title={`查看所有${tag.label}`}
                  >
                    <i
                      className={`fas fa-circle text-[8px] ${tag.color.split(" ")[1]}`}
                    ></i>
                  </button>
                ))}
              </div>
              <button
                onClick={() => startEdit()}
                className="bg-black hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> 写日记
              </button>
              <button
                onClick={() => handleExportData()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <i className="fas fa-download mr-2"></i> 导出
              </button>
              <button
                onClick={handleImportData}
                className="bg-gray-100 hover:bg-gray-800 text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              >
                <i className="fas fa-upload mr-2"></i> 导入
              </button>
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
