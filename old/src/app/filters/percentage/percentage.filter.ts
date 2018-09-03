export const percentage = () =>
  (str, n) => {
    var strF = parseFloat(str)
    var n = n || 1
    return (strF).toFixed(n) + '%'
  }
