import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
// import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { applicationService } from 'app/services/application/application.service';
import { findIndex, find, padStart, get, map, debounce, merge } from 'lodash';
import echarts from 'echarts';

@Component({
  selector: 'app-event-assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.less'],
})
export class EventAssignComponent implements OnInit {
  constructor(
    private el: ElementRef,
    private modelService: NzModalService,
    // private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  ngOnInit() {}
}
