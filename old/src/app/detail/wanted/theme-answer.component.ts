import * as angular from 'angular';

export const themeAnswer = {
  controller: themeAnswerController,
  template: require('./theme-answer.template.html')
}

themeAnswerController.$inject = ['$scope', '$location', 'dataService', '$routeParams', 'Notification', 'Lightbox'];
function themeAnswerController($scope, $location, dataService, $routeParams, Notification, Lightbox) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.t_id = $routeParams.t_id;

  $scope.ori = $routeParams.ori ? $routeParams.ori : 'pgc';
  $scope.themeType = $routeParams.themeType ? $routeParams.themeType : '';
  const init = function() {
    const t_id = $routeParams.t_id;
    const p = $routeParams.page || 1;
    dataService.wanted_getTheme({ t_id }).then(data => $scope.theme = data.data);
    dataService.wanted_getThemeFinds({ t_id, p }).then(data => {
      const answer = data.data.finds;
      for (const key in answer) {
        if (answer.hasOwnProperty(key) && answer[key].f_imgurl == "") {
          answer[key].f_imgurl = "/upload/static/urlgift.png";
        }
      }
      $scope.answer = answer;
      $scope.total_items = data.data.count;
    })
  }

  $scope.jumpAddAnswer = function() {
    dataService.wanted_checkIfJZCanAnswer({ t_id: $scope.t_id })
      .then(res => $location.path("/wanted/themeList/addAnswer").search({ tid: $scope.t_id, ori: $scope.ori }));

  }
  $scope.openLightboxModal = function() {
    Lightbox.openModal($scope.theme.wanted_imgurl, 0);
  }

  init()
}
