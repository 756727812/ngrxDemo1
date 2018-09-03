/**
 * 加挂属性模态框
 */

modalAddAttrToClassController.$inject = ['$scope', '$uibModalInstance', 'class_name', 'attr', 'type'];
export function modalAddAttrToClassController($scope, $uibModalInstance, class_name, attr, type) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.class_name = class_name;
  $scope.attr = attr;
  $scope.type = type;
  $scope.errors = [];
  $scope.formData = {
    is_required: attr.is_required,
    is_sell_property: attr.is_sell_property,
    is_support_add_image: attr.is_support_add_image,
    // order_weight: attr.order_weight,
  };
  $scope.$watch('formData.is_sell_property', function (cur, prev) {
    if (cur === 1) {
      $scope.formData.is_required = 1;
    }
  });

  $scope.ok = function () {
    $scope.errors = [];
    typeof $scope.formData.is_required === 'undefined' && $scope.errors.push('请选择该属性项是否必填！');
    if ($scope.type === 'edit' && (attr.attr_type === '2' || attr.attr_type === '5' || attr.attr_type === '6')) {
      typeof $scope.formData.is_sell_property === 'undefined' && $scope.errors.push('请选择该属性项是否为销售属性！');

    }
    if ($scope.formData.is_sell_property === 1) {
      typeof $scope.formData.is_support_add_image === 'undefined' && $scope.errors.push('请选择该属性项是否支持配图！');
    }
    if ($scope.errors.length > 0) return;
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

