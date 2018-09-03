import { getAccessFlag } from '../../utils';

export default function seeAccess() {
  return function(
    scope: ng.IScope,
    element: ng.IAugmentedJQuery,
    attrs: ng.IAttributes,
  ) {
    if (!getAccessFlag(attrs['seeAccess'])) {
      element.remove();
    }
  };
}
