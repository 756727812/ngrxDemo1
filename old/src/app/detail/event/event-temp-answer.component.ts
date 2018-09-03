import { IDataService } from '../../services/data-service/data-service.interface';

export const eventTempAnswer: ng.IComponentOptions = {
  template: require('./event-temp-answer.template.html'),
  controller: eventTempAnswerController,
};

eventTempAnswerController.$inject = ['$scope', '$location', 'dataService', '$routeParams'];
export function eventTempAnswerController($scope, $location, dataService: IDataService, $routeParams) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.tid = $routeParams.t_id;

  let init = function () {
    let t_id = $routeParams.t_id;
    dataService.wanted_getTheme({ t_id }).then(res => $scope.theme = res.data);
    dataService.wanted_getThemeTmpFinds({ t_id }).then(res => {
      let answer = res.data.finds;
      for (let key in answer) {
        if (answer.hasOwnProperty(key) && answer[key].f_imgurl == '') {
          answer[key].f_imgurl = '/upload/static/urlgift.png';
        }
      }
      $scope.answer = answer;
    });
  };

  $scope.jumpToAnswer = function () {
    $location.path('/event/add-answer').search({ tid: $routeParams.t_id });
  };
  init();
}
