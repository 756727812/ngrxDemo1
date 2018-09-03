articleDashboardController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
function articleDashboardController($scope, $routeParams, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let uid = $routeParams.uid, search = 'article';
  init();
  function init() {
    $scope.isNull = 1;
    $scope.type = search;
    getItemDetail({
      uid: uid,
      'search-type': search,
    });
  }
  function getItemDetail(_params) {
    return dataService.weranking_get_item_detail(_params).then(res => {
      if (res.data.result === 1) {
        $scope.artiInfo = res.data.data.article;
        if (res.data.data.article.comment_num) {
          $scope.isNull = 0;
          $scope.commentList = JSON.parse(res.data.data.article.comments);
        }
      } else Notification.dataError('数据异常，请稍后再试！');
    },                                                         err => Notification.serverError());
  }
}

export const wechatArticleDashboard = {
  template: require('./wechat-article-dashboard.template.html'),
  controller: articleDashboardController,
};
