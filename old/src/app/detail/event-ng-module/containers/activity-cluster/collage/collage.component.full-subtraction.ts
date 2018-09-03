import { Component, OnInit, Input, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivityClusterService } from '../../../services/activity-cluster.service';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-marketing-full-subtraction',
  templateUrl: './collage.component.html',
  styleUrls: ['./collage.component.less'],
})
export class MarketingFullSubtractionComponent implements OnInit {
  validateForm: FormGroup;
  // @Input() tabIndex: number;
  tabIndex = 2;

  constructor(
    private fb: FormBuilder,
    private clusterService: ActivityClusterService,
    private cookieService: CookieService,
    private message: NzMessageService,
  ) {}

  ngOnInit() {
    this.validateForm = this.fb.group({
      dataRange: [null, null],
      keywordName: [''],
      keywordParent: ['', [ this.listValidator ]],
      keywordChild: ['', [ this.listValidator ]],
    });
    this.getCollageData();
  }

  checkedMap = {};
  get selectedCount(): number {
    let tmpCount = 0;
    const templateIds = Object.keys(this.checkedMap);
    templateIds.forEach(id => {
      if (this.checkedMap[id]) {
        tmpCount += 1;
      }
    });
    return tmpCount;
  }

  // 表单
  _activityType = '';
  activityTypes = [{ value: '0', label: '满额减' },{ value: '1', label: '满件折' }];
  _activityStatus;
  activityStatuss = [
    { value: '1', label: '待开始' },
    { value: '2', label: '进行中' },
    { value: '3', label: '已结束' },
  ];
  _dateRange = [null, null];
  _disabledDate(current: Date): boolean {
    return current && current.getTime() > Date.now();
  }
  _keywordName = '';
  _keywordParent = '';
  _keywordChild = '';
  params = {
    activityType: '3', // 1-拼团 2-秒杀 3-满减  默认值1
    page: 1,
    pageSize: 10,
  }; // 查询参数

  _disabledButton = true;
  _allChecked: boolean = false; // 表头是否选中
  _indeterminate: boolean;
  data = [];
  dataDisabled: boolean = false;

  loading = false;
  pageIndex = 1;
  pageSize = 10;
  total = 0;

  getFormControl(name) {
    return this.validateForm.controls[ name ];
  }
  listValidator(control: FormControl){
    const isNumber = /^\d+$/;
    if (control.value.length>0) {
      const arr  = control.value.split(/[,]/g);
      const ret = [];
      const result = arr.every(r=>{
        const s:string = `${r}`.trim() || '';
        ret.push(s);
        return s===''||(isNumber.test(s) && s.length<=9)
      });
      if(!result){
        return {list: true, error: true};
      }
      // return ret;
    }
  }
  checkedAll() {
    this._checkAll(true);
  }

  clearChecked() {
    this._allChecked = false;
    this._indeterminate = false;
    this._disabledButton = true;
    this.data.forEach((item, index) => {
      this.checkedMap[index] = false;
    });
  }

  _checkAll(value) {
    if (value) {
      this.data.forEach((item, index) => {
        if (item.activityStatus !== '3' && item.activityStatus !== '4') {
          this.checkedMap[index] = true;
        }
      });
    } else {
      this.data.forEach((item, index) => {
        if (item.activityStatus !== '3' && item.activityStatus !== '4') {
          this.checkedMap[index] = false;
        }
      });
    }
    console.log(this.checkedMap);
    this._refreshStatus();
  }

  _refreshStatus() {
    const allChecked =
      this.data.length &&
      this.data.every(
        (value, index) =>
          value.activityStatus === '3' ||
          value.activityStatus === '4' ||
          this.checkedMap[index] === true,
      );
    const allUnChecked = this.data.every(
      (value, index) =>
        value.activityStatus === '3' ||
        value.activityStatus === '4' ||
        !this.checkedMap[index],
    );
    this._allChecked = allChecked;
    this._indeterminate = !allChecked && !allUnChecked;
    this._disabledButton = !this.data.some(
      (value, index) => this.checkedMap[index],
    );
  }

  getCollageData(reset = false, searchData?) {
    if (reset) {
      this.pageIndex = 1;
    }
    this.loading = true;
    this.clearChecked();
    this.params = Object.assign(
      {},
      this.params,
      { page: this.pageIndex, pageSize: this.pageSize },
      searchData,
    );
    for (const key in this.params) {
      if (
        this.params.hasOwnProperty(key) &&
        (this.params[key] === '' || this.params[key] === null)
      ) {
        delete this.params[key];
      }
    }
    this.clusterService
      .getActivityAllList(this.params)
      .shareReplay()
      .subscribe(({ data }) => {
        this.loading = false;
        if (data) {
          this.total = data.count;
          this.data = data.list;
        }
        this.dataDisabled=this.clusterService.setDisabled(this.data);
      });
  }
  pageSizeChange() {
    this.pageIndex === 1 ? this.searchClick() : (this.pageIndex = 1);
  }

  searchClick() {
    console.log(this._dateRange);
    const startTime =
      this._dateRange[0] && moment(this._dateRange[0]).valueOf();
    const endTime =
      this._dateRange[1] &&
      moment(this._dateRange[1]).format('YYYY-MM-DD') + ' 23:59:59';
    const _option = {
      startTime: startTime / 1000 || '',
      endTime: moment(endTime).valueOf() / 1000 || '',
      thresholdType: this._activityType,
      activityStatus: this._activityStatus || '',
      nameAccount: $.trim(this._keywordName),
      motherIds: this._keywordParent.split(',').filter(k => k), // 母商品
      childIds: this._keywordChild.split(',').filter(k => k), // 子商品
    };
    this.getCollageData(true, _option);
  }

  // 强制结束
  coercion(item) {
    this.activityStop(item.activityId);
  }
  check_list = [];
  // 批量结束
  batchCoercion() {
    if (!this.selectedCount) {
      this.message.create('warning', '请至少选择一个活动');
      return;
    }
    this.data.forEach((item, index) => {
      if (this.checkedMap[index] === true) {
        this.check_list.push(item.activityId);
      }
    });
    this.activityStop(this.check_list.toString());
  }

  activityStop(ids) {
    this.clusterService
      .activityBatchStop({
        activityIds: ids,
        activityType: 3,
      })
      .subscribe(
        res => {
          this.check_list = [];
          this.checkedMap = {};
          this._indeterminate = false;
          if (res.result) {
            this.message.create('success', '强制结束活动成功');
            this.getCollageData();
          } else {
            this.message.create('error', '强制结束活动失败');
          }
        },
        err => this.message.create('error', '强制结束活动失败'),
      );
  }
}
