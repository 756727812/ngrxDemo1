export const findDataInArray = () =>
  (str, array, eqfield, returnField) => {
    for (var i in array) {
      if (str == array[i][eqfield]) {
        return array[i][returnField];
      }
    }
    return ""
  }
