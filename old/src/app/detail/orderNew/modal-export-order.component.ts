import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { NgForm, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { omit } from 'lodash';
import * as moment from 'moment';
import * as queryString from 'query-string';

import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';

import { _HttpClient } from '@shared/services';

type IFormData = {
  dateRange: Date[];
  type: number;
  xiaoDianPuId?: string;
};

@Component({
  selector: 'modal-export-order',
  templateUrl: './modal-export-order.component.html',
  styles: [
    `
    :host ::ng-deep .customize-footer {
      margin: 15px -16px -5px -16px;
    }
  `,
  ],
})
export class ModalExportOrder implements OnInit, OnDestroy {
  @ViewChild('f') form: NgForm;

  formData: IFormData = {
    type: 1,
    dateRange: [null, null],
  };
  searchOptions: any[] = [];
  search$ = new Subject<string>();

  constructor(
    private subject: NzModalSubject,
    private message: NzMessageService,
    private http: _HttpClient,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.search$
      .debounceTime(300)
      .switchMap(search => this.searchChange(search))
      .subscribe(res => {
        this.searchOptions = res.data;
      });
  }

  ngOnDestroy() {
    this.search$.unsubscribe();
  }

  resetForm() {
    this.formData.dateRange = [null, null];
    this.formData.xiaoDianPuId = undefined;
  }

  submitForm() {
    if (this.getFormControlInvalidate('dateRange')) {
      return false;
    }
    const {
      type,
      dateRange: [begin, end],
      xiaoDianPuId: curr_backend_id,
    } = this.formData;
    const params = {
      type,
      begin: moment(begin).format('YYYY-MM-DD'),
      end: moment(end).format('YYYY-MM-DD'),
      curr_backend_id: curr_backend_id || -1,
    };
    this.exportOrderData(params);
    this.subject.destroy('onOk');
  }

  getFormControlInvalidate(name: string): boolean {
    if (!this.form.submitted) {
      return false;
    }
    if (name === 'dateRange') {
      return this.formData.dateRange.some(r => r == null);
    }
    return !this.formData[name];
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  private searchChange(searchText: string) {
    const keyword = encodeURI(searchText);
    return this.http.post('/api/ng/couponv3/xdp/list', {
      formdata: { keyword },
    });
  }

  private exportOrderData(params) {
    window.open(
      `${
        location.origin
      }/api/CommonData/exportOrderDatav2?${queryString.stringify(params)}`,
    );
  }
}
