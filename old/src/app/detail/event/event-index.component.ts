import { IDataService } from '../../services/data-service/data-service.interface'

export const eventIndex: ng.IComponentOptions = {
  template: require('./event-index.template.html'),
  controller: indexEventController
}

indexEventController.$inject = ['$scope', '$location', '$routeParams', '$uibModal', 'dataService'];
export function indexEventController($scope, $location, $routeParams, $uibModal, dataService: IDataService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  var tab = $location.hash() || 'theme';
  var page = $routeParams.page || 1;
  var params = {};
  var version = +new Date();

  $scope.searchData = {};
  $scope.prompt = function() {
    var modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-event-show.html'),
      controller: 'modalEventShowController',
      size: 'lg',
    });
  };

  if (tab === 'theme') {
    params['p'] = page;
    params['keyword'] = $routeParams.keyword;
    params['from'] = $routeParams.from;
    params['to'] = $routeParams.to;
    params['cy_id'] = $routeParams.cy_id;

    $scope.searchTheme = function() {
      $location.search($scope.searchData);
    };

    dataService.event_getRecommendTheme(params).then(res => {
      $scope.themeList = res.data.themes;
      $scope.total_items = res.data.count;
    })
    dataService.wanted_getAllCategory().then(data => $scope.categoryList = data.data);
  } else if (tab === 'topic') {

    $scope.searchTopicQuestion = function() {
      $location.search($scope.searchData);
    }
    params = {
      p: page,
      cy_name: $routeParams.cy_name,
      keyword: $routeParams.keyword
    }

    dataService.topic_getRecommendPgcQuestionList(params).then(res => {
      $scope.questionList = res.data.questions;
      $scope.total_items = res.data.count;
    })
    dataService.common_getAllCategory().then(data => $scope.categoryList = data.data)
  }
}
