import * as angular from 'angular';
export {
  myPgcTopicAnswerController
}

myPgcTopicAnswerController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification', 'seeModal'];
function myPgcTopicAnswerController($scope, $location, $routeParams, dataService, Notification, seeModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const target = $location.path().split("/")[2] || 'pgcContent';
  $scope.currentType = target;
  $scope.searchData = {};
  const params = {
    p: $routeParams.page
  };

  function init() {
    dataService.topic_getMyPgcAnswerList(params).then(res => {
      $scope.answerList = res.data.answers;
      $scope.total_items = res.data.count;
    })
  }


  $scope.deleteAnswer = function(a_id) {
    seeModal
      .confirmP('删除', '确认删除该回答？')
      .then(() => dataService.topic_deleteAnswer({ a_id }).then(res => init()))
  };

  $scope.hash === 'myTopicAnswer' && init();
}
