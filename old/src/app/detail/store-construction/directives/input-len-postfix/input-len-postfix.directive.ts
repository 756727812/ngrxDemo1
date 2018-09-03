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

// refer https://github.com/babel/babel/tree/master/packages/babel-plugin-proposal-unicode-property-regex
const CN_REG = /(?:[\u3400-\u4DB5\u4E00-\u9FEA\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0])/;
// TODO common utils
const calcEnLen = val => (val || '').replace(/[\u4e00-\u9fa5]/g, 'xx').length;
const cut = (val, cnMaxLen) => {
  const enMaxLen = cnMaxLen * 2;
  if (!val) {
    return val;
  }
  let enLen = calcEnLen(val);
  if (enLen <= enMaxLen) {
    return val;
  }
  let resultVal = val;
  while (enLen > enMaxLen) {
    resultVal = resultVal.substr(0, resultVal.length - 1);
    enLen = calcEnLen(resultVal);
  }
  return resultVal;
};

@Directive({
  selector: '[inputLenPostfix]',
})
export class InputLenPostfixDirective {
  constructor(
    private el: ElementRef,
    private view: ViewContainerRef,
    @Host()
    @Self()
    @Optional() // 暂时只考虑在 nz-input 组件上使用，后面有需要在实现 原生 input
    public nzInputComp: NzInputComponent,
  ) {}

  ngOnInit() {
    this.setupInputLimit();
  }

  setupInputLimit() {
    // tslint:disable-next-line: no-var-self
    const dirSelf = this;
    const initEnMaxLen = dirSelf.max * 2;
    const _onChange = this.nzInputComp.onChange;
    this.nzInputComp.onChange = function(value) {
      const valEnLen = calcEnLen(value);
      const meetMax = valEnLen >= initEnMaxLen;
      if (meetMax) {
        const filteredVal = cut(value, dirSelf.max);
        if (filteredVal !== value) {
          setTimeout(() => {
            // setTimeout 保证触发 zone，更改 dom 值
            this.nzValue = filteredVal;
          }, 1);
          return;
        }
      }
      _onChange.call(this, value);
      // 下面代码保证，达到界限之后，不允许输入，避免输入后截断，界面闪烁
      const maxlength = meetMax
        ? Math.min(value.length, initEnMaxLen)
        : initEnMaxLen;
      $(dirSelf.el.nativeElement)
        .find('input.ant-input')
        .attr('maxlength', maxlength);
    };
  }

  ngAfterViewInit() {
    this.handle();
    $(this.el.nativeElement)
      .find('input.ant-input')
      // TODO 需求文档说 如果显示 12 则可以输入 24 英文字符，12 个汉字
      .attr('maxlength', this.max * 2)
      .css('paddingRight', '45px');
    // console.log($(this.el.nativeElement).find('input.ant-input'));
  }

  @Input('inputLenPostfix') max: number;

  // TODO 如果 input 不够用，就直接拦截 nzInputComp 里面的方法
  @HostListener('input')
  onInput() {
    this.handle();
  }

  @HostListener('compositionend')
  onCompositionend() {
    this.handle();
  }

  private calcLen() {
    let value = '';
    try {
      value = defaultTo(this.nzInputComp.nzValue, '');
    } catch (e) {}
    return Math.ceil(calcEnLen(value) / 2);
  }

  private buildStr(): string {
    return `${Math.min(this.calcLen(), this.max)} / ${this.max}`;
  }

  private handle() {
    const $wrap = $(this.el.nativeElement).closest('.ant-form-item-control');
    let $tips = $wrap.find('.input-len-postfix');
    if (!$tips.length) {
      $tips = $(`<div class="input-len-postfix">${this.buildStr()}</div>`);
      $tips.css({
        position: 'absolute',
        right: '10px',
        'font-size': '12px',
        color: '#999',
        transform: 'translateY(-50%) scale(0.83)',
        top: '50%',
        'transform-origin': 'center right',
      });
      $tips.appendTo($wrap);
    } else {
      $tips.text(this.buildStr());
    }
  }
}
