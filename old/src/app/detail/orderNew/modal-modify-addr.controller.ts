import * as angular from 'angular';

modalModifyAddrController.$inject = [
  '$scope',
  '$uibModalInstance',
  'tmp',
  '$http',
  'Notification',
];
export function modalModifyAddrController(
  $scope,
  $uibModalInstance,
  tmp,
  $http,
  Notification,
) {
  angular.extend($scope, tmp);
  let data;
  $http.get('https://static.seecsee.com/seego_plus/new_citys.json').then(
    function(res) {
      if (res) {
        $scope.provinces = data = res.data;
        $scope.$watch('p', function(newV) {
          let v, _i, _len, _results;
          if (newV) {
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              v = data[_i];
              if (v.p === newV) {
                _results.push(($scope.cities = v.c));
              }
            }
            return _results;
          } else {
            return ($scope.cities = []);
          }
        });

        $scope.$watch('c', function(newV) {
          let v, _i, _len, _ref, _results;
          if (newV && $scope.cities) {
            _ref = $scope.cities;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              v = _ref[_i];
              if (v.n === newV) {
                _results.push(($scope.dists = v.a));
              }
            }
            return _results;
          } else {
            return ($scope.dists = []);
          }
        });
      } else {
        Notification.dataError('获取地址信息失败！');
      }
    },
    err => Notification.serverError(err),
  );
  $scope.aSet = {
    p(p) {
      $scope.p = p;
      $scope.c = null;
      $scope.a = null;
      return ($scope.d = null);
    },
    c(c) {
      $scope.c = c;
      $scope.a = null;
      return ($scope.d = null);
    },
    a(a) {
      $scope.a = a;
      $scope.d = null;
    },
  };
  $scope.clear = function() {
    $scope.p = null;
    $scope.c = null;
    $scope.a = null;
    return ($scope.d = null);
  };
  $scope.ok = function() {
    const param = {
      p: $scope.p || '',
      c: $scope.c || '',
      a: $scope.a || '',
      d: $scope.d || '',
    };
    $uibModalInstance.close(param);
  };
  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };
}

// export const modalModifyAddr = {
//   modalModifyAddrController: modalModifyAddrController
// }
