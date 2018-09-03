import {
  Component,
  OnInit,
  Output,
  Input,
  OnDestroy,
  forwardRef,
  ViewChild,
  EventEmitter,
  ElementRef,
  AfterViewInit,
  OnChanges,
  NgZone,
} from '@angular/core';
import { find, map, get, indexOf, isEmpty } from 'lodash';
import { BiService } from '../../services/bi.service';
import { bizAccessChecker } from '../../../../utils/permission-helper';

const TIPS_MAP = {
  SUMMARY_REALTIME: `
今日实时数据的统计时间均为今日零时截至当前更新时间。<br/><br/>
付款金额(元)：所有订单用户实付金额之和<br/>
收益：所有付款订单所产生的收益之和(待入账收益+已入账收益，如有退款订单，收益会产生变化)<br/>
访客量：店铺被访问的去重人数，一个人在统计时间范围内访问多次只记为一个<br/>
浏览量：店铺被访问的次数，一个人在统计时间内访问多次记为多次<br/>
付款订单数：成功付款的订单数<br/>
付款人数：下单并且付款成功的客户数，一人多次付款记为一人<br/>
    `,

  BI_SUMMARY_TRADE: `
自然天，为选择日期前的7天数据，自然天不包含当日数据。<br/><br/>
自然周，为选择日期前4周数据，时间轴为日期区间<br/>
访客量：店铺被访问的去重人数，一个人在统计时间范围内访问多次只记为一个<br/>
下单数量：所有下单订单之和，包含未付款单量<br/>
下单转化率：下单数量/访客量<br/>
付款金额(元)：所有付款订单金额之和(去除优惠券金额)<br/>
客单价(元)：付款金额/付款人数<br/>
收益(元)：所有付款订单所产生的收益之和(待入账收益+已入账收益，如有退款订单，收益会产生变化)
    `,

  BI_TOPSALE_TH_TRAN: '付款人数/访问人数',

  BI_TRADE_DIST: `
自然天，为选择日期前的7天数据，自然天不包含当日数据<br/>
自然周，为选择周前4周数据，时间轴为日期区间<br/>
自然月，为选择月份前的6个月数据<br/>
    `,

  BI_TRADE_REBUY: '付款的老客户数/付款客户数',

  BI_TRADE_GOODS_NUM: '当前在售商品个数、不随时间变动',
};

@Component({
  selector: 'app-bi-mark-tip',
  templateUrl: './mark-tip.component.html',
  styleUrls: ['./mark-tip.component.less'],
})
export class BiMarkTipComponent implements OnInit, OnChanges {
  @ViewChild('tipHtmlCt') tipHtmlCt: ElementRef;
  @Input() visible: boolean = false;

  @Input() size: number = 12;

  @Input() tipName: string;
  @Input() tipContent: string;

  @Input() align: string = 'r-b';
  tipsOption: any;
  style: object;
  tipsHtml: string;

  constructor(private biService: BiService, private zone: NgZone) {}

  ngOnInit() {
    this.renderTip();
  }

  renderTip() {
    let html = '';
    if (this.tipContent) {
      html = this.tipContent;
    } else {
      this.tipsOption = TIPS_MAP[this.tipName];
      if (this.tipsOption && this.tipsOption.width) {
        this.style = {
          whiteSpace: 'pre-wrap',
          width: `${this.tipsOption.width}px`,
        };
      }
      html =
        typeof this.tipsOption === 'string'
          ? this.tipsOption
          : get(this.tipsOption, 'text');
    }
    this.tipsHtml = `<div>${html}</div>`;
  }

  ngOnChanges(change) {
    if (change.tipContent && change.tipContent.currentValue) {
      this.renderTip();
    }
  }
}
