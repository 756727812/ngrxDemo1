import { Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { getAccessFlag } from '../../utils';

@Directive({
  selector: '[seeAccess]',
})
export class SeeAccessDirective {
  constructor(
    private viewContainer: ViewContainerRef,
    private template: TemplateRef<any>,
  ) {}

  @Input()
  set seeAccess(roles) {
    if (getAccessFlag(roles)) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
