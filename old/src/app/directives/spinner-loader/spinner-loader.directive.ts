ngSpinnerLoader.$inject = ['$rootScope', '$http'];
function ngSpinnerLoader($rootScope, $http) {
  // Usage:
  // <div ng-spinner-loader class="page-spinner-loader">
  // Creates:
  //
  const directive = {
    link,
    restrict: 'A',
  };
  return directive;

  function link(scope, element, attrs) {
    element.addClass('hide');

    $rootScope.$on('$routeChangeStart', () => {
      element.removeClass('hide');
    });

    $rootScope.$on('$routeChangeSuccess', () => {
      element.addClass('hide');

      $('html, body').animate(
        {
          scrollTop: 0,
        },
        500,
      );
    });
    // scope.isLoading = function() {
    //   const pendingRequests = $http.pendingRequests
    //   if (pendingRequests.length === 1 && pendingRequests[0]._noSpinner) {
    //     return false
    //   }
    //   return pendingRequests.length > 0;
    // };
    // scope.$watch(scope.isLoading, function(v) {
    //   if (v) {
    //     element.removeClass('hide')
    //   } else {
    //     element.addClass('hide')
    //   }
    // })
  }
}

export default ngSpinnerLoader;
