# 📅 产品功能规格文档 - 汇总页心情评分与情绪曲线（SummaryView）

| 属性         | 内容                 |
| :----------- | :------------------- |
| **版本**     | v4.1 汇总页增强 |
| **状态**     | 已实现（Implemented） |
| **最后更新** | 2026-03-25           |
| **撰写人**   | Owner                |

---

## 1. 功能概述 (Feature Overview)

`summary` 视图在全局汇总范围内展示用户的“心情评分”趋势，并以折线图形式呈现情绪变化曲线。

- 支持按 `日` / `周` / `年度` 切换时间粒度
- 支持在不同时间范围间前后切换（上一段 / 下一段 / Today）
- 折线图悬停显示具体日期/区间与评分详情

---

## 2. 数据来源 (Data Source)

评分来自 AI Agent 生成的回信内容块（block）的 `reply` 标签：

1. 在每个 `entry` 中查找 `blocks` 里 `tag === "reply"` 的 block
2. 从该 block 的 `metadata` / `sentiment` / 直接字段中解析评分：
   - `reply.metadata.sentiment.score`
   - `reply.metadata.score`
   - `reply.sentiment.score`
   - `reply.score`
3. 若解析不到有效数值，则该 entry 在图表中被自动忽略

---

## 3. 核心交互流程 (User Journey)

1. 用户进入 `summary` 视图
2. 选择时间粒度（`日` / `周` / `年度`）
3. 点击前后按钮或 `Today`，切换当前展示范围
4. 在折线图上移动鼠标，查看具体点位对应的日期/区间与情绪分值

---

## 4. 图表计算逻辑 (Chart Logic)

折线图由 `series.points` 生成，点位计算规则因 `scoreView` 不同而变化：

- `day`：以“当前月份内的每一天”聚合
- `week`：以“周一为起点”的周区间聚合（按周均值）
- `year`：以“年份内每个月”聚合（按月均值）

图表展示的 Y 轴语义为 0~10（最低为“🌧️”，中间为“☁️”，高分为“✨”）。

---

## 5. UI/UX 规范 (Visual Standards)

- 页面标题：`心情曲线❤️`
- 左上/右上时间切换按钮：上一段、Today、下一段
- 时间粒度切换条：`日` / `周` / `年度`
- 空状态：当前范围内暂无可用 score 时展示说明文案
- 交互：点位悬停时显示玻璃质感 tooltip（含 label、date、score）

---

## 6. 验收标准 (Acceptance Criteria)

1. `summary` 页能正常渲染折线图
2. 粒度切换（`日`/`周`/`年度`）后图表随之重算并刷新
3. 前后切换与 `Today` 能正确改变展示范围
4. 当范围内存在 AI 评分时，tooltip 能显示正确的 `label/date/score`
5. 当范围内不存在 AI 评分时，展示空状态文案而非报错

---

## 7. 实现要点 (Implementation Notes)

- 实现位于：`src/components/SummaryView.jsx`
- `getEntryScore(entry)` 负责从 `reply` block 里提取可解析的分值
- `series` 负责按粒度对 points 做聚合与排序

