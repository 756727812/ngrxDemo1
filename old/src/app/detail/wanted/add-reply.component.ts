import * as angular from 'angular';
export const addReply = {
  controller: addReplyController,
  template: require('./add-reply.template.html')
}

addReplyController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'Notification'];
function addReplyController($scope, $routeParams, $location, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  dataService.seller_getSellerMajia().then(res => {
    $scope.users = res.data;
    if ($routeParams.majiaid)
      $scope.formData.u_id = $routeParams.majiaid;
    else {
      const rand_idx = Math.floor(Math.random() * ($scope.users.length));
      $scope.formData.u_id = $scope.users[rand_idx].u_id;
    }
  });

  $scope.addReply = function() {
    if (!$scope.formData.reply_content || !$routeParams.fid) {
      alert('参数错误。');
      return;
    }
    $scope.formData.f_id = $routeParams.fid;
    if ($routeParams.replyid)
      $scope.formData.reply_toid = $routeParams.replyid;

    dataService.wanted_addReply($scope.formData).then(res => {
      const postData = {
        insert_id: res.data.reply_id,
        table_name: 'see_reply'
      }
      dataService.seller_saveRecord(postData)
      dataService.parttime_updateReplyStatus({ reply_id: $routeParams.replyid })
      $location.path("/wanted/replyList/comment");
    })
  };
}
