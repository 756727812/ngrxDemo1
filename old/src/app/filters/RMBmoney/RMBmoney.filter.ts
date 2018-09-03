export const RMBmoney = () =>
  str => {
    if (str == null || str == "undefined") { return '' }
    return "¥ " + parseFloat(str).toFixed(2)
  }