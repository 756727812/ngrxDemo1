addNewBrandCtrl.$inject = ['$uibModalInstance', '$scope', 'brand_name'];
export function addNewBrandCtrl($uibModalInstance, $scope, brand_name) {
  let anbc = this;
  anbc.formData = {
    image: null,
    brand_name,
  };
  $scope.uploadLogo = function (res) {
    if (res.result == 1) {
      anbc.formData.brand_imgurl = res.data;
    }
  };
  anbc.ok = function () {
    anbc.errors = [];
    if (!anbc.formData.brand_name) anbc.errors.push('请填写品牌名称！');
    if (!anbc.formData.brand_imgurl) anbc.errors.push('请上传品牌LOGO！');
    if (!anbc.formData.brand_desc) anbc.errors.push('请填写品牌简介！');
    if (anbc.errors.length > 0) return;
    $uibModalInstance.close(anbc.formData);
  };
  anbc.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
