// 这个入口后面移到构建工具
import '../styles.less';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import localeZhHans from '@angular/common/locales/zh-Hans';

import { StoreModule, MetaReducer } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { storeFreeze } from 'ngrx-store-freeze';

import { SortablejsModule } from 'angular-sortablejs';
import * as moment from 'moment';
import 'moment/locale/zh-cn';

import { AppComponent } from './app.component';
import { EmptyComponent } from '@shared/components';
import { SharedModule } from './shared/shared.module';
import { RoutesModule } from './detail/routes.module';
import { DefaultInterceptor } from './core/net/default.interceptor';
import {
  DEFAULT_HTTP_TOPTIONS,
  DEFAULT_HTTP_TOPTIONS_TOKEN,
} from './core/net/http.options';
import { reducers, effects, CustomSerializer } from './store';
import { ReportService } from '@shared/services/report/report.service';

// 注册语言环境为中文
registerLocaleData(localeZhHans);
moment.locale('zh-cn');

export const metaReducers: MetaReducer<any>[] =
  process.env.NODE_ENV === 'development' ? [storeFreeze] : [];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule.forRoot(),
    RoutesModule,
    SortablejsModule.forRoot({ animation: 150 }),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),
    StoreRouterConnectingModule,
    process.env.NODE_ENV === 'production'
      ? []
      : StoreDevtoolsModule.instrument(),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: DEFAULT_HTTP_TOPTIONS_TOKEN, useValue: DEFAULT_HTTP_TOPTIONS },
    { provide: RouterStateSerializer, useClass: CustomSerializer },
  ],
  bootstrap:
    window.location.pathname === '/auth.html'
      ? [EmptyComponent]
      : [AppComponent],
})
export class AppModule {
  constructor() {
    // 设置网站来源，在窗口打开期间都有效
    ReportService.checkReferFrom();
  }
}
