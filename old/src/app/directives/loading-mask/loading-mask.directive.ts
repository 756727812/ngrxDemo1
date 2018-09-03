const loadingMaskDirective = () => {
  return {
    restrict: 'A',
    scope: {
      loadingMask: '=',
    },
    link(scope, elem, attrs, ngModel) {
      let maskEl = $(
        // tslint:disable-next-line:max-line-length
        `<div class="spinner loading-mask"><div class="bounce1"></div><div class="bounce2"></div> <div class="bounce3"></div> </div>`,
      );
      if (attrs.loadingMask !== 'true') {
        maskEl.hide();
      }
      maskEl.appendTo(elem);
      scope.$watch('loadingMask', (newValue, oldValue) => {
        if (
          (newValue === true || newValue === false) &&
          newValue !== oldValue
        ) {
          maskEl.toggle(newValue);
          $(elem).css('pointer-events', newValue ? 'none' : 'initial');
        }
      });
      scope.$on('$destroy', () => {
        maskEl.remove();
        maskEl = null;
      });
    },
  };
};

export default loadingMaskDirective;
