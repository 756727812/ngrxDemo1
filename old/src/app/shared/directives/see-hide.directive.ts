import { Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { getAccessFlag } from '../../utils';

@Directive({
  selector: '[seeHide]',
})
export class SeeHideDirective {
  constructor(
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<any>,
  ) {}

  @Input()
  set seeHide(roles: string) {
    if (getAccessFlag(roles) === false) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
