import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { PreviewItemOutletComponent } from '../preview-pane/preview-item-outlet/preview-item-outlet.component';
import * as fromStore from '../../store';
import { Elem, ElemType } from '../../models/editor.model';
import { NzModalService } from 'ng-zorro-antd';
import { Actions } from '@ngrx/effects';
import { EditorService } from '../../services/editor.service';
import { cloneDeep, get } from 'lodash';

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
  selector: 'app-preview-column',
  templateUrl: './preview-column.component.html',
  styleUrls: ['./preview-column.component.less'],
})
export class PreviewColumnComponent implements OnInit, OnDestroy {
  @ViewChildren(PreviewItemOutletComponent)
  previewOutletList: QueryList<PreviewItemOutletComponent>;
  elems$: Observable<Elem[]>;
  focusElemVid$: Observable<string>;
  ElemType = ElemType;
  _sizeTimer: any;
  elemsCount$: any = null;
  elemsCount: object = {};
  destroy$: Subject<boolean> = new Subject<boolean>();
  // private _lastAppendedElem: Elem;

  item = {
    type: ElemType.MAGIC_CUBE_VIRTUAL,
    label: '魔方',
    limit: 5,
  };
  recommend: string = '1'; // 是否显示推荐
  isSpining: boolean = false;

  constructor(
    private store: Store<fromStore.StoreConstructionState>,
    private nzModalService: NzModalService,
    private editorService: EditorService,
    private actions$: Actions,
  ) {}

  ngOnInit() {
    this.elems$ = this.store.select(fromStore.getEditorElems);

    const element = this.store
      .select(fromStore.getEditorElems)
      .subscribe(arr => {
        // console.log("ngOnInit elems==",arr)
        if (Array.isArray(arr) && arr.length > 0) {
          this.recommend = get(arr[0], 'data.config.recommend') + '';
          // console.log("gggggget==",get(arr[0],"data.config.recommend"))
          localStorage.setItem('post_pay_recommend', this.recommend);
          this.magicCubeFocus(arr[0]);
          element && element.unsubscribe();
        }
      });

    // 获取魔方数量
    this.elemsCount$ = this.store.select(fromStore.getEditorElemsCount);
    this.elemsCount$ //
      .takeUntil(this.destroy$)
      .subscribe(value => {
        // console.log('elemsCount = ', value);
        const type = this.item.type; // 魔方类型: type: '-5'
        // 数据格式: {type:数量} 如{'-5',3}
        if (this.elemsCount[type] !== value[type]) {
          this.elemsCount = value; // 魔方数量改变
          this.setEditorHeight();
        }
      });

    // this.store
    //   .select(fromStore.getEditorLastAppendedElem)
    //   .takeUntil(this.destroy$) //
    //   .subscribe(value => {
    //     this._lastAppendedElem = value;
    //     console.log("_lastAppendedElem=",value)
    //   });

    // this.actions$
    //   .ofType(fromStore.EditorActionTypes.APPEND_ELEM_SUCCESS)
    //   .takeUntil(this.destroy$)
    //   .subscribe((action: fromStore.EditorAppendElemSuccess) => {
    //     const { elem } = action.payload;
    //     setTimeout(() => {
    //       if (elem) {
    //         this.editorService.scrollElemToVisibleByVid(elem.vid);
    //       }
    //     }, 10);
    //   });
  }

  magicCubeFocus(elem) {
    this.store.dispatch(new fromStore.EditorFocusElem(elem));
    this.DeleteIconStatus();
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
  hanldeClickItem(item) {
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
    // this.setEditorHeight();
  }
  setEditorHeight() {
    const editor = $('.editor');
    const curCount = this.elemsCount[ElemType.MAGIC_CUBE_VIRTUAL] || 1;
    // console.log('cur-count:', curCount);
    editor.height(curCount * 400 + 800);
  }

  // 是否显示[删除魔方]图标
  DeleteIconStatus() {
    const curCount = this.elemsCount[ElemType.MAGIC_CUBE_VIRTUAL] || 1;
    if (curCount < 2) {
      $('.fa-trash-o').hide();
    } else {
      $('.fa-trash-o').show();
    }
  }
  // ngAfterViewInit() {
  //   $('head').append(
  //     $(
  //       '<style>.virture-magic-cube .magic-cube-user-type{display:none}</style>',
  //     ),
  //   );
  // }
  ngOnDestroy() {
    clearInterval(this._sizeTimer);
  }

  // 是否显示推荐
  recommendChange() {
    // console.log('change.....');
    this.store
      .select(fromStore.getEditorElems)
      .subscribe(arrElement => {
        // const param = this.filterEditorData(value);
        const arrLength = arrElement.length;
        if (!Array.isArray(arrElement) || arrLength === 0) {
          return;
        }
        // debugger
        localStorage.setItem('post_pay_recommend', this.recommend);
        this.isSpining = true;
        // console.log('arrElement all ===', arrElement);
        arrElement.forEach((item, index, elem) => {
          const paramData = cloneDeep(item.data);
          // console.log('edit param ===', paramData);
          const preModuleId = get(arrElement, `[${index - 1}].data.id`);
          const nextModuleId = get(arrElement, `[${index + 1}].data.id`);
          paramData.preModuleId = preModuleId;
          paramData.nextModuleId = nextModuleId;

          // console.log("preModuleId==",preModuleId, "\nnextModuleId==",nextModuleId,)
          paramData.config.recommend = this.recommend;
          setTimeout(() => {
            const isLast = index === arrLength - 1;
            this.saveElement(paramData, isLast);
          }, index * 500);
        });
      })
      .unsubscribe();
  }

  // 保存魔方数据, 最后一个保存成功后更新保存时间
  saveElement(paramData, isLast) {
    if (isLast) {
      this.isSpining = false;
    }
    this.editorService.saveElem(paramData).subscribe(
      res => {
        if (res.result === 1 && isLast) {
          // console.log('saveElem result-----');
          this.store.dispatch(
            new fromStore.EditorUpdateMeta({ editTime: new Date() }),
          );
        }
      },
      err => {},
    );
  }
}
