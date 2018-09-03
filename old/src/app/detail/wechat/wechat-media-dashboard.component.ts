mediaDashboardController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
function mediaDashboardController($scope, $routeParams, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let uid = $routeParams.uid;
  let curr_page = $routeParams.page || 1;
  let size = 21;
  init();
  function init() {
    $scope.isNull = 1;
    getItemDetail({
      uid: uid,
      'search-type': 'account',
    });
    getArticleList({
      uid: uid,
      sortby: 'pulish_time',
      offset: (curr_page - 1) * size,
      size: size,
    });
  }
  function getItemDetail(_params) {
    return dataService.weranking_get_item_detail(_params).then(res => {
      if (res.data.result === 1) {
        $scope.userInfo = res.data.user_info;
        $scope.accountStat = res.data.account_stat;
        $scope.tags = res.data.user_info.user_class[1].replace(/\s/g, ',').split(',');
        $scope.updateTime = res.data.account_stat[6].update_time;
      } else Notification.dataError('数据异常，请稍后再试！');
    },                                                         err => Notification.serverError());
  }
  function getArticleList(_params) {
    return dataService.weranking_account_article(_params).then(res => {
      if (res.data.code === 0) {
        $scope.isNull = res.data.data.total == 0;
        $scope.articleslist = res.data.data.list;
        $scope.total_items = res.data.data.total;
      } else Notification.dataError(res.data.msg);
    },                                                         err => Notification.serverError(err));
  }
}

export const wechatMediaDashboard = {
  template: require('./wechat-media-dashboard.template.html'),
  controller: mediaDashboardController,
};

