import * as angular from 'angular';

export const commentDetail = {
  controller: commentDetailController,
  template: require('./comment-detail.template.html')
}

commentDetailController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification'];
function commentDetailController($scope, $routeParams, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.currentType = 'replyList';
  $scope.t_id = $routeParams.tid
  $scope.f_id = $routeParams.fid;
  //回答 心愿 信息
  dataService.wanted_getFind({
    f_id: $scope.f_id
  }).then(res => {
    $scope.find = res.data;
    const t_id = $scope.find.t_id;
    dataService.wanted_getTheme({ t_id }).then(res => $scope.theme = res.data)
  });

  // 评论
  dataService.wanted_getFindReplies({
    f_id: $scope.f_id
  }).then(res => {
    $scope.replies = res.data.replies;
    $scope.replies_count = res.count;
  });
}
