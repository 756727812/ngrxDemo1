import * as angular from 'angular';
export const relateCircle = {
  controller: relateCircleController,
  template: require('./relate-circle.template.html')
}

relateCircleController.$inject = ['$scope', '$location', 'dataService', 'Notification'];
function relateCircleController($scope, $location, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.selectedCircle = {};
  $scope.relateCircleAct = function() {
    if ($scope.selectedCircle) {
      const cir_id = $scope.selectedCircle.originalObject.cir_id;
      dataService.circle_relateBackendCircle({ cir_id }).then(res => {
        Notification.success()
        $location.path("/wanted/myCircle/")
      })
    }
  }
}

