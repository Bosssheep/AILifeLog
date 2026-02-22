import { useState } from "react";
import { TAG_OPTIONS } from "../constants/tags";
import { generateId } from "../utils/helpers"; // <--- 添加这一行
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
      // 如果是老条目，保留原有的 lastModified；如果是新条目，才生成新时间
      lastModified: entry ? entry.lastModified : new Date().toISOString(),
      blocks,
    });
  };

  return (
    <div
      className="max-w-3xl mx-auto bg-white min-h-[80vh] p-8 rounded-2xl shadow-lg border border-gray-100 relative"
      data-testid="editor-container"
    >
      {/* 顶部操作栏 */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-100"
          data-testid="cancel-btn"
        >
          取消
        </button>
        <div className="text-sm text-gray-400">
          {entry ? "编辑模式" : "新的一天"}
        </div>
        <button
          onClick={handleSave}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 shadow-lg shadow-gray-200/50 transition-all"
          data-testid="save-btn"
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
          data-testid="date-input"
          className="block text-gray-500 font-medium bg-transparent outline-none"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="今日标题..."
          data-testid="title-input"
          className="w-full text-4xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
        />
      </div>

      {/* 动态内容块区域 */}
      <div className="space-y-6 mb-12" data-testid="blocks-list">
        {blocks.map((block, index) => {
          const tagStyle =
            TAG_OPTIONS.find((t) => t.id === block.tag) || TAG_OPTIONS[0];
          return (
            <div
              key={block.id}
              className="group relative"
              data-testid="content-block"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${tagStyle.color}`}
                >
                  {tagStyle.label}
                </span>
                <button
                  onClick={() => removeBlock(block.id)}
                  data-testid={`remove-block-${index}`}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="删除此块"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
              <textarea
                value={block.content}
                data-testid={`block-textarea-${index}`}
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
            data-testid={`add-tag-${tag.id}`}
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

export default Editor;
