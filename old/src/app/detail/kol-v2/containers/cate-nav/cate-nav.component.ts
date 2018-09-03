import { Component, OnInit } from '@angular/core';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { CateConfigModalComponent } from '../../components/cate-config-modal/cate-config-modal.component';
import { CateNavService } from '../../services/cate-nav.service';
import * as fromStore from '../../store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-cate-nav',
  templateUrl: './cate-nav.component.html',
  styleUrls: ['./cate-nav.component.less'],
})
export class CateNavComponent implements OnInit {
  data = [];
  kolInfo: fromStore.IKolData;

  cateList: any;

  constructor(
    private modalService: NzModalService,
    private notify: NzNotificationService,
    private store: Store<fromStore.KolState>,
    private cateNavService: CateNavService,
  ) {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
  }

  ngOnInit() {
    this.initLoad();
  }

  private initLoad() {
    this.cateNavService
      .cateList({
        kolId: this.kolInfo.kolId,
      })
      .subscribe(r => {
        this.data = r;
      });
  }

  trackById(index, m) {
    return m.id;
  }

  get loading() {
    return this.cateNavService.loading;
  }

  private getProps(config) {
    return {
      mapCate: this.getCateList(config),
      mallClassName:
        config.type === 'addNew' ? '' : config.data.mallKolClassName,
    };
  }

  private getParams(ret, config) {
    const params: any = {
      kolId: this.kolInfo.kolId,
      ...ret.data,
    };

    if (config.type === 'edit') {
      params.mallKolClassId = config.data.mallKolClassId;
    }
    return params;
  }

  private _cateConfig(config) {
    const subscription = this.modalService.open({
      title: '前端类目配置',
      content: CateConfigModalComponent,
      componentParams: this.getProps(config),
      width: '600px',
      footer: false,
      maskClosable: false,
    });
    subscription.subscribe(ret => {
      if (ret.data) {
        this.cateNavService
          .cateSave(this.getParams(ret, config))
          .subscribe(r => {
            subscription.destroy();
            this.initLoad();
          });
      }
    });
  }

  private cateConfig(config) {
    const params: any = {
      kolId: this.kolInfo.kolId,
    };

    if (config.type === 'edit') {
      params.mallKolClassId = config.data.mallKolClassId;
    }

    this.cateNavService.cateMallKolClass(params).subscribe(r => {
      this.cateList = r;
      this._cateConfig(config);
    });
  }

  addNew() {
    if (this.data.length >= 50) {
      this.notify.warning('信息提示', '新建失败，超过50条记录上限');
      return;
    }
    return this.cateConfig({
      type: 'addNew',
    });
  }

  edit(m) {
    return this.cateConfig({
      type: 'edit',
      data: { ...m },
    });
  }

  private getCateList(config) {
    const data = this.cateList.relateList.map(r => {
      r.checked = false;
      r.label = r.className;
      r.value = r;
      return r;
    });
    if (config.type === 'addNew') return data;
    return data.reduce((a, r) => {
      config.data.relateList.map(b => {
        if (r.classId === b.classId) r.checked = true;
      });
      a.push(r);
      return a;
    }, []);
  }

  private swap(arr, inc, del) {
    arr[inc] = arr.splice(del, 1, arr[inc])[0];
    return arr;
  }

  sortAsc(index) {
    const sortUp = (arr, idx, len) => {
      if (idx !== 0) {
        return this.swap(arr, idx, idx - 1);
      }
      return arr;
    };
    this.data = sortUp([...this.data], index, this.data.length);
    index &&
      this.cateNavService
        .cateSort(this.getSortIds())
        .subscribe(r => this.initLoad());
  }

  private getSortIds() {
    return {
      sortMallKolClassIds: this.data.map(r => r.mallKolClassId).join(','),
    };
  }

  sortDesc(index) {
    const sortDown = (arr, idx, len) => {
      if (idx + 1 !== len) {
        return this.swap(arr, idx, idx + 1);
      }
      return arr;
    };
    this.data = sortDown([...this.data], index, this.data.length);
    index !== this.data.length - 1 &&
      this.cateNavService
        .cateSort(this.getSortIds())
        .subscribe(r => this.initLoad());
  }

  cateSwitch(m) {
    this.cateNavService
      .cateSwitch({
        mallKolClassId: m.mallKolClassId,
        isPublic: m.isPublic ? 1 : 0,
      })
      .subscribe(r => this.initLoad());
  }

  cateDel(m) {
    this.cateNavService
      .cateDel({
        mallKolClassId: m.mallKolClassId,
      })
      .subscribe(r => this.initLoad());
  }
}
