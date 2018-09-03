/**
 * PGC兼职管理 -- 内容同学使用
 */
import * as angular from 'angular';
import * as _ from 'lodash';;

export const pgcPart = {
  controller: pgcPartController,
  template: require('./pgc-part.template.html'),
};

export {
  modalAddPGCCircleController,
};

pgcPartController.$inject = ['$scope', 'Notification', '$routeParams', 'dataService', '$uibModal'];
function pgcPartController($scope, Notification, $routeParams, dataService, $uibModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let page;
  init();
  function init() {
    page = $routeParams.page || 1;

    dataService.user_getAccountList({ type: 21 }).then(res => {
      $scope.accounts = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  // 选中状态的账号
  $scope.checkedBoxAc = {};

  /**
   * 弹出模态框为账号添加pgc圈子
   * @param {String} id 单个账号
   * @param {Object} id 选中状态的多个账号
   */
  $scope.addPgcCircle = function (id) {
    if (angular.equals({}, id)) return;
    let ids = [];
    if (angular.isString(id)) {  // 单个操作
      ids = [id];
    } else {    // 批量操作
      Object.keys(id).forEach(function (k) {
        if (id[k]) ids.push(k);
      });
    }
    // We lost addPGCCircle.html !!!
    // var modalInstance = $uibModal.open({
    //   templateUrl: 'addPGCCircle.html',
    //   controller: 'modalAddPGCCircleController',
    //   size: 'lg',
    // });

    // modalInstance.result.then(function(params) {
    //   if (params.length > 0) {
    //     dataService.user_relateBackendUserAndCircleOwner({
    //       backend_ids: JSON.stringify(ids),
    //       owner_ids: JSON.stringify(params)
    //     }).then(res => Notification.success('添加PGC圈子成功！'))
    //   }
    // })
  };
}

modalAddPGCCircleController.$inject = ['$scope', '$uibModalInstance', 'dataService', 'Notification'];
function modalAddPGCCircleController($scope, $uibModalInstance, dataService, Notification) {
  init();

  function init() {
    dataService.circle_getPgcCircleList({
      p: $scope.current_page || 1,
      all: 1,
    }).then(res => $scope.circleList = res.data);
    dataService.circle_getCircleCountByClass({ class_id: 11 }).then(res => $scope.circlesTotal = res.data);
  }
  $scope.pageChange = function () {
    init();
  };
  $scope.checkedCircles = {};
  $scope.ok = function () {
    const ids = [];
    _.keys($scope.checkedCircles).forEach(function (k) {
      if ($scope.checkedCircles[k]) ids.push(k);
    });
    $uibModalInstance.close(ids);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
