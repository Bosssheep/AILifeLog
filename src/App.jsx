/**
 * LifeLog - 极简模块化日记
 * Copyright (c) 2025 ChenHanyi
 * Licensed under CC BY-NC-SA 4.0 (Non-Commercial Use Only)
 */

import { useState, useEffect, useMemo } from "react";

// --- 配置常量 ---
const TAG_OPTIONS = [
  {
    id: "schedule",
    label: "📅 今日小记",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "thoughts",
    label: "🥳 碎碎念/心情",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    id: "growth",
    label: "💡 想法/成长",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "gratitude",
    label: "🙏 幸福/感恩",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  {
    id: "exercise",
    label: "🏋️ 运动/减肥",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    id: "reading",
    label: "📚 阅读/电影",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

// 2. 工具函数 (保持不变)
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (str) =>
  new Date(str).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

// 3. 子组件 (将 TagView, Editor, EntryList 放在 App 外部或拆分文件)
// --- React组件: 按标签分类展示Block视图 ---
const TagView = ({ entries, tagId, onClose }) => {
  const tagInfo = TAG_OPTIONS.find((t) => t.id === tagId);

  // 筛选出包含该标签的所有内容块，并按时间排序
  const filteredBlocks = entries
    .flatMap((entry) => {
      return entry.blocks
        .filter((block) => block.tag === tagId)
        .map((block) => ({
          ...block,
          entryDate: entry.date,
          entryTitle: entry.title,
          entryId: entry.id,
        }));
    })
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));

  // 在页面中展示
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className={`px-3 py-1 rounded text-sm ${tagInfo.color}`}>
            {tagInfo.label}
          </span>
          <span>的时间线</span>
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {filteredBlocks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          还没有关于这个标签的记录哦
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pb-10">
          {filteredBlocks.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4"
            >
              <div className="flex-shrink-0 w-24 text-right pt-1">
                <div className="text-sm font-bold text-gray-800">
                  {item.entryDate}
                </div>
              </div>
              <div className="flex-grow border-l-2 border-gray-200 pl-4">
                <div className="text-xs text-gray-400 mb-1">
                  {item.entryTitle}
                </div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 核心React组件: 编辑器（写日记的页面） ---
const Editor = ({ entry, onSave, onCancel }) => {
  // 定义数据
  const [title, setTitle] = useState(entry ? entry.title : "");
  const [date, setDate] = useState(
    entry ? entry.date : new Date().toISOString().split("T")[0],
  );
  const [blocks, setBlocks] = useState(
    entry ? entry.blocks : [{ id: generateId(), tag: "schedule", content: "" }],
  );

  // Block增减操作函数
  const addBlock = (tag) => {
    setBlocks([...blocks, { id: generateId(), tag, content: "" }]);
  };

  const removeBlock = (id) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const updateBlockContent = (id, content) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  // Save操作函数
  const handleSave = () => {
    if (!title.trim() && blocks.every((b) => !b.content.trim())) {
      alert("写点什么再保存吧！");
      return;
    }
    onSave({
      id: entry ? entry.id : generateId(),
      title: title || "无题日记",
      date,
      lastModified: new Date().toISOString(),
      blocks,
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-[80vh] p-8 rounded-2xl shadow-lg border border-gray-100 relative">
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
        >
          取消
        </button>
        <div className="text-sm text-gray-400">
          {entry ? "编辑模式" : "新的一天"}
        </div>
        <button
          onClick={handleSave}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 shadow-lg shadow-gray-200/50 transition-all"
        >
          保存日记
        </button>
      </div>

      {/* 元数据输入 */}
      <div className="mb-8 space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block text-gray-500 font-medium bg-transparent outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="今日标题..."
          className="w-full text-4xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
        />
      </div>

      {/* 动态内容块区域 */}
      <div className="space-y-6 mb-12">
        {blocks.map((block, index) => {
          const tagStyle =
            TAG_OPTIONS.find((t) => t.id === block.tag) || TAG_OPTIONS[0];
          return (
            <div key={block.id} className="group relative">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${tagStyle.color}`}
                >
                  {tagStyle.label}
                </span>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="删除此块"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <textarea
                value={block.content}
                onChange={(e) => updateBlockContent(block.id, e.target.value)}
                placeholder={`记录你的${tagStyle.label.split(" ")[1]}...`}
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-gray-200 outline-none resize-none text-gray-700 leading-relaxed transition-all"
                rows="4"
              />
            </div>
          );
        })}
      </div>

      {/* 添加新块按钮 */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur border border-gray-100 shadow-xl rounded-xl p-3 flex gap-2 justify-center items-center">
        <span className="text-xs text-gray-400 font-bold mr-2">添加模块:</span>
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag.id}
            onClick={() => addBlock(tag.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all text-gray-600 whitespace-nowrap"
          >
            + {tag.label.split(" ")[1]}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- React组件: 日记列表 ---
const EntryList = ({ entries, onEdit, onViewTag }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📒</div>
        <h3 className="text-xl font-bold text-gray-700">开启你的第一篇日记</h3>
        <p className="text-gray-400 mt-2">记录当下，为了更好的未来。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 pb-20">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onEdit(entry)}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm card-hover cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {formatDate(entry.date)}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {entry.title}
              </h3>
            </div>
            <span className="text-gray-300 group-hover:text-blue-400">
              <i className="fas fa-pen"></i>
            </span>
          </div>

          {/* 缩略内容展示 - 只显示前两个块 */}
          <div className="space-y-3">
            {entry.blocks.slice(0, 3).map((block) => {
              if (!block.content.trim()) return null;
              const tagInfo = TAG_OPTIONS.find((t) => t.id === block.tag);
              return (
                <div key={block.id} className="flex gap-3 items-baseline">
                  <span
                    className={`flex-shrink-0 w-2 h-2 rounded-full ${tagInfo.color.split(" ")[0].replace("bg-", "bg-")}`}
                    style={{ backgroundColor: "currentColor" }}
                  ></span>
                  <p className="text-gray-600 text-sm line-clamp-2 flex-grow">
                    <span className="font-bold text-gray-400 mr-2 text-xs">
                      [{tagInfo.label.split(" ")[1]}]
                    </span>
                    {block.content}
                  </p>
                </div>
              );
            })}
            {entry.blocks.length > 3 && (
              <div className="text-xs text-gray-400 pl-5">
                ... 还有 {entry.blocks.length - 3} 个内容
              </div>
            )}
          </div>

          {/* 底部标签汇总 - 点击可跳转到 Tag View */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
            {Array.from(new Set(entry.blocks.map((b) => b.tag))).map(
              (tagId) => {
                const t = TAG_OPTIONS.find((o) => o.id === tagId);
                return (
                  <button
                    key={tagId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTag(tagId);
                    }}
                    className={`text-xs px-2 py-0.5 rounded border ${t.color} bg-opacity-50 hover:bg-opacity-100 transition-all`}
                  >
                    {t.label}
                  </button>
                );
              },
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

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
            onEdit={startEdit}
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
      </main>
    </div>
  );
};

export default App;
