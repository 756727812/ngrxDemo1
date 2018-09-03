import * as angular from 'angular';

export const myCircleList = {
  controller: myCircleListController,
  template: require('./my-circle-list.template.html')
}

myCircleListController.$inject = ['$scope', 'dataService'];
function myCircleListController($scope, dataService) {
  const vm = this;

  activate();

  console.info(1);
  ////////////////

  function activate() {
    return dataService.circle_getCircleBySellerId().then(function(res) {
      return $scope.circleList = res.data || [];
    });
  }
}

