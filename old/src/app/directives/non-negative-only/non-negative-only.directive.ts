export default function nonNegativeOnly() {

  const directive = {
    link,
    restrict: 'A',
    require: 'ngModel',
  };
  return directive;

  function link(scope, element, attr, ngModelCtrl) {
    function fromUser(number) {
      if (typeof number === 'number') {
        const transformedInput = Math.abs(number);

        if (transformedInput !== number) {
          ngModelCtrl.$setViewValue(transformedInput);
          ngModelCtrl.$render();
        }
        return transformedInput;
      }
      return undefined;
    }
    ngModelCtrl.$parsers.push(fromUser);
  }
}
