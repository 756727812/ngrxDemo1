export const formatArray = () =>
  (str) => {
    if (str) {
      return decodeURI(JSON.parse(str).toString())
    } else {
      return ""
    }
  }
