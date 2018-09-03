/**
 * 合集商品列表
 */
import * as angular from 'angular';
export const collectionItemList = {
  controller: collectionItemListController,
  template: require('./collection-item-list.template.html')
}

collectionItemListController.$inject = ['$scope', '$routeParams', '$location', 'dataService', '$timeout', 'Notification', 'seeModal'];
function collectionItemListController($scope, $routeParams, $location, dataService, $timeout, Notification, seeModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  init();

  function init() {
    if ($routeParams.id) {
      $scope.collection_id = $routeParams.id;

      dataService.wanted_getCollectionItemList({
        c_id: $scope.collection_id
      }).then(res => $scope.itemList = res.data)
    } else if ($routeParams.mcol_id) { // 小合集
      $scope.mcol_id = $routeParams.mcol_id;
      dataService.collection_miniCollectionItem({
        mcol_id: $routeParams.mcol_id
      }).then(res => $scope.miniItemList = res.data.item_list)
    }
  }

  angular.extend($scope, {
    delMiniCollectionGoodsItem(id) { // 小合集删除商品
      seeModal.confirm('删除商品', '你确定要删除该商品吗?', function() {
        const params = {
          mcol_id: $routeParams.mcol_id,
          item_id: id
        }
        dataService.collection_delMiniCollectionItem(params).then(res => {
          Notification.success('删除成功!')
          return init()
        })
      })
    },
    delGoodsItem(id) {
      seeModal.confirm('删除商品', '你确定要删除该商品吗?', function() {

        dataService.wanted_delCollectionItem({
          col_id: $routeParams.id,
          item_id: id
        }).then(res => {
          Notification.success('删除成功!')
          return init()
        })
      })
    }
  })
}
