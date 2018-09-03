function noop() { }

seePaging.$inject = ['$parse', '$location', '$routeParams', 'Notification']
function seePaging($parse, $location, $routeParams, Notification) {
  return {
    create: function(ctrl, $scope, $attrs) {
      ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : noop;
      // ctrl.ngModelCtrl = { $setViewValue: angular.noop }; // nullModelCtrl
      ctrl._watchers = [];

      ctrl.init = function(config) {
        // ctrl.ngModelCtrl = ngModelCtrl;
        ctrl.config = config;

        // ngModelCtrl.$render = function () {
        //   ctrl.render();
        // };

        if ($attrs.itemsPerPage) {
          ctrl._watchers.push($scope.$parent.$watch($attrs.itemsPerPage, function(value) {
            ctrl.itemsPerPage = parseInt(value, 10);
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }));
        } else {
          ctrl.itemsPerPage = config.itemsPerPage;
        }

        $scope.$watch('totalItems', function(newTotal, oldTotal) {
          if (newTotal !== void 0 || newTotal !== oldTotal) {
            $scope.totalPages = ctrl.calculateTotalPages();
            ctrl.updatePage();
          }
        });
      };

      ctrl.calculateTotalPages = function() {
        var totalPages = ctrl.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / ctrl.itemsPerPage);
        return Math.max(totalPages || 0, 1);
      };

      ctrl.render = function() {
        // $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue, 10) || 1;
        $scope.page = +$routeParams.page || 1
      };

      $scope.keyUpSelectPage = function(page, evt) {
        evt.keyCode === 13 && page && $scope.selectPage(page, evt)
      }

      $scope.selectPage = function(page, evt) {
        if (page === $scope.page) Notification.warn('你输入了当前页数')
        if (page > $scope.totalPages) page = $scope.totalPages
        if (evt) {
          evt.preventDefault();
        }

        var clickAllowed = !$scope.ngDisabled || !evt;
        if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
          if (evt && evt.target) {
            evt.target.blur();
          }
          // ctrl.ngModelCtrl.$setViewValue(page);
          // ctrl.ngModelCtrl.$render();
          if (!$scope.isNotChangeUrl) $location.search('page', page)
        } else {
          $scope.input_page = undefined
        }
      };

      $scope.getText = function(key) {
        return $scope[key + 'Text'] || ctrl.config[key + 'Text'];
      };

      $scope.noPrevious = function() {
        return $scope.page === 1;
      };

      $scope.noNext = function() {
        return $scope.page === $scope.totalPages;
      };

      ctrl.updatePage = function() {
        ctrl.setNumPages($scope.$parent, $scope.totalPages); // Readonly variable

        if ($scope.page > $scope.totalPages) {
          $scope.selectPage($scope.totalPages);
        } else {
          // ctrl.ngModelCtrl.$render();
          ctrl.render();
        }
      };

      $scope.$on('$destroy', function() {
        while (ctrl._watchers.length) {
          ctrl._watchers.shift()();
        }
      });
    }
  };
}

export default seePaging
