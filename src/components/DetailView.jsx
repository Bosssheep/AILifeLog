import { TAG_OPTIONS } from "../constants/tags";
import { formatDate } from "../utils/helpers";

const DetailView = ({ entry, onBack, onEdit }) => {
  if (!entry) return null;

  return (
    <div className="max-w-3xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 顶部操作栏：简洁、半透明 */}
      <div className="flex justify-between items-center mb-8 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors group"
        >
          <i className="fas fa-arrow-left text-sm group-hover:-translate-x-1 transition-transform"></i>
          <span className="text-sm font-medium">返回</span>
        </button>

        <button
          onClick={onEdit}
          className="bg-gray-100 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
        >
          <i className="fas fa-edit mr-2"></i>
          编辑
        </button>
      </div>

      {/* 日记主体卡片 */}
      <article className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* 头部：日期与标题 */}
        <header className="px-8 pt-10 pb-8 md:px-12 border-b border-slate-50">
          <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">
            {formatDate(entry.date)}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            {entry.title || "无标题日记"}
          </h1>
        </header>
        {/* 内容区：模块化渲染 */}
        <div className="px-8 pt-5 pb-10 md:px-12 space-y-12">
          {entry.blocks.map((block) => {
            const tagStyle = TAG_OPTIONS.find((t) => t.id === block.tag);
            if (!block.content?.trim()) return null;

            return (
              <section key={block.id} className="relative">
                {/* 强化后的标签：更大、带背景色、更醒目 */}
                <div className="flex items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${tagStyle?.color} // 直接复用配置中的背景和文字颜色`}
                  >
                    {tagStyle?.label}
                  </span>
                </div>

                {/* 正文：保持 base 到 lg 的舒适字号 */}
                <div className="text-base md:text-x text-slate-700 leading-relaxed font-sans whitespace-pre-wrap pl-1">
                  {block.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* 底部信息：元数据 */}
        <footer className="px-8 py-6 md:px-12 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
          <div className="text-[10px] text-slate-400 font-medium">
            LAST MODIFIED:{" "}
            {new Date(entry.lastModified).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex -space-x-1">
            {Array.from(new Set(entry.blocks.map((b) => b.tag))).map(
              (tagId) => {
                const t = TAG_OPTIONS.find((o) => o.id === tagId);
                return (
                  <div
                    key={tagId}
                    title={t?.label}
                    className={`w-5 h-5 rounded-full border-2 border-white ${t?.color.split(" ")[0]}`}
                  ></div>
                );
              },
            )}
          </div>
        </footer>
      </article>

      {/* 底部装饰：引用感小语 */}
      <div className="mt-8 text-center">
        <span className="text-slate-200 text-2xl font-serif">“</span>
        <span className="text-slate-400 text-xs tracking-[0.2em] px-4 uppercase font-medium">
          End of Entry
        </span>
        <span className="text-slate-200 text-2xl font-serif">”</span>
      </div>
    </div>
  );
};

export default DetailView;
