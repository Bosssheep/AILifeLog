import { useState } from "react";
import { TAG_OPTIONS } from "../constants/tags";
import { getCalendarDays, formatISO } from "../utils/helpers";

const CalendarView = ({ entries, onViewDetail, onQuickEdit }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = getCalendarDays(year, month);
  const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

  const isRealToday = (day) => {
    const today = new Date();
    return (
      day &&
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const getEntryByDay = (day) => {
    if (!day) return null;
    const dateStr = formatISO(year, month, day);
    return entries.find((e) => e.date === dateStr);
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10">
        {/* --- 重新设计的 PM 级 Header --- */}
        <div className="flex items-center justify-between mb-10 px-2">
          {/* 左侧控制 */}
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>

          {/* 中间时间显示：年份与月份同行 */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">
              {month + 1}月
            </span>
            <span className="text-sm font-medium text-slate-400">{year}</span>
          </div>

          {/* 右侧控制组 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewDate(new Date())}
              className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                new Date().getMonth() === month &&
                new Date().getFullYear() === year
                  ? "text-slate-300 cursor-default"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
            >
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>

        {/* 星期表头：使用更淡的字色，突出日期主体 */}
        <div className="grid grid-cols-7 mb-6">
          {weekdays.map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest"
            >
              {d}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, idx) => {
            const entry = getEntryByDay(day);
            const isToday = isRealToday(day);

            return (
              <div key={idx} className="relative aspect-square group">
                {day ? (
                  <div
                    onClick={() =>
                      entry
                        ? onViewDetail(entry)
                        : onQuickEdit(formatISO(year, month, day))
                    }
                    className={`
                      w-full h-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2
                      ${
                        entry
                          ? "bg-blue-50/50 border-blue-100 hover:border-blue-300 hover:bg-blue-50 shadow-sm"
                          : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-400"
                      }
                      ${isToday ? "border-slate-900 scale-[1.05] z-10 shadow-lg !bg-white" : ""}
                    `}
                  >
                    <span
                      className={`text-sm font-bold ${isToday ? "text-slate-900" : entry ? "text-blue-600" : ""}`}
                    >
                      {day}
                    </span>
                    {entry && (
                      <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
                    )}
                    {/* 悬停预览：升级为多维度信息缩略 */}
                    {entry && (
                      <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute z-50 bottom-[115%] left-1/2 -translate-x-1/2 w-96 p-4 bg-white rounded-3xl shadow-2xl border border-slate-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        {/* 标题 */}
                        <h4 className="font-bold text-slate-800 text-sm mb-3 truncate border-b border-slate-50 pb-2">
                          {entry.title || "记录生活的一天"}
                        </h4>

                        {/* --- 已经弃用的旧版标签展示逻辑，暂时注释掉 ---
                        中间：标签缩略展示 (Mini-pills) 
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Array.from(
                            new Set(entry.blocks.map((b) => b.tag)),
                          ).map((tagId) => {
                            const tagCfg = TAG_OPTIONS.find(
                              (t) => t.id === tagId,
                            );
                            return tagCfg ? (
                              <span
                                key={tagId}
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tagCfg.color.replace("bg-", "text-").replace(" ", " border-")}`}
                              >
                                {tagCfg.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                        --------------------------------------------- */}

                        {/* 内容摘要 */}
                        <div className="space-y-2">
                          {entry.blocks.map((block, bIdx) => {
                            const tagCfg = TAG_OPTIONS.find(
                              (t) => t.id === block.tag,
                            );

                            return (
                              <div
                                key={bIdx}
                                className="flex items-start gap-1 text-[11px] leading-tight mb-1.5"
                              >
                                {/* 1. w-[60px]: 固定宽度，确保后面的内容起始点统一 */}
                                {/* 2. text-left: 确保标签的开头（左侧）对齐 */}
                                {/* 3. truncate: 万一标签名改得特别长，也不会撑破布局 */}
                                <span className="shrink-0 w-[70px] text-left font-bold text-slate-400 truncate">
                                  {tagCfg?.label || "记录"}:
                                </span>

                                {/* 4. flex-1: 内容自动填满剩余空间，且起始位置完全一致 */}
                                <p className="text-slate-500 line-clamp-2 flex-1">
                                  {block.content || "..."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        {/* 底部三角形 */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
                      </div>
                    )}{" "}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
