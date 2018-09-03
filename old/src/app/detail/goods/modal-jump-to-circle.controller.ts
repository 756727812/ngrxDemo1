
modalJumpToCircleController.$inject = ['$scope', '$location', '$uibModalInstance', 'title', 'content'];
export function modalJumpToCircleController($scope, $location, $uibModalInstance, title, content) {
  let vm = this;

  vm.title = title;
  vm.content = content;
  vm.jumpToCreateCircle = jumpToCreateCircle;

  function jumpToCreateCircle() {
    $location.path('wanted/myCircle/createCircle');
    $uibModalInstance.close();
  }
}

