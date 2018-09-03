/**
 * Note:
 *  会修改 input 的 maxlength
 */
import {
  Directive,
  ElementRef,
  HostListener,
  Host,
  Self,
  Optional,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { NzInputComponent } from 'ng-zorro-antd';
import { defaultTo } from 'lodash';

@Directive({
  selector: '[preventFormAutocomplete]',
})
export class PreventFormAutocompleteDirective {
  constructor(private el: ElementRef, private view: ViewContainerRef) {}

  ngOnInit() {
    // this.el.nativeElement
  }

  ngAfterViewInit() {
    this.handle();
  }

  private handle() {
    const $el = $(this.el.nativeElement);
    let $hack = $el.find('.hack-prevent-form-autocomplete');
    if (!$hack.length) {
      // 为了屏蔽 chrome 自动填写表单
      // https://stackoverflow.com/questions/12374442/chrome-browser-ignoring-autocomplete-off#30873633
      $hack = $(
        `<div ><input type="text" d="HackPreventChromeAutocomplete" name="HackPreventChromeAutocomplete" /></div>`,
      );
      $hack.hide().prependTo($el);
    }
  }
}
