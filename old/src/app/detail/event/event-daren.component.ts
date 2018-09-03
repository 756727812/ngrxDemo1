import { IDataService } from '../../services/data-service/data-service.interface';

export const eventDaren: ng.IComponentOptions = {
  template: require('./event-daren.template.html'),
  controller: eventDarenController,
};

eventDarenController.$inject = ['$scope', '$location', '$routeParams', 'dataService', '$uibModal'];
export function eventDarenController($scope, $location, $routeParams, dataService: IDataService, $uibModal) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let tab = $location.hash() || 'theme';
  let page = $routeParams.page || 1;
  let params = {};
  $scope.searchData = {};
  $scope.prompt = function () {
    let modalInstance = $uibModal.open({
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

    $scope.searchTheme = function () {
      $location.search($scope.searchData);
    };

    dataService.event_getDarenTheme(params).then(res => {
      $scope.themeList = res.data.themes;
      $scope.total_items = res.data.count;
    });
    dataService.wanted_getAllCategory().then(data => $scope.categoryList = data.data);
  } else {
    params = {
      p: $routeParams.page,
      cy_name: $routeParams.cy_name,
      keyword: $routeParams.keyword,
    };
    $scope.searchTopicQuestion = function () {
      $location.search($scope.searchData);
    };
    dataService.topic_getDarenPgcQuestionList(params).then(res => {
      $scope.questionList = res.data.questions;
      $scope.total_items = res.data.count;
    });
    dataService.common_getAllCategory().then(data => $scope.categoryList = data.data);
  }
}
