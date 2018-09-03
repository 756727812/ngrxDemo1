/**
 * 为商品增加标签
 */
import * as angular from 'angular';
export const addGoodsTags = {
  controller: addGoodsTagsController,
  template: require('./add-goods-tags.template.html')
}

addGoodsTagsController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'Notification'];
function addGoodsTagsController($scope, $routeParams, $location, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let tmpUrl = '';

  $scope.isMiniCollection = $routeParams.mcol_id ? true : false;

  $scope.$watch('tagID', function(newValue) {
    if (newValue == '1') {
      $scope.tagURL = '//image.seecsee.com/upload/tagv2/sale.png'
    } else if (newValue == '2') {
      $scope.tagURL = '//image.seecsee.com/upload/tagv2/new.png'
    } else {
      //$scope.tagURL = ''
    }
  })

  angular.extend($scope, {
    uploadTag(res) {
      if (res.result == 1) {
        $scope.tagURL = '//image.seecsee.com' + res.data;
        tmpUrl = res.data;
      }
    },
    addGoodsTag() {
      if ($scope.isMiniCollection) {
        const params = {
          mcol_id: $routeParams.mcol_id,
          item_id: $routeParams.id,
          item_tag: '',
          item_tag_id: $scope.tagID
        };
        if ($scope.tagID == '0') {
          params.item_tag = tmpUrl;
        }

        dataService.collection_updateMiniCollectionItem(params).then(res => {
          $location.url('/wanted/myCircle/collectionItemList').search({
            mcol_id: $routeParams.mcol_id
          })
        })
      } else {
        const _params = {
          col_id: $routeParams.coid,
          item_id: $routeParams.id,
          item_tag: '',
          item_tag_id: $scope.tagID
        };
        if ($scope.tagID == '0') {
          _params.item_tag = tmpUrl;
        }
        dataService.wanted_updateCollectionItem(_params)
          .then(res => $location.url('/wanted/myCircle/collectionItemList').search({ id: $routeParams.coid }))
      }

    }
  });

  getMiniCollectionItemByID();

  function getMiniCollectionItemByID() {
    if ($routeParams.mcol_id) {
      dataService.collection_getMiniCollectionItem({
        mcol_id: $routeParams.mcol_id,
        item_id: $routeParams.id
      }).then(res => {
        $scope.tagID = '' + res.data.item_tag_id;
        $scope.tagURL = '//image.seecsee.com' + res.data.item_tag;
      })
    } else {
      dataService.wanted_getCollectionItemData({
        col_id: $routeParams.coid,
        item_id: $routeParams.id
      }).then(res => {
        $scope.tagID = '' + res.data.item_tag_id;
        $scope.tagURL = '//image.seecsee.com' + res.data.item_tag;
      })
    }

  }
}
