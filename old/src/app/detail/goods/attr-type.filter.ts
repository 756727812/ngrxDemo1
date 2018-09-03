
// angular
//   .module('seego.goods')
//   .filter('attrType', attrType);

export const goodsAttrType = {
  attrType: attrType,
}

function attrType() {
  return attrTypeFilter;

  ////////////////

  function attrTypeFilter(type) {
    return type == 1 && '单选' || type == 2 && '多选' || type == 3 && '数值' || type == 4 && '文本' || type == 5 && '非互斥分组多选' || type == 6 && '互斥分组多选'
  }
}

