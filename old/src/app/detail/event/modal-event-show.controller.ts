modalEventShowController.$inject = ['$scope', '$location', '$uibModalInstance'];
export function modalEventShowController($scope, $location, $uibModalInstance) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let hash = $location.hash() ? $location.hash() : 'theme';
  let type = $location.path().split('/')[2];

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.prompt_img = 'images/event-prompt-' + hash + '-' + type + '.jpg';
}
