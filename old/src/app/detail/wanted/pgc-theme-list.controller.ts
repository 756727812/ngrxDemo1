import * as angular from 'angular';
export {
  pgcThemeListController,
};

pgcThemeListController.$inject = ['$scope', '$location', 'dataService', '$routeParams', 'ngDialog', '$uibModal', 'Notification'];
function pgcThemeListController($scope, $location, dataService, $routeParams, ngDialog, $uibModal, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const version = +new Date();
  $scope.currentType = 'themeList';
  $scope.searchData = {};

  $scope.searchTheme = function () {
    $location.search($scope.searchData);
  };

  //匹配答案弹框
  $scope.matchImgPop = function (t_id, t_imgurl, s_id, host) {
    const page = $routeParams.page || 1;
    $scope.dialog = ngDialog.open({
      template: 'detail/wanted/matchImg.popup.html?v=' + version,
      className: 'ngdialog-theme-default ngdialog-theme-sendGoods',
    });
    const temp = 't_imgurl=' + t_imgurl + '&page=' + page + '&s_id=' + s_id + '&t_id=' + t_id + '&host=' + host;
    $location.url('/wanted/themeList?' + temp);
  };

  $scope.promptTheme = function () {
    // var modalInstance = $uibModal.open({
    //   animation: true,
    //   templateUrl: 'darenTheme.html',
    //   controller: 'exampleModalCtrl',
    //   size: 'md'
    // });
  };

  const init = function () {
    const page = $routeParams.page || 1;
    const params = [];
    params['p'] = page;
    params['keyword'] = $routeParams.keyword;
    params['from'] = $routeParams.from;
    params['to'] = $routeParams.to;
    params['cy_id'] = $routeParams.cy_id;

    dataService.wanted_getPgcTheme(params).then(data => {
      $scope.themeList = data.data.themes;
      $scope.s_id = data.data.seller_id;
      $scope.host = data.data.http_host;
      $scope.total_items = data.data.count;
    });

    dataService.wanted_getAllCategory().then(data => $scope.categoryList = data.data);
  };
  $scope.hash === 'kejian' && init();

}
