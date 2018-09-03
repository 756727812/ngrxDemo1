import * as autosize from 'autosize';

const textareaAutosizeDirective = () => {
  return {
    restrict: 'A',
    replace: true,
    require: '?ngModel',
    link(scope, elem, attrs, ngModel) {
      ngModel &&
        scope.$watch(
          () => ngModel.$viewValue,
          () => {
            setTimeout(() => {
              autosize.update(elem);
            }, 1);
          },
        );
      scope.$on('$destroy', () => {
        autosize.destroy(elem);
      });
      autosize(elem);
    },
  };
};

export default textareaAutosizeDirective;
