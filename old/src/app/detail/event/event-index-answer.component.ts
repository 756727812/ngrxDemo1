import { IDataService } from '../../services/data-service/data-service.interface';

export const eventIndexAnswer: ng.IComponentOptions = {
  template: require('./event-index-answer.template.html'),
  controller: eventAnswerController,
};

eventAnswerController.$inject = ['$scope', '$location', 'dataService', '$routeParams'];
export function eventAnswerController($scope, $location, dataService: IDataService, $routeParams) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let init = function () {
    let t_id = $routeParams.t_id;
    dataService.wanted_getTheme({ t_id }).then(res => $scope.theme = res.data);
    dataService.wanted_getThemeFinds({ t_id }).then(res => {
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
    $location.path('/event/event-temp-answer').search({ t_id: $routeParams.t_id });
  };
  init();
}
