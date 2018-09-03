export const fixdata = () =>
  (str, i) => {
    let r = parseFloat(str) || 0
    switch (i) {
      case "微指数":
        return r.toFixed(1)
      case "点赞率":
        return r.toFixed(1) + '%'
      case "日均文章数":
        return r.toFixed(0)
      case "日均阅读数":
        return r >= 10000 ? (r / 10000).toFixed(1) + "万" : r
      default:
        return str + ""
    }
  }
