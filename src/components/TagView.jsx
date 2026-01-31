import { TAG_OPTIONS } from "../constants/tags";
// --- React组件: 按标签分类展示Block视图 ---
const TagView = ({ entries, tagId, onClose }) => {
  const tagInfo = TAG_OPTIONS.find((t) => t.id === tagId) || {
    // 增加一层兜底，防止找不到标签
    label: "未知标签",
    color: "bg-gray-100 text-gray-800",
  };

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

export default TagView;
