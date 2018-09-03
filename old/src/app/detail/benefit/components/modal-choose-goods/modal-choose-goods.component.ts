import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExcelExport } from '@shared/services';
import { cloneDeep, merge } from 'lodash';
import { NzModalSubject, NzNotificationService } from 'ng-zorro-antd';
import { parse } from 'query-string';
import { getProductIds, Utils } from '../../services/utils.service';
import { productIdValidator } from '../../validators/validators';
import { BenefitService } from './../../services/benefit.service';

@Component({
  selector: 'modal-choose-goods',
  templateUrl: './modal-choose-goods.component.html',
  styleUrls: ['./modal-choose-goods.component.less'],
})
export class ModalChooseGoodsComponent {
  _allChecked = false;
  _indeterminate = false;
  aForm: FormGroup;

  @Input() page: number = 1;
  @Input() pageSize: number = 30;
  @Input() count: number = 0;
  @Input() xiaodianpuId: number;
  @Input() groupId: number;
  @Input() activeId?: any;

  isError: boolean = false;
  isVisible: boolean = false;
  errorCodes: string = '';
  _displayData = [];
  items: any = {};
  _errors: number = 0;
  _success: number = 0;
  params: any = {};
  addedItems: any = {};
  cacheError: any = {};

  pageSizeSelectorValues: number[] = [30, 50, 80, 100];

  btnTitle = {
    fail: '添加失败',
    succ: '已添加',
    default: '添加',
  };

  classType = {
    fail: 'danger',
    succ: 'primary',
  };

  constructor(
    private modal: NzModalSubject,
    private utils: Utils,
    private notify: NzNotificationService,
    private fb: FormBuilder,
    private benefitService: BenefitService,
  ) {}

  ngOnInit() {
    this.params = parse(location.search);
    this.initForm();
  }

  handleOk() {
    this.isVisible = false;
  }

  handleCancel() {
    this.isVisible = false;
  }

  get loading() {
    return this.benefitService.loading;
  }

  private initForm() {
    this.aForm = this.fb.group({
      type: [''],
      parentIdList: ['', productIdValidator],
      productIdList: ['', productIdValidator],
      productName: [''],
    });
    this.loadData();
  }

  private mapItems(data) {
    const _items = cloneDeep(data);
    const items = _items.filter(r => !r.added).reduce((acc, c) => {
      if (!acc[c.productId]) {
        acc[c.productId] = c;
      }
      return acc;
    }, {});
    this.pickItems(items);
  }

  private setAdded(data) {
    data.map(r => {
      if (!this.addedItems[r.productId]) {
        this.addedItems[r.productId] = r;
      }
    });
  }

  private formFormat() {
    const { productName, parentIdList, productIdList } = this.aForm.value;
    return {
      productName,
      parentIdList: getProductIds(parentIdList),
      productIdList: getProductIds(productIdList),
    };
  }

  /**
   * 验证商品ID
   * @returns {Promise<any>}
   */
  private async getEmptyProduct() {
    const { productIdList, parentIdList: parentIds } = this.getForm;
    return (
      this.benefitService
        .validateProductId({
          productIdList,
          parentIds,
          xiaodianpuId: this.xiaodianpuId,
        })
        // .map(res => Object.keys(res).filter(r => !res[r]))
        .first()
        .toPromise()
    );
  }

  // 初始化跨页数据
  private initData = list => {
    this.mapItems(list);
    this.setAdded(list);
    this.setData(list);
    this._refreshStatus();
  };

  private getParams(data) {
    return {
      page: this.page,
      pageSize: this.pageSize,
      xiaodianpuId: this.xiaodianpuId,
      ...this.getForm,
      ...data,
    };
  }

  /**
   * 加载列表数据
   * @param data
   */
  private loadData(data = {}) {
    this.isError = false;
    this._indeterminate = false;
    this._allChecked = false;
    this.benefitService
      .searchShopProductByCondition(this.getParams(data))
      .map(({ list, count }) => {
        this.count = count;
        return list;
      })
      .subscribe(
        list => this.initData(list),
        e => {
          /* this.page = 1;
          this.count = 0;*/
        },
      );
  }

  close = () => this.reset() && this.modal.destroy('onCancel');
  reset = () => {
    this.addedItems = {};
    this.items = {};
    this.isError = false;
    this.isVisible = false;
    this.page = 1;
    return true;
  };
  toList = () => this.reset() && this.modal.next({ type: 'toList' });
  pickItems = items => (this.items = merge({}, this.items, items));
  pickItem = item => this.pickItems({ [item.productId]: item });
  pageChange = _ => {
    if (this.isError) return;
    this.loadData(this.cacheError);
  };
  // 需要过滤已经添加过的数据
  getIds = () =>
    Object.keys(this.items).filter(
      r => this.items[r].checked && !this.items[r].added,
    );

  /**
   * 提示用户哪些商品没找到
   * @param {any[]} data
   */
  showEmptyInfo(data: any[]) {
    this.isVisible = true;
    this.errorCodes = data.join('，');
  }

  /**
   * 表单搜索
   * @returns {Promise<void>}
   */
  async submitForm() {
    // this.isError 处理重复跳转的问题
    if (!this.aForm.valid || this.isError) return;
    const res = await this.getEmptyProduct();
    const nLen = Object.keys(res).length;
    const error = Object.keys(res).filter(r => !res[r]);
    this.isVisible = false;
    const data: any = {};
    if (error.length) {
      this._errors = error.length;
      this.showEmptyInfo(error);
      if (nLen === this._errors) {
        this.count = 0;
        this.initData([]);
        return;
      }
      data.productIdList = this.getForm.productIdList.filter(ea =>
        error.every(eb => eb !== ea),
      );
    }
    this.cacheError = data;
    this.loadData(data);
  }

  /**
   *  如果跨页数据
   * @param data
   */
  setData(data) {
    this._displayData = data
      .map(r => {
        r.checked = this.items[r.productId].checked;
        return r;
      })
      .map(r => {
        return this.addedItems[r.productId].added
          ? this.addedItems[r.productId]
          : r;
      });
  }

  get getForm() {
    return this.formFormat();
  }

  totalInfo() {
    return this.getIds().length;
  }

  get errors() {
    return this._errors;
  }

  get success() {
    return this._success;
  }

  _refreshStatus() {
    const allChecked = this._displayData.every(value => value.checked);
    const allUnChecked = this._displayData.every(value => !value.checked);
    this._allChecked = this._displayData.length > 0 && allChecked;
    this._indeterminate = !allChecked && !allUnChecked;
  }

  refreshStatus(status, data) {
    data.checked = !data.checked;
    this.pickItem(data);
    this._refreshStatus();
  }

  _checkAll(value) {
    if (value) {
      this._displayData.forEach(data => {
        data.checked = true;
        this.pickItem(data);
        return data;
      });
    } else {
      this._displayData.forEach(data => {
        data.checked = false;
        this.pickItem(data);
        return data;
      });
    }
    this._refreshStatus();
  }

  private async addProducts(data) {
    return this.benefitService
      .addProductToGroup({
        groupId: this.groupId,
        productIdList: data,
      })
      .first()
      .toPromise();
  }

  /**
   * 单条和多数数据处理一致，所以分开处理好点
   * @param ret
   */
  private addErrors(ret) {
    const ids = Object.keys(ret).filter(r => !ret[r].result);
    this.isError = true;
    this._errors = ids.length;
    this._success = this.totalInfo() - this._errors;
    this.addFail();
    this._displayData = ids.map(productId => {
      const { msg } = ret[`${productId}`];
      return {
        ...this.items[productId],
        msg,
      };
    });
    this.page = 1;
    this.count = ids.length;
    this.pageSize = this.count;
  }

  /**
   * 全部成功就到这里
   */
  private addSuccess() {
    this.notify.success('信息提示', '商品添加成功!');
    this.isError = false;
  }

  private addFail(msg = '商品添加失败!') {
    this.notify.warning('信息提示', msg);
  }

  async addOne(data) {
    if (data.added) return;
    try {
      const ret = await this.addProducts([data.productId]);
      const success = Object.keys(ret).every(r => ret[r].result);
      data.added = true;
      data.addStatus = success;
      data.btnTitle = success ? '已添加' : '添加失败';
      data._status = success ? 'primary' : 'danger';
      this.pickItem(data);
      this.totalInfo();
      this.addedItems[data.productId] = data;
      success && this.addSuccess();
    } catch (error) {
      this.addFail();
    }
  }

  async addParts() {
    const ids = this.getIds();
    if (ids.length === 0) {
      return this.addFail('请选择需要添加到分组的商品！');
    }
    this.items.length = 0;
    try {
      const ret = await this.addProducts(ids);
      const errors = Object.keys(ret).filter(r => ret[r].result === 0);
      if (errors.length) {
        return this.addErrors(ret);
      }
      this.addSuccess();
      this.toList();
    } catch (error) {
      this.addFail();
    }
  }

  tableExport($event: Event) {
    $event.stopPropagation();
    const header = [
      [
        '母商品ID',
        '子商品ID',
        /*'商品主图',*/ '商品名称',
        '类型',
        '价格',
        '销售状态',
        '失败原因',
      ],
    ];
    const items = [];
    for (const r of this._displayData) {
      const {
        parentId,
        productId,
        productName,
        productType,
        price,
        salesState,
      } = r;
      items.push([
        parentId,
        productId,
        productName,
        this.utils.saleType(productType),
        this.utils.rmb(price),
        this.utils.salesSates(salesState),
        r.msg,
      ]);
    }
    items.push([], ['总计' + this._displayData.length + '条']);
    const data: any[][] = [...header, ...items];
    ExcelExport.export2xlsx(data, {
      filename: this.utils.getExportFileName(
        this.activeId || this.params.id || this.params.xpdId,
      ),
    });
  }
}
