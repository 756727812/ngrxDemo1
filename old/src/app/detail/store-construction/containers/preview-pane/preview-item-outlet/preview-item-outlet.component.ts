import { get, head, last, indexOf, debounce } from 'lodash';
import {
  Component,
  OnInit,
  Output,
  Input,
  AfterViewInit,
  EventEmitter,
  Type,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import {
  Elem,
  ElemModel4Save,
  ElemType,
  ShowType,
  ElemUserVisible,
} from '../../../models/editor.model';
import * as fromStore from '../../../store';
import { DatePipe } from '@angular/common';
import { NzModalService, NzInputComponent } from 'ng-zorro-antd';

import {
  BigBannerComponent,
  CarouselBannerComponent,
  DoubleColGoodsListComponent,
  PreviewBasicInfoComponent,
  PreviewCouponListComponent,
  PreviewGroupBuyListComponent,
  SingleColGoodsListComponent,
  PreviewSpeedKillListComponent,
  PreviewMagicCubeComponent,
  PreviewSalesPromotionComponent,
  PreviewVideoInfoComponent,
} from '../preview-item';
import { CtrlWidgetOutletComponent } from '../../ctrl-pane/sub/ctrl-widget-outlet.component';
import { EditorService } from '../../../services/editor.service';

declare interface ElemEmitterModel {
  vid: string;
  data: any;
  valid?: boolean;
}

const COMP_MAP = {
  [ElemType.BASIC_INFO]: {
    comp: PreviewBasicInfoComponent,
  },
  [ElemType.EXPLORE_COL_GOODS]: {
    comp: SingleColGoodsListComponent,
  },
  [ElemType.COMMON_DOUBLE_COL_GOODS]: {
    comp: DoubleColGoodsListComponent,
  },
  [ElemType.COL_IMG]: {
    comp: BigBannerComponent,
  },
  [ElemType.CAROUSEL]: {
    comp: CarouselBannerComponent,
  },
  [ElemType.MAGIC_CUBE]: {
    comp: PreviewMagicCubeComponent,
  },
  [ElemType.MAGIC_CUBE_VIRTUAL]: {
    comp: PreviewMagicCubeComponent,
  },
  [ElemType.COUPON]: {
    comp: PreviewCouponListComponent,
  },
  [ElemType.GROUP_BUY]: {
    comp: PreviewGroupBuyListComponent,
  },
  [ElemType.GROUP_LOTTERY]: {
    comp: PreviewGroupBuyListComponent,
  },
  [ElemType.SPEED_KILL]: {
    comp: PreviewSpeedKillListComponent,
  },
  [ElemType.SALES_PROMOTION]: {
    comp: PreviewSalesPromotionComponent,
  },
  [ElemType.VIDEO_INFO]: {
    comp: PreviewVideoInfoComponent,
  },
  // [ElemType.SPEED_KILL]:  // TODO
  // [ElemType.GROUP_LOTTERY]:  // TODO
};

@Component({
  selector: 'app-preview-item-outlet',
  templateUrl: './preview-item-outlet.component.html',
  styleUrls: ['./preview-item-outlet.component.less'],
  providers: [DatePipe],
})
export class PreviewItemOutletComponent implements OnInit {
  @ViewChild(CtrlWidgetOutletComponent) ctrlOutlet: CtrlWidgetOutletComponent;
  @Input() type: string;
  @Input() elem: Elem;
  @Input() active: boolean;
  @Output() elemClick: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('nameInput') nameInput: NzInputComponent;
  sorter: string[];
  canUp: boolean = false;
  canDown: boolean = false;
  // @Output() configChange: EventEmitter<any> = new EventEmitter<any>();
  editMode: boolean = false;
  // @Output() configSave: EventEmitter<any> = new EventEmitter<any>();
  ElemType = ElemType;
  compClass: any;
  forCtrlVid: string;
  userVisible: boolean = true;
  removable: boolean = false;
  forVid$: Observable<string | null>;
  _markEnter = false;

  constructor(
    private store: Store<fromStore.StoreConstructionState>,
    private datePipe: DatePipe,
    private modelService: NzModalService,
    private editorService: EditorService,
  ) {}

  get nameValue() {
    return get(this.elem, 'data.name');
  }

  ngOnChanges(changes) {
    const { elem } = changes;
    // TODO when dev throw error if none type or none comp class
    const data = get(elem, 'currentValue.data');
    // TODO no any
    if (data) {
      const { type, showType, startTime, endTime, hidden } = data as any;
      this.compClass = get(COMP_MAP[type], 'comp');

      let userVisible = false;

      if (typeof hidden !== 'undefined') {
        userVisible = hidden === ElemUserVisible.SHOW;
      }
      // TODO 确定下这个状态能不能前端计算，是指当前最新发布的状态？还是「编辑时」状态
      /*else if (
        showType === ShowType.RANGE &&
        ((!startTime && !endTime) ||
          (startTime && this.dateCompareNow(startTime) > 0) ||
          (endTime && this.dateCompareNow(endTime) < 0))
      ) {
        userVisible = false;
      }*/

      this.userVisible = userVisible;
      this.removable = type !== ElemType.BASIC_INFO;
    } // 不可能 !data

    // >>TODO 这里原本不是必要的，但是没搞明白 ngOnInit 订阅更新 canUp 为啥后续被重置了
    this.updateSortAvail(this.sorter);
    // <<
  }

  ngOnInit() {
    // TODO 保证数据初始化之后才能够编辑表单

    this.store
      .select(fromStore.getCurElemVidForCtrl) //
      .subscribe(value => (this.forCtrlVid = value));

    const sorter$ = this.store
      .select(fromStore.getEditorElemSorter)
      .subscribe(arr => {
        // TODO rxjs5 怎么拿最新订阅的值？？？？
        this.sorter = arr;

        // NOTE: 原来这里更新 canUp canDown 是没问题
        // 不知道原因，这里更新后，在某个时刻 canUp 莫名其妙被更改了
        // 例如在 ngOnChanges 打印一下 看看
        this.updateSortAvail(arr);
      });

    this.forVid$ = this.store.select(fromStore.getCurElemVidForCtrl);
  }

  updateSortAvail(sorterArr) {
    const vid = this.elem.vid;
    const curElemType = get(this.elem, 'data.type');
    // const minElemCount = curElemType === ElemType.MAGIC_CUBE_VIRTUAL ? 0 : 1; // 资源位虚拟魔方-最少装修模块可以是0

    this.canUp =
      vid !== head(sorterArr) &&
      curElemType !== ElemType.BASIC_INFO &&
      indexOf(sorterArr, vid) > 1; // 大于1个模块才可以上移

    this.canDown =
      vid !== last(sorterArr) && curElemType !== ElemType.BASIC_INFO;
  }

  completeEdit() {
    // TODO 啥都没做也保存，优化下
    this.store.dispatch(
      new fromStore.EditorSaveElem({
        vid: this.elem.vid,
      }),
    );
    this.editMode = false;
  }

  handleNameInputBlur() {
    this.completeEdit();
  }

  handleNameInputKeypress(e) {
    if ((e.which || e.keyCode) === 13) {
      this.editMode = false;
      e.preventDefault();
    }
  }

  handleNameInputModelChange(newName) {
    this.store.dispatch(
      new fromStore.EditorUpdateElem({
        vid: this.elem.vid,
        value: { name: newName },
      }),
    );
  }

  handleClickElem(arg) {
    this.elemClick.emit();
  }

  handleClickRemove() {
    if (!this.removable) {
      return;
    }
    this.modelService.confirm({
      content: '确定删除，删除后点击发布在前端生效',
      onOk: () => {
        this.store.dispatch(
          new fromStore.EditorRemoveElem({
            elem: this.elem,
          }),
        );
      },
    });
  }

  // 跟现在比较，如果时间在以后，返回 > 0
  dateCompareNow(strTime) {
    return (
      parseInt(this.formatNumYMD(strTime), 10) -
      parseInt(this.formatNumYMD(new Date()), 10)
    );
  }

  formatNumYMD(date) {
    return this.datePipe.transform(date, 'yyyyMMdd');
  }

  handleClickUp() {
    this.dispatchOrderChange(-1);
  }

  handleClickDown() {
    this.dispatchOrderChange(1);
  }

  private dispatchOrderChange(dir) {
    const { vid } = this.elem;
    // TODO 三个 action 太傻了，优化下
    this.store.dispatch(new fromStore.EditorUpdateElemOrder({ dir, vid }));
    if (this.elem.data.id) {
      this.store.dispatch(new fromStore.EditorSaveElem({ vid }));
    }
    setTimeout(() => {
      this.editorService.scrollElemToVisibleByVid(vid);
    }, 10);
  }

  markAsDirty() {
    this.ctrlOutlet.markAsDirty();
  }

  handleSave(obj: ElemEmitterModel) {
    const targetElem = this.elem; // find(this.elems, { vid: obj.vid });
    if (!targetElem || !targetElem.data) {
      // TODO when dev
      console.error('保存的目标没有 data', targetElem);
      return;
    }
    this.store.dispatch(
      new fromStore.EditorSaveElem({
        vid: obj.vid,
      }),
    );
  }
  /**
   *
   * 对于修改 store，可以出现冗余的信息（不需要保存后台）
   * 便于在预览区或者别的地方使用
   */
  handleChange(obj: ElemEmitterModel) {
    // console.log('>>>handle change', obj);
    this.store.dispatch(
      new fromStore.EditorUpdateElem({
        valid: obj.valid,
        vid: obj.vid,
        value: obj.data,
      }),
    );
  }
}
