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
import echarts from 'echarts';
import { get, map, find, merge } from 'lodash';
import {
  xAxis,
  yAxis,
  COLOR_CARDS,
  genSerLine,
  getLinearColor,
} from '../../../utils/chart';

@Component({
  selector: 'app-bi-summary-article-block',
  templateUrl: './article-block.component.html',
  styleUrls: ['./article-block.component.less'],
})
export class BiSummaryArticleBlockComponent
  implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  list = [];
  rightNavHref = '';
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
  ngAfterViewInit() {
    // TODO 让 app.component.html 抽出组件，暴露一些通信方式，给菜单静态命名
    const contentBizHrefEL = $('#sidebar')
      .find('.nav-item-content-business')
      .find('a')
      .first();
    if (contentBizHrefEL.length) {
      this.rightNavHref = contentBizHrefEL.attr('href');
    }
  }

  ngOnDestroy() {}

  ngOnInit() {
    this.biService
      .fetchArticleList() //
      .subscribe(({ data }) => {
        if (data) {
          this.list = data;
        }
      });
  }
}
