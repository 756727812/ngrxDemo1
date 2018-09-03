import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

const goods = angular.module('seego.goods');

goods.controller('createNewCatModalCtrl', createNewCatModalCtrl);
createNewCatModalCtrl.$inject = ['$scope', '$uibModalInstance', 'lvl', 'parents'];
function createNewCatModalCtrl($scope, $uibModalInstance, lvl, parents) {
  $scope.title = '新建' + lvl + '级品类';
  $scope.parents = parents;
  $scope.lvl = lvl;
  $scope.ok = function () {
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

goods.controller('editCatModalCtrl', editCatModalCtrl);
editCatModalCtrl.$inject = ['$scope', '$uibModalInstance', 'old_name'];
function editCatModalCtrl($scope, $uibModalInstance, old_name) {
  $scope.title = '修改品类名称';
  $scope.old_name = old_name;
  $scope.ok = function () {
    $uibModalInstance.close($scope.formData);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}


// 合集介绍模态框
goods.controller('exampleModalCtrl', exampleModalCtrl);
exampleModalCtrl.$inject = ['$scope', '$uibModalInstance'];
function exampleModalCtrl($scope, $uibModalInstance) {
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}


// 修改商品权重模态框
goods.controller('modalChangeWeightCtrl', modalChangeWeightCtrl);
modalChangeWeightCtrl.$inject = ['$scope', '$uibModalInstance', 'create_time', 'item_weight'];
function modalChangeWeightCtrl($scope, $uibModalInstance, create_time, item_weight) {
  $scope.create_time = create_time;
  $scope.item_weight = item_weight;
  $scope.ok = function () {
    $uibModalInstance.close(encodeURIComponent($scope.new_item_weight));
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 修改商品权重2.0
goods.controller('modalChangeWeightNewCtrl', modalChangeWeightNewCtrl);
modalChangeWeightNewCtrl.$inject = ['$scope', '$uibModalInstance', 'score_info', 'list_set'];
function modalChangeWeightNewCtrl($scope, $uibModalInstance, score_info, list_set) {
  $scope.score_info = score_info;
  $scope.list_set = list_set;
  $scope.ok = function () {
    $uibModalInstance.close($scope.score_info);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

goods.controller('ModalGoodShowUpCtrl', ModalGoodShowUpCtrl);
ModalGoodShowUpCtrl.$inject = ['$scope', '$uibModalInstance', 'good'];
function ModalGoodShowUpCtrl($scope, $uibModalInstance, good) {
  $scope.good = good;
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 商品规则生效/失效
goods.controller('ModalGoodsRuleToggleStatusCtrl', ModalGoodsRuleToggleStatusCtrl);
ModalGoodsRuleToggleStatusCtrl.$inject = ['$scope', '$uibModalInstance', 'rule'];
function ModalGoodsRuleToggleStatusCtrl($scope, $uibModalInstance, rule) {
  $scope.titlewd = rule.is_active == 1 ? '暂停' : '启用';
  $scope.ok = function () {
    $uibModalInstance.close(rule);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 删除商品规则
goods.controller('ModalGoodsRuleDeleteCtrl', ModalGoodsRuleDeleteCtrl);
ModalGoodsRuleDeleteCtrl.$inject = ['$scope', '$uibModalInstance', 'rule'];
function ModalGoodsRuleDeleteCtrl($scope, $uibModalInstance, rule) {
  $scope.ok = function () {
    $uibModalInstance.close(rule);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 显示商品规则详情
goods.controller('ModalGoodsRuleDetailShowCtrl', ModalGoodsRuleDetailShowCtrl);
ModalGoodsRuleDetailShowCtrl.$inject = ['$scope', '$uibModalInstance', 'rule', 'dataService'];
function ModalGoodsRuleDetailShowCtrl($scope, $uibModalInstance, rule, dataService: IDataService) {
  dataService.rule_getRuleItemCount({ rule_id: rule.rule_id }).then(res => $scope.ruleItemCount = res.data);
  $scope.rule = rule;
  $scope.ok = function () {
    $uibModalInstance.close();
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 手动合并品牌
goods.controller('ModalGoodsMergeBrandCtrl', ModalGoodsMergeBrandCtrl);
ModalGoodsMergeBrandCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', 'dataService', 'brand'];
function ModalGoodsMergeBrandCtrl($scope, $timeout, $uibModalInstance, dataService: IDataService, brand) {
  $scope.is_click = true;
  $scope.checkit = function () {
    $timeout(function () {
      dataService.brand_getBrandDetail({
        brand_id: $scope.to_brand_id,
      }).then(res => $scope.to_brand_name = res.data.brand_name);
    },       1000);
  };
  $scope.ok = function () {
    brand.to_brand_id = $scope.to_brand_id;
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}


goods.controller('ModalGoodsMergeCtrl', ModalGoodsMergeCtrl);
ModalGoodsMergeCtrl.$inject = ['$scope', '$routeParams', '$uibModalInstance', 'brand', 'body'];
function ModalGoodsMergeCtrl($scope, $routeParams, $uibModalInstance, brand, body) {
  $scope.body = (body == '0') ? '合并至' + brand.brand_name + '品牌' : '合并至标准品牌' + $routeParams.name;
  $scope.ok = function () {
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

// 新建品牌模态框
goods.controller('addNewBrandCtrl', addNewBrandCtrl);
addNewBrandCtrl.$inject = ['$uibModalInstance', '$scope', 'brand_name'];
function addNewBrandCtrl($uibModalInstance, $scope, brand_name) {
  const anbc = this;
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

// 查看品牌评分
goods.controller('ModalGoodsMarkBrandCtrl', ModalGoodsMarkBrandCtrl);
ModalGoodsMarkBrandCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', 'dataService', 'Notification', 'brand'];
function ModalGoodsMarkBrandCtrl($scope, $timeout, $uibModalInstance, dataService: IDataService, Notification, brand) {
  $scope.is_click = true;
  init();
  function init() {
    dataService.brand_getRate({
      brand_id: brand.brand_id,
    }).then(res => {
      $scope.brand_info = res.data.brand_info;
      $scope.rate_info = res.data.rate_info;
    },      err => $uibModalInstance.close(brand));
  }
  $scope.ok = function () {
    brand = $scope.rate_info;
    $uibModalInstance.close(brand);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

