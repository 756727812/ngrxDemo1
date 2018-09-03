import { IDataService } from '../../services/data-service/data-service.interface';
const version = +new Date();

goodsBrandListController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification', '$location', '$uibModal', 'seeModal'];
export function goodsBrandListController($scope, $routeParams, dataService: IDataService, Notification, $location, $uibModal, seeModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const curr_page = $routeParams.page || 1;
  $scope.getUrlprefix = (function () {
    const url = window.location.href;
    if (url.match('//backend.seecsee.com/') || url.match('//portal.xiaodianpu.com/')) {
      return '//m.seeapp.com';
    } else {
      return '//see-test.seecsee.com';
    }
  })();
  init();
  function init() {
    $scope.class = $location.hash() || '0';
    $scope.keyword = '';
    $scope.sort = '1';
    $scope.type = '0';
    if ($routeParams.keyword || $routeParams.sort || $routeParams.type) {
      $scope.keyword = $routeParams.keyword;
      $scope.sort = $routeParams.sort;
      $scope.type = $routeParams.type;
      getBrandList({
        p: curr_page,
        page_size: 20,
        keyword: $scope.keyword + '',
        sort: $scope.sort,
        type: $scope.type,
      });
    } else {
      getBrandList({
        p: curr_page,
        page_size: 20,
      });
    }
  }

  function getBrandList(_params) {
    dataService.brand_getBrandList(_params).then(res => {
      $scope.brandslist = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  $scope.searchBrand = function () {
    if ($scope.keyword || $scope.sort || $scope.type) {
      $location.search({
        keyword: $scope.keyword,
        sort: $scope.sort,
        type: $scope.type,
      });
    } else {
      $location.path('/goods/brand').search({}).hash($scope.class);
    }
  };

  $scope.removeBrand = function (_brand_id) {
    seeModal.confirm('提示', '你确定要删除该品牌吗？', function () {
      dataService.brand_updateBrand({
        brand_id: _brand_id,
        is_public: '-1',
      }).then(res => {
        Notification.success('删除操作成功！');
        init();
      });
    });
  };
  $scope.mergeBrand = function (_brand) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-goods-brand-merge.template.html'),
      controller: 'ModalGoodsMergeBrandCtrl',
      size: 'md',
      resolve: {
        brand() {
          return _brand;
        },
      },
    });
    modalInstance.result.then(function (brand) {
      if (brand.brand_id == brand.to_brand_id) {
        Notification.warn('请勿合并相同的品牌ID！');
        return false;
      }
      dataService.brand_mergeItemBrand({
        brand_id_arr: '[' + brand.brand_id + ']',
        to_brand_id: brand.to_brand_id,
      }).then(res => {
        Notification.success('合并操作成功！');
        init();
      });
    });
  };
  $scope.markBrand = function (_brand) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-goods-brand-mark.template.html'),
      controller: 'ModalGoodsMarkBrandCtrl',
      size: 'md',
      resolve: {
        brand() {
          return _brand;
        },
      },
    });
    modalInstance.result.then(function (brand) {
      const data = {};
      data['rate_info'] = encodeURI(JSON.stringify(brand));
      data['brand_id'] = _brand.brand_id;
      dataService.brand_setRate(data).then(res => Notification.success(res.msg));
    });
  };
}

export const goodsBrandList: ng.IComponentOptions = {
  template: require('./goods-brand-list.template.html'),
  controller: goodsBrandListController,
};
