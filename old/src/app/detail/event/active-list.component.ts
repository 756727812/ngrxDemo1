import { IDataService } from '../../services/data-service/data-service.interface';

export const activeList: ng.IComponentOptions = {
  template: require('./active-list.template.html'),
  controller: activeListController,
};

activeListController.$inject = ['$scope', '$location', '$routeParams', 'dataService', '$uibModal', 'Notification'];
export function activeListController($scope, $location, $routeParams, dataService: IDataService, $uibModal, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.cond = { p: 1 };
  Object.assign($scope.cond, $routeParams);
  $scope.cond.p = $routeParams.page || 1;
  $scope.actives = [];
  $scope.classList = [];
  $scope.brandList = [];

  $scope.submitSearch = function () {
    $scope.cond.p = 1;
    $scope.cond.page = 1;
    $location.search($scope.cond);
  };

  $scope.loadListData = function (cond) {
    dataService.couponmanager_getBrandAndClass().then(res => {
      $scope.brandList = res.data.brand;
      $scope.classList = res.data.class.concat(res.data.firstclass);
      //获取完依赖数据再加载
      return dataService.backend_event_getAllEventList(cond).then(res => {
        $scope.actives = res.data.events;
        $scope.total_items = res.data.count;
      });
    });

  };
  $scope.openDetail = function (msg) {
    let modalInstance = $uibModal.open({
      template: '<div class="modal-header">' +
      '<h3 class="modal-title">查看详情</h3>' +
      '</div>' +
      '<div class="modal-body">' +
      msg +
      '</div></div>',
      size: 'lg',
    });
  };

  $scope.getLimit = function (limit_region, limit_brand, limit_class) {
    let result = limit_region ? ['仅限' + limit_region] : [];
    if (limit_brand) {
      let brandList = limit_brand.split(',');
      $.each(brandList, function (j, data) {
        $.each($scope.brandList, function (i, item) {
          let index = $.inArray(item.brand_id, brandList);
          if (index != -1) {
            brandList[index] = item.brand_name;
          }
        });
      });
      result.push('仅限' + brandList.join(','));
    }
    if (limit_class) {
      let classList = $.map(limit_class.split(','), function (value, index) {
        return value.split('-')[1] == 0 && (value.split('-')[0] || value.split('-')[1]) || value.split('-')[1] || value.split('-')[0];
      });
      $.each(classList, function (j, data) {
        $.each($scope.classList, function (i, item) {
          let index = $.inArray(item.class_id, classList);
          if (index != -1) {
            classList[index] = item.class_name;
          }
        });
      });
      classList.length != 0 && result.push('仅限' + classList.join(','));
    }
    return result.join(' & ');
  };

  let init = function () {
    $scope.loadListData($scope.cond);
  };
  init();
}
