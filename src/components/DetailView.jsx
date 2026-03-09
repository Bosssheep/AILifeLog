import { TAG_OPTIONS } from "../constants/tags";
import { formatDate } from "../utils/helpers";

const DetailView = ({ entry, onBack, onEdit, onDelete, onSendToXiaohan }) => {
  if (!entry) return null;

  const handleDelete = () => {
    if (window.confirm("🗑️ 确定要永久删除这篇日记吗？此操作不可撤销。")) {
      onDelete(entry.id);
    }
  };

  const handleSend = () => {
    onSendToXiaohan(entry.id);
  };

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

        <div className="flex items-center gap-2">
          <button
            onClick={handleSend}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border border-indigo-100"
          >
            <i className="fas fa-paper-plane text-xs"></i>
            寄给小含
          </button>
          <button
            onClick={onEdit}
            className="bg-gray-100 hover:bg-gray-300 text-gray-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          >
            <i className="fas fa-edit mr-2"></i>
            编辑
          </button>
        </div>
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

            // 如果是 AI 回信，渲染特殊样式
            if (block.tag === "reply") {
              return (
                <section
                  key={block.id}
                  className="relative p-8 rounded-3xl bg-[#FFF9E6] border-2 border-[#F3E5AB] shadow-inner transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#F3E5AB 0.5px, transparent 0.5px)",
                    backgroundSize: "20px 20px",
                  }}
                >
                  {/* 信封装饰 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-[#F3E5AB] text-[10px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase">
                    Letter from Xiaohan
                  </div>

                  <div className="flex items-center mb-6">
                    <span className="text-xl mr-2">💌</span>
                    <span className="text-sm font-bold font-serif text-[#8B4513] tracking-wide italic">
                      小含的回信
                    </span>
                  </div>

                  <div className="text-sm md:text-sm text-[#5D4037] leading-relaxed font-serif  whitespace-pre-wrap">
                    {block.content}
                  </div>

                  {/* 底部装饰线 */}
                  <div className="mt-8 pt-4 border-t border-[#F3E5AB]/50 flex justify-between items-center text-[10px] text-[#D4AF37] font-serif italic uppercase tracking-widest">
                    <span>With Love</span>
                    <span>{formatDate(entry.date)}</span>
                  </div>
                </section>
              );
            }

            return (
              <section
                key={block.id}
                className="relative p-6 rounded-2xl transition-all duration-300 hover:bg-slate-50 hover:shadow-sm hover:scale-[1.01]"
              >
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
      <div className="mt-8 text-center flex flex-col items-center gap-6">
        <div>
          <span className="text-slate-200 text-2xl font-serif">“</span>
          <span className="text-slate-400 text-xs tracking-[0.2em] px-4 uppercase font-medium">
            End of Entry
          </span>
          <span className="text-slate-200 text-2xl font-serif">”</span>
        </div>

        {/* 隐蔽的删除按钮 */}
        <button
          onClick={handleDelete}
          className="text-slate-300 hover:text-red-400 text-[10px] tracking-widest uppercase font-medium transition-colors pt-4 border-t border-slate-100 w-24"
        >
          删除日记
        </button>
      </div>
    </div>
  );
};

export default DetailView;
