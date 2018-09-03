import * as angular from 'angular';

export const pgcContentAnswer = {
  controller: pgcContentAnswerController,
  template: require('./pgc-content-answer.template.html'),
};


pgcContentAnswerController.$inject = ['$scope', '$location', '$routeParams', '$cookies', 'dataService', '$uibModal'];
function pgcContentAnswerController($scope, $location, $routeParams, $cookies, dataService, $uibModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.searchData = {
    p: $routeParams.page || 1,
  };

  const seller_privilege = $cookies.get('seller_privilege');
  $scope.isC2C = seller_privilege == 1 || seller_privilege == 30 || seller_privilege == 2;
  $scope.searchTopicQuestion = function () {
    $location.search($scope.searchData);
  };

  $scope.promptTopic = function () {
    // var modalInstance = $uibModal.open({
    //   templateUrl: 'topicModal.html',
    //   controller: 'exampleModalCtrl',
    // });
  };

  function init() {
    dataService.topic_getPgcQuestionList({
      p: $routeParams.page || 1,
      cy_name: $routeParams.cy_name,
      keyword: $routeParams.keyword,
    }).then(res => {
      $scope.questionList = res.data.questions;
      $scope.total_items = res.data.count;
    });
    dataService.common_getAllCategory().then(res => $scope.categoryList = res.data);
  }

  $scope.hash = $location.hash() || 'kejian';

  $scope.hash === 'topic' && init();
}

