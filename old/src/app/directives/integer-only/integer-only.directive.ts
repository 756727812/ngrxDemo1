export default function integerOnly() {

  const directive = {
    link,
    restrict: 'A',
    require: '?ngModel',
  };
  return directive;

  function link(scope, element, attr, ngModelCtrl) {
    function fromUser(number: number) {
      if (typeof number === 'number') {
        const transformedInput = Number(number.toString().replace(/[^0-9]/g, ''));

        if (!Object.is(transformedInput, number)) {
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
