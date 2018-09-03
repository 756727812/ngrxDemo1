import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { GoodsGroupService } from '../../services';
import { GoodsGroup } from '../../models';
import {
  ModalGoodsGroupMoedlComponent,
  ModalGoodsGroupAddGoodsComponent,
} from '../../components';
import { result } from 'lodash';
import { T_ORDER_TYPE } from '../../../goods/group/const';

@Component({
  selector: 'goods-group-list-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'goods-group-list.component.html',
  styleUrls: ['goods-group-list.component.less'],
})
export class GoodsGroupListContainerComponent implements OnInit {
  form: FormGroup = this.fb.group({
    keyword: [null],
  });
  editIndex = -1;
  editValue: string = '';
  page: number = 1;
  pageSize: number = 30;
  goodsGroups$: Observable<GoodsGroup[]>;
  count$: Observable<number>;
  loading$: Observable<boolean>;
  kolInfo: fromStore.IKolData;

  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit() {
    this.goodsGroups$ = this.store.select(fromStore.getAllGoodsGroups);
    this.count$ = this.store.select(fromStore.getGoodsGroupsCount);
    this.loading$ = this.store.select(fromStore.getGoodsGroupsLoading);
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(kolInfo => {
        this.kolInfo = kolInfo;
      });

    this.route.queryParams.subscribe((params: Params) => {
      const { keyword, page = 1, pageSize = 30 } = params;
      this.page = page >>> 0;
      this.pageSize = pageSize >>> 0;
      this.form.patchValue({
        keyword,
      });
      this.store.dispatch(
        new fromStore.LoadGoodsGroups({
          keyword,
          page,
          pageSize,
        }),
      );
    });
  }

  submitForm($event: UIEvent, value: any) {
    $event.preventDefault();

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...this.form.value,
        page: 1,
        pageSize: this.pageSize,
      },
    });
  }

  resetForm() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: 1, pageSize: this.pageSize },
    });
  }

  changePage() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: this.page, pageSize: this.pageSize },
      queryParamsHandling: 'merge',
    });
  }

  add(type: 1 | 2) {
    const titleMap = {
      1: '自动',
      2: '手动',
    };
    this.modalService
      .open({
        title: `添加${titleMap[type]}分组`,
        componentParams: { type, kolId: this.kolInfo.kolId },
        content: ModalGoodsGroupMoedlComponent,
        footer: false,
        maskClosable: false,
      })
      .subscribe(data => {
        if (data.action === 'ADD') {
          console.log(data.value);
          this.store.dispatch(
            new fromStore.CreateGoodsGroup({
              ...data.value,
              groupType: type,
            }),
          );
        }
      });
  }

  edit(index: number) {
    // 有项正在编辑
    if (this.editIndex !== -1) {
      return;
    }
    this.editIndex = index;
  }

  saveModel($event) {
    if (this.editIndex === -1) {
      return;
    }
    this.editValue = $event;
  }

  save({ categoryId }: GoodsGroup) {
    if (this.editIndex === -1) {
      return;
    }
    if (!(this.editValue || '').trim()) {
      this.notificationService.warning('警告', '商品分组名称不能为空');
      return;
    }
    this.store.dispatch(
      new fromStore.UpdateGoodsGroup({
        categoryId,
        categoryName: this.editValue,
      }),
    );
    this.editIndex = -1;
    this.editValue = '';
  }

  cancel() {
    this.editIndex = -1;
    this.editValue = '';
  }

  addGoods(item: GoodsGroup) {
    this.modalService.open({
      title: `添加商品（${item.categoryName}）`,
      componentParams: {
        groupId: item.categoryId,
      },
      content: ModalGoodsGroupAddGoodsComponent,
      footer: false,
      maskClosable: false,
      wrapClassName: 'see-modal-lg',
    });
  }

  deleteGoodsGroup(item: GoodsGroup) {
    this.store.dispatch(new fromStore.DeleteGoodsGroup(item.categoryId));
  }

  getViewHref(item: GoodsGroup) {
    return `/goods/groups/${item.categoryId}?group=${encodeURIComponent(
      JSON.stringify(item),
    )}&kolId=${this.kolInfo.kolId}`;
  }

  fmtCategoryList(item) {
    const { selectedCategoryList } = item;
    return selectedCategoryList
      ? selectedCategoryList.map(obj => obj.categoryName).join('、')
      : '';
  }

  fmtBrandList(item) {
    const { selectedBrandList } = item;
    return selectedBrandList
      ? selectedBrandList.map(obj => obj.brandName).join('、')
      : '';
  }

  fmtOrderType(item) {
    return result(T_ORDER_TYPE, item.orderType);
  }

  // fmtRangeDate(item) {
  //   const { itemCreateTimeFrom, itemCreateTimeTo } = item;
  //   return `${this.formatDate(itemCreateTimeFrom)} - ${this.formatDate(itemCreateTimeTo)}`;
  // }
}
