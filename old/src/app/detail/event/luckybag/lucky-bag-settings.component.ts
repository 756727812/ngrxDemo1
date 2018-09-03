import { Component, OnInit, Inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';

// import _ = require('lodash');
// import md5 = require('md5');
// import { checkFn, CODES } from '../../../utils/permission-helper';

import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'lucky-bag-settings',
  templateUrl: './lucky-bag-settings.template.html',
})
export class LuckyBagSettings implements OnInit {
  validateForm: FormGroup;
  formatterMoney = value => `￥${value}`;
  formatterPercent = value => `${value}%`;
  parserDollar = value => value.replace('￥', '');
  parserInt = value => parseInt(value, 10);
  formatterInt = value => (value ? parseInt(value, 10) : '');
  luckybagConfig: any = {};
  searchedXdpList: any[];
  searchChange$: any;
  loadingword: any;

  constructor(
    @Inject('$location') private $location: ng.ILocationService,
    @Inject('$routeParams') private $routeParams: ng.route.IRouteParamsService,
    @Inject('$q') private $q: ng.IQService,
    @Inject('Notification') private Notification: see.INotificationService,
    @Inject('dataService') private dataService: see.IDataService,
    @Inject('$cookies') private $cookies: ng.cookies.ICookiesService,
    @Inject('seeModal') private seeModal: see.ISeeModalService,
    @Inject('$uibModal') private $uibModal: ng.ui.bootstrap.IModalService,
    private message: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.loadingword = '刷新数据';
    this.getConfig();
  }
  refresh() {
    this.loadingword = '刷新数据...';
    this.getConfig();
  }
  getConfig() {
    this.dataService.luckybag_getConfig().then(data => {
      this.luckybagConfig = data.data;
      this.validateForm = this.fb.group({
        largeCashLuckybagMaxCount: [
          this.luckybagConfig.largeCashLuckybagMaxCount || 5000,
          [],
        ],
        largeCashLuckybagMaxPercentage: [
          this.luckybagConfig.largeCashLuckybagMaxPercentage || 5,
          [],
        ],
        cashLuckybagMax: [
          this.luckybagConfig.cashLuckybagMax || 1000000,
          [this.cashLuckybagMaxValidator],
        ],
        activityIntroduction: [this.luckybagConfig.activityIntroduction || ''],
        activityDetailedRules: [
          this.luckybagConfig.activityDetailedRules || '',
        ],
        withdrawNotice: [this.luckybagConfig.withdrawNotice || ''],
      });
      this.loadingword = '刷新数据';
    });
  }

  cashLuckybagMaxValidator = (control: FormControl): any => {
    if (control.value < this.luckybagConfig.unopenedCash * 10000) {
      return { bigger: true, error: true };
    }
  };

  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const params = Object.assign({}, value);
    this.dataService.luckybag_config(params).then(res => {
      this.Notification.success();
    });
  };

  ngOnInit() {}

  getFormControl(name) {
    return this.validateForm.controls[name];
  }
}
