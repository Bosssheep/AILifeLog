import { TAG_OPTIONS } from "../constants/tags";
import { formatDate } from "../utils/helpers";
const EntryList = ({ entries, onEdit, onViewTag }) => {
  if (!entries || entries.length === 0) {
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
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                {formatDate(entry.date)}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {entry.title || "无题"}
              </h3>
            </div>
            <span className="text-gray-300 group-hover:text-blue-400">
              <i className="fas fa-pen"></i>
            </span>
          </div>

          {/* 缩略内容展示 */}
          <div className="space-y-3">
            {(entry.blocks || []).slice(0, 3).map((block) => {
              if (!block || !block.content?.trim()) return null;

              const tagInfo = TAG_OPTIONS.find((t) => t.id === block.tag) || {
                label: "❓ 其他",
                color: "bg-gray-100 text-gray-500",
              };

              // 安全解析 Label：如果有空格取第二个，否则取全部
              const displayLabel = tagInfo.label.includes(" ")
                ? tagInfo.label.split(" ")[1]
                : tagInfo.label;

              return (
                <div
                  key={block.id || Math.random()}
                  className="flex gap-3 items-baseline"
                >
                  <span
                    className={`flex-shrink-0 w-2 h-2 rounded-full ${tagInfo.color?.split(" ")[0] || "bg-gray-400"}`}
                  ></span>
                  <p className="text-gray-600 text-sm line-clamp-2 flex-grow">
                    <span className="font-bold text-gray-400 mr-2 text-xs">
                      [{displayLabel}]
                    </span>
                    {block.content}
                  </p>
                </div>
              );
            })}
            {entry.blocks?.length > 3 && (
              <div className="text-xs text-gray-400 pl-5">
                ... 还有 {entry.blocks.length - 3} 个内容
              </div>
            )}
          </div>

          {/* 底部标签汇总 */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
            {Array.from(new Set((entry.blocks || []).map((b) => b.tag))).map(
              (tagId) => {
                const t = TAG_OPTIONS.find((o) => o.id === tagId) || {
                  label: "其他",
                  color: "bg-gray-100 text-gray-400",
                };
                return (
                  <button
                    key={tagId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewTag(tagId);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded border ${t.color} bg-opacity-30 hover:bg-opacity-100 transition-all`}
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

export default EntryList;
