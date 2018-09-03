/**
 * 我的合集
 */
import { IDataService } from '../../services/data-service/data-service.interface';

let version = +new Date();

goodsMyCollectionController.$inject = ['$scope', '$routeParams', 'seeModal', '$timeout', 'dataService', '$uibModal', 'Notification'];
export function goodsMyCollectionController($scope, $routeParams, seeModal, $timeout, dataService: IDataService, $uibModal, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let page = $routeParams.page || 1;

  /**
   * 删除合集
   * @param collection_id 合集ID
   */
  $scope.delCollectionFromCircle = function (collection_id) {
    seeModal.confirm('删除合集', '是否确定删除该合集?', function () {
      dataService.circle_delCollection({ collection_id }).then(res => getCircleCollection($scope.circle.cir_id));
    });
  };

  /**
   * 删除小合集
   * @param _id 小合集ID
   */
  $scope.delMiniCollection = function (mcol_id) {
    seeModal.confirm('删除小合集', '是否确定删除该合集?', function () {
      dataService.collection_setMiniColPublic({
        mcol_id,
        value: 0,
      }).then(res => getMiniCollectionList($routeParams.page || 1, $scope.circle.cir_id));
    });
  };

  /**
   * 大合集介绍
   */
  $scope.promptCol = function () {
    let modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-collection-show.template.html'),
      controller: 'exampleModalCtrl',
      size: 'md',
    });
  };

  /**
   * 小合集介绍
   */
  $scope.promptMiniCol = function () {
    let modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-mini-collection-show.template.html'),
      controller: 'exampleModalCtrl',
      size: 'md',
    });
  };

  function getCircleBySelleId(getCircleCollectionCb, getMiniCollectionListCb) {
    dataService.circle_getCircleBySellerId().then(res => {
      if (res.hasOwnProperty('data') && res.data.length > 0) {
        $scope.circle = res.data[0];
        getCircleCollectionCb(res.data[0].cir_id);
        getMiniCollectionListCb(page, res.data[0].cir_id);
      }
    });
  }

  function getCircleCollection(cir_id) {
    dataService.wanted_getCircleCollection({ cir_id }).then(res => $scope.collectionList = res.data);
  }

  function getMiniCollectionList(p, cir_id) {
    dataService.collection_miniCollectionByCirid({ p, cir_id }).then(res => {
      $scope.miniCollectionList = res.data.data;
      $scope.totalMiniCollectionItems = res.data.total_page;
    });
  }

  function init() {
    getCircleBySelleId(getCircleCollection, getMiniCollectionList);
  }

  init();

}

export const goodsMyCollection: ng.IComponentOptions = {
  template: require('./goods-my-collection.template.html'),
  controller: goodsMyCollectionController,
};
