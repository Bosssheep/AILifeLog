export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatDate = (str) =>
  new Date(str).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
