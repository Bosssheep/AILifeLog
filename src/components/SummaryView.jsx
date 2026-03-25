import { useState } from "react";
import { formatISO } from "../utils/helpers";

const ScoreLineChart = ({ title, points }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!points || points.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 h-56 flex items-center justify-center text-sm text-slate-400">
        当前范围内暂无 score（已自动忽略无 score 的记录）
      </div>
    );
  }

  const clampScore = (value) => Math.max(0, Math.min(10, value));

  const W = 900;
  const H = 220;
  const padX = 72;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const min = 0;
  const max = 10;

  const xAt = (i) =>
    points.length === 1
      ? padX + innerW / 2
      : padX + (innerW * i) / (points.length - 1);
  const yAt = (v) => padY + ((max - v) * innerH) / (max - min);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(clampScore(p.score))}`)
    .join(" ");

  const getMoodEmoji = (score) => {
    if (score >= 8) return "✨";
    if (score >= 5) return "☁️";
    return "🌧️";
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="text-xs text-slate-400">有效点数：{points.length}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
        <defs>
          <linearGradient id="summaryScoreLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="glassTooltipFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="100%" stopColor="rgba(226,232,240,0.18)" />
          </linearGradient>
          <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="10"
              floodColor="rgba(15,23,42,0.22)"
            />
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padY + innerH * t}
            y2={padY + innerH * t}
            stroke="#E2E8F0"
            strokeWidth="2"
            strokeDasharray="6 10"
          />
        ))}

        {/* Y axis mood scale */}
        <text
          x={8}
          y={yAt(10) + 4}
          fill="#64748B"
          fontSize="14"
          fontWeight="600"
        >
          ✨ 10
        </text>
        <text
          x={8}
          y={yAt(5) + 4}
          fill="#64748B"
          fontSize="14"
          fontWeight="600"
        >
          ☁️ 5
        </text>
        <text
          x={8}
          y={yAt(0) + 4}
          fill="#64748B"
          fontSize="14"
          fontWeight="600"
        >
          🌧️ 0
        </text>

        <path
          d={d}
          fill="none"
          stroke="url(#summaryScoreLine)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {points.map((p, i) => (
          <g key={p.key}>
            <circle
              cx={xAt(i)}
              cy={yAt(clampScore(p.score))}
              r={hoveredPoint?.key === p.key ? "12" : "0"}
              fill="#60A5FA"
              opacity={hoveredPoint?.key === p.key ? "0.22" : "0"}
              style={{ transition: "all 180ms ease" }}
            />
            <circle
              cx={xAt(i)}
              cy={yAt(clampScore(p.score))}
              r={hoveredPoint?.key === p.key ? "7" : "5"}
              fill="#2563EB"
              opacity="0.9"
              className="cursor-pointer"
              style={{ transition: "all 180ms ease" }}
              onMouseEnter={() =>
                setHoveredPoint({
                  key: p.key,
                  x: xAt(i),
                  y: yAt(clampScore(p.score)),
                  label: p.label,
                  date: p.key,
                  score: p.score,
                })
              }
              onMouseMove={() =>
                setHoveredPoint({
                  key: p.key,
                  x: xAt(i),
                  y: yAt(clampScore(p.score)),
                  label: p.label,
                  date: p.key,
                  score: p.score,
                })
              }
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}

        <g
          pointerEvents="none"
          opacity={hoveredPoint ? 1 : 0}
          style={{ transition: "opacity 220ms ease" }}
        >
          {hoveredPoint && (
            <>
              <rect
                x={Math.max(110, Math.min(W , hoveredPoint.x - 105))}
                y={Math.max(8, hoveredPoint.y - 70)}
                width="210"
                height="58"
                rx="12"
                fill="url(#glassTooltipFill)"
                stroke="rgba(133, 166, 232, 0.65)"
                strokeWidth="1"
                filter="url(#tooltipShadow)"
                style={{ transition: "all 100ms ease" }}
              />
              <text
                x={Math.max(124, Math.min(W - 216, hoveredPoint.x - 91))}
                y={Math.max(24, hoveredPoint.y - 50)}
                fill="#334155"
                fontSize="11"
                fontWeight="600"
              >
                {`${hoveredPoint.label} · ${hoveredPoint.date}`}
              </text>
              <text
                x={Math.max(124, Math.min(W - 216, hoveredPoint.x - 91))}
                y={Math.max(44, hoveredPoint.y - 30)}
                fill="#0F172A"
                fontSize="13"
                fontWeight="700"
              >
                {`${getMoodEmoji(clampScore(hoveredPoint.score))}  ${Number(hoveredPoint.score).toFixed(2)}`}
              </text>
            </>
          )}
        </g>
      </svg>

      <div className="mt-1 px-8 flex justify-between text-[12px] text-slate-400">
        <span>{points[0].label}</span>
        <span>{points[Math.floor(points.length / 2)].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
};

const SummaryView = ({ entries }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [scoreView, setScoreView] = useState("day"); // day | week | year

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getEntryScore = (entry) => {
    if (!entry?.blocks) return null;
    const reply = entry.blocks.find((b) => b?.tag === "reply");
    const raw =
      reply?.metadata?.sentiment?.score ??
      reply?.metadata?.score ??
      reply?.sentiment?.score ??
      reply?.score;
    const score =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
    return Number.isFinite(score) ? score : null;
  };

  const toLocalDate = (isoDateStr) => {
    const [y, m, d] = String(isoDateStr).split("-").map((x) => Number(x));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const getWeekStartMonday = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const scoreEntries = (entries || [])
    .map((entry) => {
      const score = getEntryScore(entry);
      return score == null ? null : { entry, score };
    })
    .filter(Boolean);

  const series = (() => {
    if (scoreView === "day") {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      const points = scoreEntries
        .map(({ entry, score }) => {
          const d = toLocalDate(entry.date);
          if (!d || d < start || d > end) return null;
          return { key: entry.date, label: `${d.getDate()}日`, score };
        })
        .filter(Boolean)
        .sort((a, b) => a.key.localeCompare(b.key));
      return { title: `${year}年${month + 1}月 · 按日`, points };
    }

    if (scoreView === "week") {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      const startWeek = getWeekStartMonday(start);
      const endWeek = getWeekStartMonday(end);
      const endBoundary = new Date(
        endWeek.getFullYear(),
        endWeek.getMonth(),
        endWeek.getDate() + 6,
      );

      const buckets = new Map();
      for (const { entry, score } of scoreEntries) {
        const d = toLocalDate(entry.date);
        if (!d || d < startWeek || d > endBoundary) continue;
        const weekStart = getWeekStartMonday(d);
        const key = formatISO(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate(),
        );
        const cur = buckets.get(key) || { sum: 0, count: 0 };
        cur.sum += score;
        cur.count += 1;
        buckets.set(key, cur);
      }

      const points = [];
      for (
        let ws = new Date(startWeek);
        ws <= endWeek;
        ws.setDate(ws.getDate() + 7)
      ) {
        const key = formatISO(ws.getFullYear(), ws.getMonth(), ws.getDate());
        const b = buckets.get(key);
        if (!b || !b.count) continue;
        const idx =
          Math.floor(
            (ws.getTime() - startWeek.getTime()) / (7 * 24 * 3600 * 1000),
          ) + 1;
        points.push({ key, label: `W${idx}`, score: b.sum / b.count });
      }
      return { title: `${year}年${month + 1}月 · 按周均值`, points };
    }

    const buckets = new Map();
    for (const { entry, score } of scoreEntries) {
      const d = toLocalDate(entry.date);
      if (!d || d.getFullYear() !== year) continue;
      const key = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = buckets.get(key) || { sum: 0, count: 0 };
      cur.sum += score;
      cur.count += 1;
      buckets.set(key, cur);
    }

    const points = [];
    for (let m = 0; m < 12; m++) {
      const key = `${year}-${String(m + 1).padStart(2, "0")}`;
      const b = buckets.get(key);
      if (!b || !b.count) continue;
      points.push({ key, label: `${m + 1}月`, score: b.sum / b.count });
    }
    return { title: `${year}年 · 按月均值（年度）`, points };
  })();

  const periodLabel =
    scoreView === "year" ? `${year}年` : `${year}年${month + 1}月`;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">心情曲线❤️</h2>
            <p className="text-sm text-slate-400 mt-1">{periodLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setViewDate(
                  new Date(
                    year + (scoreView === "year" ? -1 : 0),
                    month + (scoreView === "year" ? 0 : -1),
                    1,
                  ),
                )
              }
              className="w-9 h-9 rounded-full border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => setViewDate(new Date())}
              className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() =>
                setViewDate(
                  new Date(
                    year + (scoreView === "year" ? 1 : 0),
                    month + (scoreView === "year" ? 0 : 1),
                    1,
                  ),
                )
              }
              className="w-9 h-9 rounded-full border border-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-50"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 mb-5 w-fit">
          {[
            { id: "day", label: "日" },
            { id: "week", label: "周" },
            { id: "year", label: "年度" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setScoreView(opt.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scoreView === opt.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <ScoreLineChart title={series.title} points={series.points} />
      </div>
    </div>
  );
};

export default SummaryView;
