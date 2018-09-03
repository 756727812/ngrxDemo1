import { getAccessFlag } from '../../utils';

export default function seeHide() {
  return function(
    scope: ng.IScope,
    element: ng.IAugmentedJQuery,
    attrs: ng.IAttributes,
  ) {
    if (getAccessFlag(attrs['seeHide'])) {
      element.remove();
    }
  };
}
