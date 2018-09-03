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
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
// import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { BiService } from '../../../services/bi.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
// import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
// import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { applicationService } from 'app/services/application/application.service';
import { get } from 'lodash';
import * as moment from 'moment';
import { DATE_TYPE } from '../../../components/date-filter/date-filter.component';

const nowDate = moment();

@Component({
  selector: 'app-bi-trade-as-block',
  templateUrl: './as-block.component.html',
  styleUrls: ['./as-block.component.less'],
})
export class BiTradeAsBlockComponent implements OnDestroy {
  data: any = {};
  exportParams: any;

  // TODO remove any
  dateTypeOptions: any = [
    {
      type: DATE_TYPE.SINLGE_DAY_4_RANGE,
      delta: [0, 'days'],
      label: '自然天',
      options: {
        disabledDate(mDate) {
          return mDate.diff(nowDate, 'days') >= 0;
        },
      },
    },
    DATE_TYPE.RANGE_DAY,
  ];

  busy = false;

  constructor(
    private el: ElementRef,
    private modelService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private biService: BiService,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  ngAfterContentInit() {}
  ngAfterViewInit() {}

  ngOnDestroy() {}

  onDateFilterModelChange(dateVal) {
    this.refresh(dateVal);
  }

  refresh(dateVal) {
    const { val, type } = dateVal;
    const [start, end] = val;
    this.busy = true;
    const strStart = start.format('YYYY-MM-DD');
    const strEnd = end.format('YYYY-MM-DD');
    this.exportParams = [strStart, strEnd];
    if (start && end) {
      this.biService
        .fetchTradeAfterSaleData(
          start.format('YYYY-MM-DD'),
          end.format('YYYY-MM-DD'),
        ) //
        .subscribe(({ data }) => {
          this.busy = false;
          this.data = data || {};
        });
    }
  }
}
