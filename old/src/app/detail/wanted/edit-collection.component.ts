/**
 * 编辑合集
 */
import * as angular from 'angular';
export const editCollection = {
  controller: editCollectionController,
  template: require('./edit-collection.template.html')
}

editCollectionController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'ngDialog', 'selectGoodsData', 'Notification'];
function editCollectionController($scope, $routeParams, $location, dataService, ngDialog, selectGoodsData, Notification) {
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
  let tmpTagUrl = '';

  init();

  function getBrand() {
    dataService.item_getStandardBrandList().then(res => $scope.brandList = res.data)
  }

  function getCatAndAttr() {
    dataService.category_getAllLeafCategoryAndAttr().then(res => {
      $scope.catList = res.data.category;
      $scope.attrList = res.data.attr;
    })
  }

  function getMiniCollectionById() {
    dataService.collection_getMiniCollection({
      mcol_id: $routeParams.id
    }).then(res => {
      angular.extend($scope.formData, {
        name: res.data.mcol_name,
        mcol_tag_imgurl: res.data.mcol_tag_imgurl
      })
      res.data.item_info.map(function(item) {
        $scope.selectItems.push(item)
      });
    })
  }

  function getCollection() {
    dataService.wanted_getCollection({ co_id: $routeParams.id }).then(res => {
      const col_data = res.data.collection_info;
      $scope.formData = col_data;
      $scope.tempData = {
        category: col_data.category.split('|'),
        attr: col_data.attr.split('|'),
        brand: col_data.brand.split('|'),
        tag: col_data.tag.split('|'),
      }
      res.data.item_info.map(function(item) {
        $scope.selectItems.push(item)
      });
      $('#bannerImage').css('background-image', "url(" + res.data.collection_info.imgurl + ")")
    })
  }

  function init() {
    $scope.isMiniCollection ? getMiniCollectionById() : getCollection();
    getBrand();
    getCatAndAttr();
  }


  $scope.uploadTag = function(res) {
    if (res.result == 1) {
      if ($scope.isMiniCollection) $scope.formData.mcol_tag_imgurl = '//image.seecsee.com' + res.data;
      else $scope.formData.collection_tag_imgurl = '//image.seecsee.com' + res.data;
      tmpTagUrl = res.data;
    }
  };

  $scope.upload = function(data) {
    if (data.result == 1) {
      $scope.formData.imgurl = data.data;
      $('#bannerImage').css('background-image', "url(//img-qn.seecsee.com" + data.data + ")")
    }
  };

  $scope.selectGoods = function() {
    selectGoodsData.selectItems = $scope.selectItems;
    $scope.dialog = ngDialog.open({
      plain: true,
      template: require('./selectGoods.popup.html'),
      showClose: false,
      className: 'select-goods-dialog',
    });
    $scope.dialog.closePromise.then(function() {
      $scope.selectItems = selectGoodsData.selectItems ? selectGoodsData.selectItems : [];
    }, function() { });
  };
  $scope.editCollection = function() {
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
        mcol_id: $routeParams.id,
        cir_id: $routeParams.cir_id,
        mcol_name: $scope.formData.name,
        mcol_tag_imgurl: $scope.formData.mcol_tag_imgurl
      };
      const _itemListIds = [];
      for (let i = 0; i < $scope.selectItems.length; i++) {
        if ($scope.selectItems[i].hasOwnProperty('item_id')) {
          _itemListIds.push($scope.selectItems[i].item_id);
        }
      }
      params['item_list'] = JSON.stringify(_itemListIds);
      dataService.collection_updateMiniCollection(params).then(res => {
        if ($routeParams.origin == 'goods') {
          $location.url('/goods/collection').hash("smallCollection");
        } else {
          $location.url('/wanted/myCircle/circleInfo').search({
            cir_id: $routeParams.cir_id
          }).hash("smallCollection");
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
      $scope.formData.collection_id = $scope.formData.id;
      $scope.formData.collection_tag_imgurl = tmpTagUrl;
      dataService.wanted_editCollection($scope.formData).then(res => {
        if ($routeParams.origin == 'goods') {
          $location.url('/goods/collection').hash("collection")
        } else {
          $location.url('/wanted/myCircle/circleInfo').search({
            cir_id: $routeParams.cir_id
          }).hash("collection")
        }
      })
    }
  }
}
