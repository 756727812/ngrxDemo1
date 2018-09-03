/**
 * 用户心愿列表
 */
import * as angular from 'angular';

export const themeList = {
  bindings: {
    type: '<',
  },
  controller: themeListController,
  template: require('./theme-list.template.html'),
};

themeListController.$inject = ['$scope', '$location', 'dataService', '$routeParams', 'ngDialog', 'seeModal', '$uibModal', 'Notification', 'Lightbox'];
export function themeListController($scope, $location, dataService, $routeParams, ngDialog, seeModal, $uibModal, Notification, Lightbox) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  let type = 0;
  setTimeout(() => {
    type = this.type;
    init();
  });
  $scope.searchData = {};
  $scope.themeCount = 0;
  $scope.searchTheme = function () {
    $location.search(angular.extend({}, $scope.searchData));
  };

  //匹配答案弹框
  $scope.matchImgPop = function (t_id, t_imgurl, s_id, host) {
    const page = $routeParams.page || 1;
    $scope.dialog = ngDialog.open({
      template: 'detail/wanted/matchImg.popup.html?v=',
      className: 'ngdialog-theme-default ngdialog-theme-sendGoods ngdialog-matchimg',
    });
    const temp = 't_imgurl=' + t_imgurl + '&page=' + page + '&s_id=' + s_id + '&t_id=' + t_id + '&host=' + host;
    $location.url('/wanted/themeList?' + temp);
  };

  //推荐答案弹框
  $scope.recommendPop = function (t_id, t_imgurl, s_id, host) {
    const page = $routeParams.page || 1;
    $scope.dialog = ngDialog.open({
      template: 'detail/wanted/recommendImg.popup.html?v=',
      className: 'ngdialog-theme-default ngdialog-theme-sendGoods ngdialog-matchimg',
    });
    const temp = 't_imgurl=' + t_imgurl + '&page=' + page + '&s_id=' + s_id + '&t_id=' + t_id + '&host=' + host;
    $location.url('/wanted/themeList?' + temp);
  };

  /**
   * 从发现流中全局隐藏指定心愿
   * @param id 心愿ID
   */
  $scope.hideMe = function (id) {
    seeModal.confirmP('隐藏', '你确定执行此操作？')
      .then(() => dataService.wanted_hideTheme({
        t_id: id,
      }).then(res => init()));
  };

  $scope.prompt = function () {
    // var modalInstance = $uibModal.open({
    //   animation: true,
    //   templateUrl: 'exampleModal.html',
    //   controller: 'exampleModalCtrl',
    //   size: 'md'
    // });

    // modalInstance.result.then(function() { }, function() { });
  };
  const init = function () {
    const page = $routeParams.page || 1;
    const params = $scope.searchData = [];
    params['keyword'] = $routeParams.keyword;
    params['from'] = $routeParams.from;
    params['to'] = $routeParams.to;
    params['type'] = $routeParams.type;
    switch (+type) {
      case 1:                   // 所有
        $scope.title = '所有';
        params['p'] = page;
        dataService.wanted_getUserThemev2(params).then(data => {
          $scope.themeList = data.data.themes;
          $scope.s_id = data.data.seller_id;
          $scope.host = data.data.http_host;
          $scope.total_items = data.data.count;
          $scope.themeCount = data.data.count;
        });
        break;
      case 2:                   // 我发布的
        $scope.isMine = 1;//判断是否是自己发布的心愿
        $scope.title = '我发布的';
        params['page'] = page;
        params['page_size'] = 20;
        dataService.wanted_getBackendOperateTheme(params).then(data => {
          $scope.themeList = data.data.list;
          $scope.total_items = data.data.count;
          $scope.themeCount = data.data.count;
        });
        break;
    }
    $scope.openLightboxModal = function (index) {
      Lightbox.openModal($scope.themeList[index]['wanted_imgurl'], 0);
    };
    dataService.wanted_getAllCategory().then(data => $scope.categoryList = data.data);
  };

}
