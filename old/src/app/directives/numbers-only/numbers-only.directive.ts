export default function numbersOnly() {

  const directive = {
    link,
    restrict: 'A',
    require: 'ngModel',
  };
  return directive;

  function link(scope, element, attr, ngModelCtrl) {
    function fromUser(text: string) {
      if (text) {
        const transformedInput = text.replace(/[^0-9]/g, '');

        if (transformedInput !== text) {
          ngModelCtrl.$setViewValue(transformedInput);
          ngModelCtrl.$render();
        }
        return transformedInput;
      }
      return text;
    }
    ngModelCtrl.$parsers.push(fromUser);
  }
}
