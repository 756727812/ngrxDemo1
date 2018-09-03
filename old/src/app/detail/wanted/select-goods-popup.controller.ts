selectGoodsPopupController.$inject = ['$scope', 'dataService', 'selectGoodsData'];
function selectGoodsPopupController($scope, dataService, selectGoodsData) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.keyword = "";
  $scope.selectItems = selectGoodsData.selectItems ? selectGoodsData.selectItems : [];
  $scope.selectItemsId = [];
  $scope.curPage = 1;
  var getItemList = function(params) {
    dataService.item_itemList(params).then(data => $scope.items = data.data.list);
  };

  $scope.searchItem = function() {
    var params = {
      keyword: $scope.keyword
    }
    getItemList(params)
  }

  dataService.item_itemList({
    keyword: $scope.keyword
  }).then(data => $scope.items = data.data.list)

  $scope.checkIfSelected = function(item_id) {
    for (var i in $scope.selectItems) {
      if ($scope.selectItems[i]['item_id'] == item_id) {
        return true;
      }
      return false;
    }
  }

  $scope.toggleItem = function(item_id, idx) {
    $scope.currentItem = $scope.items[idx];
    for (var i in $scope.selectItems) {
      if ($scope.selectItems[i]['item_id'] == item_id) {
        $scope.selectItems.splice(i, 1);
        return;
      }
    }
    $scope.selectItems.push($scope.items[idx])
  }

  $scope.prePage = function() {
    var params = {
      keyword: $scope.keyword,
      p: $scope.curPage > 1 ? --$scope.curPage : $scope.curPage
    }
    getItemList(params);
  }

  $scope.nextPage = function() {
    var params = {
      keyword: $scope.keyword,
      p: $scope.curPage + 1
    }
    dataService.item_itemList(params).then(data => {
      if (data.data.list.length > 0) {
        $scope.items = data.data.list
        $scope.curPage++
      }
    })
  }

  $scope.cancelItem = function(idx) {
    $scope.selectItems.splice(idx, 1)
  }

  $scope.comfirmItems = function() {
    selectGoodsData.selectItems = $scope.selectItems
    $scope.closeThisDialog()
  }
}

export {
  selectGoodsPopupController
};
