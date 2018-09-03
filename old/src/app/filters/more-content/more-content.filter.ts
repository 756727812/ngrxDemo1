export const moreContent = () =>
  (str, length) => {
    length = length || 150;
    if (!str) { return "" }
    return str.substring(0, length) + (str.length >= length ? "..." : "")
  }
