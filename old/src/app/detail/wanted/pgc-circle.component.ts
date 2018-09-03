import * as angular from 'angular';

export const pgcCircle = {
  controller: pgcCircleController,
  template: require('./pgc-circle.template.html')
}

pgcCircleController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
function pgcCircleController($scope, $location, $routeParams, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.circleList = [];
  const page = $routeParams.page || 1;
  $scope.searchData = {
    page,
    keyword: $routeParams.keyword || ''
  }
  /**
   * 获取PGC圈子列表
   */
  function getPgcCircleList() {
    dataService.circle_getPgcCircleList({
      p: $scope.searchData.page,
      all: '',
      keyword: $scope.searchData.keyword
    }).then(res => {
      $scope.circleList = res.data;
    })

    dataService.circle_getCircleCountByClass({
      class_id: 11
    }).then(function(res) {
      $scope.total_items = res.data;
    });
  }

  $scope.jumpToCreateCircle = function() {
    $location.path('/wanted/myCircle/createCircle').search({
      pgc: 1
    });
  };
  $scope.searchPgcCircle = function() {
    $location.search($scope.searchData);
  }

  init();

  function init() {
    getPgcCircleList();
  }
}
