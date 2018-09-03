import { BigBannerComponent } from './preview-item/big-banner/big-banner.component';
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { PreviewItemOutletComponent } from './preview-item-outlet/preview-item-outlet.component';
import * as fromStore from '../../store';
import { Elem, ElemType } from '../../models/editor.model';

const ELEM_INITIAL_PROMPT = {
  [ElemType.EXPLORE_COL_GOODS]: '请在右侧配置框内添加你所需要的商品',
  [ElemType.SPEED_KILL]: '请在右侧配置框内添加你的秒杀活动',
  [ElemType.GROUP_BUY]: '请在右侧配置框内添加你的拼团活动',
  [ElemType.GROUP_LOTTERY]: '请在右侧配置框内添加你的拼团活动',
  [ElemType.COUPON]: '请在右侧配置框内添加你的优惠券',
  [ElemType.CAROUSEL]:
    '请在右侧配置框内添加图片<br>尺寸为710*250的图片效果最好哟',
  [ElemType.COL_IMG]: '请在右侧配置框内添加图片<br>宽度710px的图片效果最好哟',
  [ElemType.COMMON_DOUBLE_COL_GOODS]:
    '通过商品分组，将多个商品分类显示在小电铺中',
  [ElemType.MAGIC_CUBE]: '请在右侧配置框内添加推荐尺寸的图片',
  [ElemType.MAGIC_CUBE_VIRTUAL]: '请在右侧配置框内添加推荐尺寸的图片',
  [ElemType.SALES_PROMOTION]: '请在右侧配置框内添加满减活动商品',
};

@Component({
  selector: 'app-preview-pane',
  templateUrl: './preview-pane.component.html',
  styleUrls: ['./preview-pane.component.less'],
})
export class PreviewPaneComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(PreviewItemOutletComponent)
  previewOutletList: QueryList<PreviewItemOutletComponent>;
  elems$: Observable<Elem[]>;
  focusElemVid$: Observable<string>;
  ElemType = ElemType;
  _sizeTimer: any;

  constructor(private store: Store<fromStore.StoreConstructionState>) {}

  ngOnInit() {
    this.elems$ = this.store.select(fromStore.getEditorElems);
    this.focusElemVid$ = this.store.select(fromStore.getCurFocusElemVid);
  }

  handleClickElem(elem) {
    this.store.dispatch(new fromStore.EditorFocusElem(elem));
  }

  trackByElem(elem, index) {
    // TODO 保证同类型的模块，如果没有保存，不允许添加下一个
    return elem.vid;
  }

  isConfigEmpty(config) {
    return Object.keys(config).length === 0;
  }

  getInitialWarning(type) {
    return ELEM_INITIAL_PROMPT[type];
  }

  markAllCtrlWidgetAsDirty() {
    // TODO 用事件总线的方式吧，每一层调用不好维护
    this.previewOutletList &&
      this.previewOutletList.forEach(outletWidget => {
        outletWidget.markAsDirty();
      });
  }

  ngAfterViewInit() {
    // TODO flex column 搜狗不支持，临时方案
    this._sizeTimer = setInterval(() => {
      try {
        const jEditor = $('.shop-construct-editor');
        const jPreviewWrap = jEditor.find('.preview-wrap');
        const mainHeight =
          jEditor[0].getBoundingClientRect().bottom -
          jPreviewWrap[0].getBoundingClientRect().top;

        jPreviewWrap.height(mainHeight);
        $('.res-pane').height(mainHeight); // TODO 在这里合适吗
      } catch (e) {}
    }, 1000);
  }
  ngOnDestroy() {
    clearInterval(this._sizeTimer);
  }
}
