/**
 * 创建（小）合集
 */
import * as angular from 'angular';

export const createCollection = {
  controller: createCollectionController,
  template: require('./create-collection.template.html')
}

createCollectionController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'ngDialog', 'selectGoodsData', 'Notification'];
function createCollectionController($scope, $routeParams, $location, dataService, ngDialog, selectGoodsData, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  const version = +new Date();
  $scope.isMiniCollection = $routeParams.from == 'mini_collection';
  $scope.formData = {};
  $scope.tempData = {
    category: [],
    attr: [],
    brand: [''],
    tag: [],
  }
  $scope.selectItems = [];
  selectGoodsData.selectItems = [];
  let tmpTagURL = '';

  init();

  function init() {
    getBrand();
    getCatAndAttr();
  }

  function getBrand() {
    dataService.item_getStandardBrandList().then(res => $scope.brandList = res.data)
  }

  function getCatAndAttr() {
    dataService.category_getAllLeafCategoryAndAttr().then(res => {
      $scope.catList = res.data.category;
      $scope.attrList = res.data.attr;
    })
  }

  $scope.upload = function(data) {
    if (data.result == 1) {
      $scope.formData.imgurl = data.data;
      $('#bannerImage').css('background-image', "url(//img-qn.seecsee.com" + data.data + ")")
    }
  };

  $scope.uploadTag = function(res) {
    if (res.result == 1) {
      $scope.formData.mcol_tag_imgurl = '//image.seecsee.com' + res.data;
      tmpTagURL = res.data
    }
  }

  $scope.selectGoods = function() {
    $scope.dialog = ngDialog.open({
      plain: true,
      template: require('./selectGoods.popup.html'),
      showClose: false,
      className: 'select-goods-dialog',
    });
    $scope.dialog.closePromise.then(function(data) {
      $scope.selectItems = selectGoodsData.selectItems ? selectGoodsData.selectItems.slice() : [];
    }, function() { });
  };

  $scope.createCollection = function() {

    $scope.errMsg = [];
    if (!$scope.formData.imgurl && !$scope.isMiniCollection) {
      $scope.errMsg.push('请上传合集封面！');
    }
    if ($scope.selectItems.length === 0) {
      $scope.errMsg.push('请添加商品！');
    }
    if (!$scope.isMiniCollection) {
      $scope.formData.category = $scope.tempData.category.length > 0 ? $scope.tempData.category.join('|') : '';
      $scope.formData.attr = $scope.tempData.attr.length > 0 ? $scope.tempData.attr.join('|') : '';
      $scope.formData.brand = $scope.tempData.brand.length > 0 ? $scope.tempData.brand.join('|') : '';
      $scope.formData.tag = $scope.tempData.brand.length > 0 ? $scope.tempData.tag.map(function(item) { return item.text; }).join('|') : '';
      if (!$scope.formData.category && !$scope.formData.attr && !$scope.formData.brand && !$scope.formData.tag) {
        $scope.errMsg.push('标签请至少填写一个!')
      }
    }
    if ($scope.errMsg.length > 0) return;


    if ($scope.isMiniCollection) {
      const params = {
        cir_id: $routeParams.cir_id,
        mcol_name: $scope.formData.name,
        mcol_tag_imgurl: tmpTagURL,
        desc: $scope.formData.desc
      };
      const _itemListIds = [];
      for (let j = 0; j < $scope.selectItems.length; j++) {
        if ($scope.selectItems[j].hasOwnProperty('item_id')) {
          _itemListIds.push($scope.selectItems[j].item_id);
        }
      }
      params['item_list'] = JSON.stringify(_itemListIds);
      dataService.collection_createMiniCollection(params).then(res => {
        Notification.success('创建合集成功！')
        if ($routeParams.origin == 'goods') {
          $location.url('/goods/collection').hash("smallCollection")
        } else {
          $location.url('/wanted/myCircle/circleInfo').search({
            cir_id: $routeParams.cir_id
          }).hash("smallCollection")
        }
      })
    } else {
      const itemListIds = [];
      for (let i = 0; i < $scope.selectItems.length; i++) {
        if ($scope.selectItems[i].hasOwnProperty('item_id')) {
          itemListIds.push($scope.selectItems[i].item_id);
        }
      }
      $scope.formData.item_list = JSON.stringify(itemListIds);
      $scope.formData.cir_id = $routeParams.cir_id;
      $scope.formData.collection_tag_imgurl = tmpTagURL;
      dataService.wanted_createCollection($scope.formData).then(res => {
        $routeParams.origin === 'goods' && $location.url('/goods/collection').hash("collection")
      }).finally(() =>
        $location.path('/wanted/myCircle/circleInfo').search({ cir_id: $routeParams.cir_id }).hash("collection"))
    }
  };
}
