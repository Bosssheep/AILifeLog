export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatDate = (str) =>
  new Date(str).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

// 获取日历矩阵：考虑周一作为一周开始
export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // 转换周首日：JS默认0是周日，我们希望1是周一
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
};

// 格式化日期为 YYYY-MM-DD，确保补零
export const formatISO = (year, month, day) => {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
};
