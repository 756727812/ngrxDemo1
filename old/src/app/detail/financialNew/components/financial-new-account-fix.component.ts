import { Component, OnInit, Inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';

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
  selector: 'financial-new-account-fix',
  templateUrl: './financial-new-account-fix.template.html',
})
export class FinancialNewAccountFix implements OnInit {
  validateForm: FormGroup;
  formatterMoney = value => `￥${value}`;
  parserDollar = value => value.replace('￥', '');
  orderErrorMsg: string;
  formErrorMsg: string[] = [];
  searchedXdpList: any[];
  searchChange$: any;

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
    this.validateForm = this.fb.group({
      kol: ['', [Validators.required, this.userNameValidator]],
      hedgingAmount: ['', [Validators.required, this.hedgingAmountValidator]],
      hedgingType: ['1', [Validators.required]],
      littleOrderIdList: [''],
      hedgingComment: [''],
    });

    this.searchChange$ = new Subject();
    this.searchChange$
      .filter(searchText => searchText)
      .debounceTime(500)
      .subscribe(searchText => {
        this.dataService
          .xiaodianpu_searchXdp({ keyword: searchText })
          .then(res => {
            this.searchedXdpList = res.data;
          });
      });
  }

  userNameValidator = (control: FormControl): any => {
    return !!control.value;
  };

  hedgingAmountValidator = (control: FormControl): any => {
    const s = control.value.toString().split('.');
    if (control.value === undefined) {
      return { required: true };
    }
    if (+control.value === 0) {
      return { error: true, zero: true };
    }
    if (s[1] && s[1].length > 2) {
      return { error: true, fraction: true };
    }
  };

  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const params = Object.assign({}, value, {
      hedgingAmount: Math.floor(value.hedgingAmount * 100),
      backendId: value.kol.backendId,
    });
    this.seeModal
      .confirmP(
        '提示',
        `
<p style="color: red;">请再次确认入账单信息，一旦创建将无法撤销：</p>
    <table class="table table-striped" style="margin-bottom:0;">
  <tr>
    <td>入账方</td>
    <td>${value.kol.sellerName}</td>
  </tr>
  <tr>
    <td>入账金额</td>
    <td>${value.hedgingAmount}</td>
  </tr>
  <tr>
    <td>关联订单</td>
    <td>${value.littleOrderIdList}</td>
  </tr>
  <tr>
    <td>入账说明</td>
    <td>${value.hedgingComment}</td>
  </tr>
</table>
    `,
      )
      .then(() => {
        delete params.kol; // 略去不必要的参数
        this.dataService
          .api_fms_billGenerate_accountFix(params)
          .then(res => {
            this.$location.path('/financialNew/recorded').hash('0');
          })
          .catch(err => {
            this.validateForm.controls['littleOrderIdList'].markAsDirty();
            this.validateForm.controls['littleOrderIdList'].setErrors({
              orderId: true,
            });
            this.orderErrorMsg = err.msg;
          });
      });
  };

  searchChange: (string) => void = searchText => {
    this.searchChange$.next(searchText);
  };

  ngOnInit() {}

  getFormControl(name) {
    return this.validateForm.controls[name];
  }
}
