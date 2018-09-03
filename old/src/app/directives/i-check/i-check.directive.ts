iCheck.$inject = ['$timeout'];
function iCheck($timeout) {
  // Usage:
  //
  // Creates:
  //
  var directive = {
    require: '?ngModel',
    link: link,
  };
  return directive;

  function link($scope, element, $attrs, ngModel) {
    return $timeout(function() {
      let value = $attrs['value'], skin = $attrs['skin']

      $scope.$watch($attrs['ngModel'], function(newValue) {
        (<any>$(element)).iCheck('update');
      })

      return (<any>$(element)).iCheck({
        checkboxClass: skin || 'icheckbox_minimal',
        radioClass: skin || 'iradio_minimal',
        labelHover: false

      }).on('ifChanged', function(event) {
        setTimeout(() => {
          if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
            $scope.$apply(function() {
              return ngModel.$setViewValue(event.target.checked);
            });
          }
          if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
            return $scope.$apply(function() {
              return ngModel.$setViewValue(value);
            });
          }
        },500);
        
      });
    });
  }
}

export default iCheck
