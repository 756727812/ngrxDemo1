import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-goods-picker',
  templateUrl: './goods-picker.component.html',
  styleUrls: ['./goods-picker.component.less'],
})
export class EventGoodsPickerComponent implements OnInit {
  formGroup: FormGroup;
  keyword = '';
  _keyword = '';
  nzPageSizeSelectorValues = [5, 10, 20, 30];

  sortCreate: string = 'descend';
  isSortCreate: boolean = true;

  constructor(
    private subject: NzModalSubject,
    private fb: FormBuilder,
    private el: ElementRef,
    private eventService: EventService,
    private modelService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = true;

  reset() {
    this.refreshData(true);
  }

  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    // this._loading = false;
    // this._total = 1;
    // this._dataSet = [{
    //   createTime: '2018-01-09' ,
    //   dailyPriceEnd: 3 ,
    //   dailyPriceStart: 4 ,
    //   itemId : 111 ,
    //   productMainImgUrl: '商品图' ,
    //   productName: '商品名称' ,
    //   profitEnd: 23 ,
    //   profitStart: 12 ,
    //   salesVolume : 5 ,
    //   stock : 1
    // }];

    this._loading = true;
    const params = {
      page: this._current,
      pageSize: this._pageSize,
      name: this.keyword,
    };
    if (this.isSortCreate) {
      params['orderByCreateTime'] = this.sortCreate === 'ascend' ? 1 : 2;
    }
    this.eventService
      .fetchGroupEventProductList(params)
      // TODO 简化
      .pipe(
        catchError((error: any) => {
          this._loading = false;
          return Observable.of(null);
        }),
      )
      .subscribe(({ data }) => {
        this._loading = false;
        if (data) {
          this._total = data.count;
          this._dataSet = data.list;
        }
      });
  }

  ngOnInit() {
    this.refreshData();
  }

  selectItem(item) {
    if (item.productName.length > 128) {
      this.nzMessageService.create('warning', '商品名称不能超过128个字符');
      return;
    }
    this.subject.next(item);
    this.subject.destroy();
  }

  search() {
    this.keyword = this._keyword;
    this.reset();
  }

  sortByCreate(value) {
    if (value) {
      this.isSortCreate = true;
      this.reset();
    } else {
      this.isSortCreate = false;
      this.reset();
    }
  }
}
