/**
 * 编辑合集中的商品
 */
import * as angular from 'angular';
export const editCollectionItem = {
  controller: editCollectionItemController,
  template: require('./edit-collection-item.template.html')
}
editCollectionItemController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'Notification'];
function editCollectionItemController($scope, $routeParams, $location, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  $scope.updateName = function() {
    if ($routeParams.coid) { // 合集商品
      $scope.formData.co_id = $routeParams.coid;
      $scope.formData.item_id = $routeParams.id;
      dataService.wanted_updateCollectionItemName($scope.formData).then(function(res) {
        dataService.wanted_updateCollectionItemDesc($scope.formData).then(function(res) {
          $location.path("/wanted/myCircle/collectionItemList").search({
            id: $scope.formData.co_id
          });
        });
      }, function(res) { });
    } else if ($routeParams.mcol_id) { // 小合集商品
      const params = {
        mcol_id: $routeParams.mcol_id,
        item_id: $routeParams.id,
        item_name: $scope.formData.item_name,
        item_desc: $scope.formData.item_desc
        //item_tag: ''
      };
      dataService.collection_updateMiniCollectionItem(params).then(res => {
        $location.url('/wanted/myCircle/collectionItemList').search({
          mcol_id: $routeParams.mcol_id
        })
      })
    }
  };

  init();

  function init() {
    if ($routeParams.mcol_id) { // 小合集
      dataService.collection_getMiniCollectionItem({
        mcol_id: $routeParams.mcol_id,
        item_id: $routeParams.id
      }).then(res => {
        $scope.formData.item_name = res.data.item_name
        $scope.formData.item_desc = res.data.item_desc
      })
    } else {
      dataService.wanted_getCollectionItemData({
        col_id: $routeParams.coid,
        item_id: $routeParams.id
      }).then(res => {
        $scope.formData.item_name = res.data.item_name;
        $scope.formData.item_desc = res.data.item_desc
      })
    }

  }
}
