import { TAG_OPTIONS } from "../constants/tags";
import { formatDate } from "../utils/helpers";
const EntryList = ({ entries, onEdit }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pb-20">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onEdit(entry)}
          className="bg-white p-8 rounded-xl border border-slate-200/70 shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.10)] hover:-translate-y-0.5 cursor-pointer transition-all duration-300 group min-h-[280px] flex flex-col"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.14em] mb-1">
                {formatDate(entry.date)}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-1">
                {entry.title || "无题"}
              </h3>
            </div>
          </div>

          {/* 缩略内容展示 */}
          <div className="space-y-2.5 flex-1">
            {(entry.blocks || []).slice(0, 3).map((block) => {
              if (!block || !block.content?.trim()) return null;

              const tagInfo = TAG_OPTIONS.find((t) => t.id === block.tag) || {
                label: "❓ 其他",
                color: "bg-gray-100 text-gray-500",
              };

              return (
                <div
                  key={block.id || Math.random()}
                  className="flex gap-2.5 items-baseline"
                >
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${tagInfo.color?.split(" ")[0] || "bg-slate-400"}`}
                  ></span>

                  <p className="text-slate-600 text-sm line-clamp-2 flex-grow">
                    {/* <span className="font-semibold text-slate-400 mr-1.5 text-[11px]">
                      [{displayLabel}]
                    </span> */}
                    {block.content}
                  </p>
                </div>
              );
            })}
            {entry.blocks?.length > 3 && (
              <div className="text-[11px] text-slate-400 pl-4">
                ... 
              </div>
            )}
          </div>

          {/* 底部标签汇总 */}
          <div className="mt-3 pt-3 flex flex-wrap gap-1.5">
            {Array.from(new Set((entry.blocks || []).map((b) => b.tag))).map(
              (tagId) => {
                const t = TAG_OPTIONS.find((o) => o.id === tagId) || {
                  label: "其他",
                  color: "bg-gray-100 text-gray-400",
                };
                return (
                  <div
                    key={tagId}

                    className={`text-[9px] px-2 py-0.5 rounded-md border ${t.color} bg-opacity-30 hover:bg-opacity-100 transition-all`}
                  >
                    {t.label}
                  </div>
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
