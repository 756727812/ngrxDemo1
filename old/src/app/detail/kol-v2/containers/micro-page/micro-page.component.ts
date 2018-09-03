import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { pickBy, isNil } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { map, filter, combineLatest } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { CateNavService, MicroPageService } from '../../services';
import { MicroPage } from '../../models';
import {
  ModalMicroPageModelComponent,
  ModalLinksComponent,
  ModalLinksComponentV2,
} from '../../components';
import { accessChecker } from '@utils';

@Component({
  selector: 'kol-micro-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'micro-page.component.html',
  styles: [
    `
      :host ::ng-deep .isHomePage {
        background-color: #5971e8;
        margin-left: 5px;
        position: static;
        transform: none;
      }
    `,
  ],
})
export class MicroPageComponent implements OnInit {
  options = [
    { label: '全部页面', value: null },
    { label: '已关联文章', value: 1 },
    { label: '未关联文章', value: 2 },
  ];
  themes = [
    { label: '默认-中性', value: 1 },
    { label: '可爱', value: 2 },
    // { label: '文艺', value: 3 },
    // { label: '逼格', value: 4 },
  ];
  form: FormGroup = this.fb.group({
    name: [null],
    range: [null],
  });
  page: number = 1;
  pageSize: number = 30;
  theme: number = this.themes[0].value;
  microPages$: Observable<MicroPage[]>;
  count$: Observable<number>;
  loading$: Observable<boolean>;
  kolInfo: fromStore.IKolData;
  _isSpinning: boolean = false;

  get isAdmin() {
    return accessChecker.isAdmin();
  }

  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private microPageServ: MicroPageService,
    private modalService: NzModalService,
    private baseInfoService: CateNavService,
  ) {
    store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(kolInfo => (this.kolInfo = kolInfo));
  }

  ngOnInit() {
    this.microPages$ = this.store.select(fromStore.getAllMicroPages);
    this.count$ = this.store.select(fromStore.getMicroPagesCount);
    this.loading$ = this.store.select(fromStore.getMicroPagesLoading);
    this.microPages$.subscribe(data => {
      this.theme = data.length ? data[0]['theme'] : this.themes[0].value;
    });
    this.baseInfoService.cateList({ kolId: this.kolInfo.kolId });
    this.route.queryParams.subscribe((params: Params) => {
      const { name, range = null, page = 1, pageSize = 30 } = params;
      this.page = page >>> 0;
      this.pageSize = pageSize >>> 0;
      this.form.patchValue({
        name,
        range: range >>> 0,
      });
      this.store.dispatch(
        new fromStore.LoadMicroPages({
          name,
          range,
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
        ...pickBy(this.form.value, value => !isNil(value) && value !== 'null'),
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

  setAsHomePage({ id }: MicroPage) {
    this.store.dispatch(new fromStore.SetHomePage(id));
  }

  copy({ id }: MicroPage) {
    this.store.dispatch(new fromStore.CopyMicroPage(id));
  }

  add() {
    this.openModal('创建页面').subscribe(result => {
      if (result.action === 'add') {
        this.store.dispatch(new fromStore.CreateMicroPage(result.value));
      }
    });
  }

  edit({ id, name }: MicroPage) {
    this.openModal('编辑页面', { name }).subscribe(result => {
      if (result.action === 'edit') {
        this.store.dispatch(
          new fromStore.UpdateMicroPage({ id, name: result.value }),
        );
      }
    });
  }

  links(item: any) {
    this.modalService.open({
      title: '微页面链接',
      componentParams: {
        modalLink: {
          xdpId: item.xdpId,
          type: item.type === 0 ? 2 : 1,
          typeId: item.id,
          kolId: this.kolInfo.kolId,
        },
      },
      content: ModalLinksComponentV2,
      width: 700,
      footer: false,
      maskClosable: false,
    });
  }

  private openModal(title: string, componentParams?: { [key: string]: any }) {
    return this.modalService.open({
      title,
      componentParams,
      content: ModalMicroPageModelComponent,
      footer: false,
      maskClosable: false,
    });
  }

  getStoreConstructionQueryParams(microPageId: number) {
    const { kolId, xdpId, wechatId } = this.kolInfo;
    return {
      kolId,
      xdpId,
      wechatId,
      micropageId: microPageId,
    };
  }
  changeTheme(theme) {
    this.store.dispatch(
      new fromStore.UpdateTheme({ theme, xdpId: Number(this.kolInfo.xdpId) }),
    );
  }

  // 打开微页面链接窗口
  openMicroPageLink(item: any) {
    this.modalService.open({
      title: '微页面链接',
      componentParams: {
        modalLink: {
          xdpId: item.xdpId,
          type: item.type === 0 ? 2 : 1,
          typeId: item.id,
          kolId: this.kolInfo.kolId,
          usageType: 0,
        },
      },
      content: ModalLinksComponentV2,
      width: 600,
      footer: false,
      maskClosable: false,
    });
  }
}
