import * as angular from 'angular';
export const replyList = {
  controller: replyListDetailController,
  template: require('./reply-list.template.html')
}

replyListDetailController.$inject = ['$scope', 'dataService', '$location', '$routeParams', 'Notification'];
function replyListDetailController($scope, dataService, $location, $routeParams, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.currentType = 'replyList';
  $scope.replyList = {};
  $scope.type = '0';

  $scope.searchAnswer = function() {
    $location.search($scope.searchData);
  };

  $scope.typeChange = function() {
    $location.search({
      type: $scope.type
    });
  };

  const init = function() {
    const page = $routeParams.page || 1;
    const params = [];
    params['p'] = page;
    params['from'] = $routeParams.from;
    params['to'] = $routeParams.to;
    $scope.type = params['type'] = ($routeParams.type ? $routeParams.type : '0');
    dataService.wanted_getMyFinds(params).then(res => {
      const answer = res.data.result;
      for (const key in answer) {
        if (answer.hasOwnProperty(key) && answer[key].find.f_imgurl == "") {
          answer[key].find.f_imgurl = "/upload/static/urlgift.png";
        }
      }
      $scope.replyList = answer;
      $scope.total_items = res.data.count;
    })

  };

  init();
}
