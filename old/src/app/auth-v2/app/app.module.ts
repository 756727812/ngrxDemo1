// 这个入口后面移到构建工具
import '../styles.less';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData, APP_BASE_HREF, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localeZhHans from '@angular/common/locales/zh-Hans';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { RoutesModule } from './routes.module';

import { authContainer } from './containers';
import { authComponent } from './components';

import { CookieModule } from 'ngx-cookie';
import * as authServices from './services';

import {
  DEFAULT_HTTP_TOPTIONS,
  DEFAULT_HTTP_TOPTIONS_TOKEN,
} from './core/net/http.options';

import { DefaultInterceptor } from './core/net/default.interceptor';

// 注册语言环境为中文
registerLocaleData(localeZhHans);

@NgModule({
  declarations: [AppComponent, ...authContainer, ...authComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RoutesModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CookieModule.forRoot(),
    ClipboardModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: DEFAULT_HTTP_TOPTIONS_TOKEN, useValue: DEFAULT_HTTP_TOPTIONS },
    { provide: APP_BASE_HREF, useValue: '!' },
    ...authServices.services,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private report: authServices.ReportService) {
    // 设置网站来源，在窗口打开期间都有效
    authServices.ReportService.checkReferFrom();
  }
}
