import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { GoodsManageService } from '../../services';
import { ModalLinksComponentV2 } from '../../components';

@Component({
  selector: 'kol-goods-management',
  templateUrl: 'goods-management.component.html',
})
export class GoodsManagementComponent implements OnInit {
  form: FormGroup = this.fb.group({
    keyword: [null],
  });
  page: number = 1;
  pageSize: number = 30;
  count: number = 0;
  loading: boolean = false;
  kolInfo: fromStore.IKolData;
  goods: any[] = [];
  searchForm: FormGroup;
  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
    private goodsManageService: GoodsManageService,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
    this.getGoods();
  }

  buildForm(): void {
    this.searchForm = this.fb.group({
      parentItemIds: [],
      itemIds: [],
      itemName: [],
    });
  }

  search(): void {
    this.page = 1;
    this.getGoods();
  }

  getGoods(): void {
    this.loading = true;
    const { itemName, itemIds, parentItemIds } = this.searchForm.value;
    const params = {
      itemName: itemName && itemName.trim(),
      itemIds: itemIds && itemIds.trim(),
      parentItemIds: parentItemIds && parentItemIds.trim(),
      page: this.page,
      pageSize: this.pageSize,
      kolId: this.kolInfo.kolId,
      saleStatus: '',
    };

    this.goodsManageService.getGoodsList(params).subscribe(
      (data: any) => {
        this.goods = data.items;
        this.count = data.totalCount;
        this.loading = false;
      },
      () => {
        this.loading = false;
      },
    );
  }

  showLink(item) {
    this.modalService.open({
      title: '商品链接',
      componentParams: {
        modalLink: {
          xdpId: this.kolInfo.xdpId,
          type: 0,
          typeId: item.itemId,
          kolId: this.kolInfo.kolId,
        },
      },
      content: ModalLinksComponentV2,
      width: 700,
      footer: false,
      maskClosable: false,
    });
  }

  changePage() {
    this.getGoods();
  }
}
