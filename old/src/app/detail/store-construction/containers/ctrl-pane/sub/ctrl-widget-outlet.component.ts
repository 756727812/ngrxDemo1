import { get } from 'lodash';
import {
  Component,
  OnInit,
  Output,
  Input,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Type,
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { MODAL_TYPE } from 'app/detail/store-construction/services';
import { CtrlWidgetBaseComponent } from './base.component';
import { Elem, ElemModel4Save, ElemType } from '../../../models/editor.model';
import * as fromStore from '../../../store';
import {
  CtrlWidgetBasicInfoComponent,
  CtrlWidgetExploreColGoodsComponent,
  CtrlWidgetCouponComponent,
  CtrlWidgetCarouselComponent,
  CtrlWidgetCommonDoubleColGoodsComponent,
  CtrlWidgetGroupAndSeckillComponent,
  CtrlWidgetColImgComponent,
  CtrlWidgetMagicCubeComponent,
  CtrlWidgetSalesPromotionComponent,
  CtrlWidgetVideoInfoComponent,
} from './index';
import { DynamicComponent } from 'ng-dynamic-component';

const COMP_CLASS_MAP = {
  [ElemType.BASIC_INFO]: {
    comp: CtrlWidgetBasicInfoComponent,
    title: '页面基础信息',
  },
  [ElemType.EXPLORE_COL_GOODS]: {
    comp: CtrlWidgetExploreColGoodsComponent,
    title: '爆款商品',
    modalType: MODAL_TYPE.HOT_GOODS,
  },
  [ElemType.COUPON]: { comp: CtrlWidgetCouponComponent, title: '优惠券' },
  [ElemType.CAROUSEL]: {
    comp: CtrlWidgetCarouselComponent,
    title: '活动轮播图',
  },
  [ElemType.COMMON_DOUBLE_COL_GOODS]: {
    comp: CtrlWidgetCommonDoubleColGoodsComponent,
    title: '日常双列商品',
    modalType: MODAL_TYPE.CATEGORY,
  },
  [ElemType.GROUP_BUY]: {
    comp: CtrlWidgetGroupAndSeckillComponent,
    title: '拼团活动',
    modalType: MODAL_TYPE.GROUP_BUY,
  },
  [ElemType.GROUP_LOTTERY]: {
    comp: CtrlWidgetGroupAndSeckillComponent,
    title: '抽奖团活动',
    modalType: MODAL_TYPE.GROUP_LOTTERY,
  },
  [ElemType.SPEED_KILL]: {
    comp: CtrlWidgetGroupAndSeckillComponent,
    title: '秒杀',
    modalType: MODAL_TYPE.SPEED_KILL,
  },
  [ElemType.COL_IMG]: { comp: CtrlWidgetColImgComponent, title: '单列图片' },
  [ElemType.MAGIC_CUBE]: {
    comp: CtrlWidgetMagicCubeComponent,
    title: '魔方',
  },
  [ElemType.MAGIC_CUBE_VIRTUAL]: {
    comp: CtrlWidgetMagicCubeComponent,
    title: '魔方',
  },
  [ElemType.SALES_PROMOTION]: {
    comp: CtrlWidgetSalesPromotionComponent,
    title: '满减活动',
  },
  [ElemType.VIDEO_INFO]: {
    comp: CtrlWidgetVideoInfoComponent,
    title: '视频',
  },
};

@Component({
  selector: 'app-ctrl-widget-outlet',
  templateUrl: './ctrl-widget-outlet.component.html',
  styleUrls: ['./ctrl-widget-outlet.component.less'],
})
export class CtrlWidgetOutletComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicComponent) dynamicComp: DynamicComponent;
  @Input() type: string;
  @Input() elem: Elem;
  @Output() configChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() configSave: EventEmitter<any> = new EventEmitter<any>();
  ElemType = ElemType;
  compClass: Type<any>;
  headTitle: string;
  currentModalType: string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  elem$: Subject<any> = new Subject();

  constructor(private store: Store<fromStore.StoreConstructionState>) {
    this.elem$
      .withLatestFrom(this.store.select(fromStore.getEditorIsAdmin))
      .subscribe(([elem, isAdmin]) => {
        const type = get(elem, 'currentValue.data.type');
        const compInfo =
          COMP_CLASS_MAP[get(elem, 'currentValue.data.type') as string] || {};
        // 外部权限，禁止抽奖团配置
        this.compClass =
          !isAdmin && type === ElemType.GROUP_LOTTERY ? null : compInfo.comp;
        this.headTitle = compInfo.title;
        this.currentModalType = compInfo.modalType;
      });
  }

  ngOnChanges(changes) {
    const { elem } = changes;
    // TODO when dev throw error if none type or none comp class
    if (elem) {
      this.elem$.next(elem);

      if (!elem.firstChange) {
        const lastVid = get(elem, 'currentValue.vid');
        const curVid = get(elem, 'previousValue.vid');
        if (lastVid && curVid && lastVid !== curVid) {
          // NOTE!!
          /*
          同类型某会交换顺序之后，配置组件应该要更新 formGroup 的值
          当然：配置组件内部去对 ngChanges 也行，目前只有排序会引起值的「非手动」变化
          */
          try {
            // TODO zone run 靠谱点?
            setTimeout(() => {
              this.dynamicComp.componentRef.instance.updateFormGroupValue(
                elem.currentValue.data,
              );
            }, 1);
          } catch (e) {}
        }
      }
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }
  ngAfterViewInit() {}

  // TODO 是不是有 host listener 之类的可以夸层传递？？
  // NOTE: 一定要 = ,保证该方法传递给组件时 bind this
  hanldeSave = configValue => {
    this.configSave.emit({
      vid: this.elem.vid,
      data: configValue,
    });
  };

  // NOTE: 一定要 = ,保证该方法传递给组件时 bind this
  hanldeChange = configValue => {
    // console.log('ctrl widget', configValue);
    this.configChange.emit({
      vid: this.elem.vid,
      ...configValue,
    });
  };

  handleClose() {
    this.store.dispatch(new fromStore.EditorCloseElemCtrl());
  }

  markAsDirty() {
    try {
      this.dynamicComp.componentRef.instance.markAsDirty();
    } catch (e) {}
  }
}
