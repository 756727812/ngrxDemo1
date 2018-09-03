import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Component, OnInit } from '@angular/core';

import { StoreConstructionState } from '../../store/reducers';
import * as fromStore from '../../store';
import { ElemType, Elem } from '../../models/editor.model';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CODES, getItem } from '@utils';
import { Subject } from 'rxjs';
import { EditorService } from '../../services/editor.service';
import 'rxjs/add/operator/takeLast';

interface IResItem {
  type: number;
  label: string;
  icon?: any;
  hidden?: boolean;
  limit?: number;
}

interface IResGroup {
  id: string;
  title: string;
  items: IResItem[];
}

@Component({
  selector: 'app-res-pane',
  templateUrl: './res-pane.component.html',
  styleUrls: ['./res-pane.component.less'],
})
export class ResPaneComponent implements OnInit {
  private _lastAppendedElem: Elem;
  isNewBrand = getItem('seller_privilege') >>> 0 === CODES.New_Brand;
  isAdmin = getItem('seller_privilege') >>> 0 !== CODES.Super_Admin;
  groups: IResGroup[] = [
    //
    {
      id: 'goods',
      title: '商品展示',
      items: [
        {
          type: ElemType.EXPLORE_COL_GOODS,
          label: '爆款商品',
          icon: require('./images/explore-col-goods.png'),
        },
        {
          type: ElemType.COMMON_DOUBLE_COL_GOODS,
          label: '日常双列商品',
          icon: require('./images/common-double-col-goods.png'),
          limit: 1,
        },
      ],
    },
    {
      id: 'img-txt',
      title: '图文导航',
      items: [
        //
        {
          type: ElemType.COL_IMG,
          label: '单列图片',
          icon: require('./images/col-img.png'),
        },
        {
          type: ElemType.CAROUSEL,
          label: '活动轮播',
          icon: require('./images/carousel.png'),
        },
        {
          type: ElemType.MAGIC_CUBE,
          label: '魔方',
          icon: require('./images/magic-cube.png'),
          limit: 5,
        },
        {
          type: ElemType.VIDEO_INFO,
          label: '视频',
          icon: require('./images/61074124177010300.png'),
          limit: 2,
          hidden: this.isAdmin,
        },
      ],
    },
    {
      id: 'market',
      title: '营销工具',
      items: [
        {
          type: ElemType.COUPON,
          label: '优惠券',
          icon: require('./images/coupon.png'),
          limit: 30,
        },
        {
          type: ElemType.GROUP_BUY,
          label: '拼团',
          icon: require('./images/group-buy.png'),
        },
        {
          type: ElemType.GROUP_LOTTERY,
          label: '抽奖团',
          icon: require('./images/group-lottery.png'),
          hidden: this.isNewBrand,
        },
        {
          type: ElemType.SPEED_KILL,
          label: '秒杀',
          icon: require('./images/speed-kill.png'),
        },
        {
          type: ElemType.SALES_PROMOTION,
          label: '满减活动',
          icon: require('./images/common-double-col-goods.png'),
          hidden: this.isNewBrand,
          limit: 4,
        },
      ],
    },
  ];

  activeType: string = '';
  elemsCount$: any = null;
  elemsCount: object = {};
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store<fromStore.StoreConstructionState>,
    private nzModalService: NzModalService,
    private editorService: EditorService,
    private actions$: Actions,
  ) {}

  ngOnInit() {
    this.elemsCount$ = this.store.select(fromStore.getEditorElemsCount);
    this.elemsCount$ //
      .takeUntil(this.destroy$) //
      .subscribe(value => {
        this.elemsCount = value;
      });

    this.store
      .select(fromStore.getEditorLastAppendedElem)
      .takeUntil(this.destroy$) //
      .subscribe(value => {
        this._lastAppendedElem = value;
      });

    this.actions$
      .ofType(fromStore.EditorActionTypes.APPEND_ELEM_SUCCESS)
      .takeUntil(this.destroy$)
      .subscribe((action: fromStore.EditorAppendElemSuccess) => {
        const { elem } = action.payload;
        setTimeout(() => {
          if (elem) {
            this.editorService.scrollElemToVisibleByVid(elem.vid);
          }
        }, 10);
      });
  }

  trackByGroup(i, group) {
    return group.id;
  }

  trackByItem(i, item) {
    return item.type;
  }

  async hanldeClickItem(item) {
    const { type, limit } = item;
    const curCount = this.elemsCount[type] || 0;
    if (limit && curCount >= limit) {
      this.nzModalService.info({
        content: `该模块暂时只能添加${limit}个`,
        okText: '编辑已有模块',
        cancelText: '取消',
        onOk: () => {
          // TODO focus
          this.store.dispatch(
            new fromStore.EditorFocusFirstElemByType({ type }),
          );
          this.editorService.scrollFirstTypeElemToVisible(type);
        },
      });
      return;
    }
    this.store.dispatch(new fromStore.EditorAppendElem(item));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }

  handleGroupClick(group) {
    group.isCollapse = !group.isCollapse;
  }
}
