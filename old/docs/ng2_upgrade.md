# ng2 升级指南 Deprecated

## 前提

了解 [angular-cli](https://github.com/angular/angular-cli/wiki) 项目结构

## 使用 ng2 第三方包

第三方模块等统一在 `src/app/shared/shared.module.ts` 进行 import，并确保在 NgModule 的 `exports` 项中声明。

第三方样式统一在 `src/styles.less` 中 `@import`。如：

``` less
@import '~icheck/skins/all.css';
```

## 编写跨业务组件/指令

统一放在 `src/app/shared` 目录下，并按照类型分放，并归属于 `SharedModule`。

## ng1 使用 ng2 组件

在 `src/app/app.module.ts` 中使用 `upgradeAdapter` 对象的 `downgradeNg2Component` 包装后注册到 ng1 根 Module - `angular.module('seego')`，如：

``` typescript
import { AppComponent } from './app.component';
import { NzButtonComponent } from 'ng-zorro-antd';

angular
  .module('seego')
  .directive('appRoot', upgradeAdapter.downgradeNg2Component(
    AppComponent,
  ) as ng.IDirectiveFactory)
  .directive('nzButton', upgradeAdapter.downgradeNg2Component(
    NzButtonComponent,
  ) as ng.IDirectiveFactory)
```

## ng1 使用 ng2 Provider

同上，使用 `upgradeAdapter.downgradeNg2Provider`:

``` typescript
angular.module('interestApp')
  .factory(
    'AnalyticsService',
    upgradeAdapter.downgradeNg2Provider(AnalyticsService),
  );
```

## ng2 使用 ng1 Provider

在 `src/app/app.module.ts`：
``` typescript
upgradeAdapter.upgradeNg1Provider('dataService');
```

实际使用时：

``` typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    @Inject('dataService') private dataService: see.IDataService,
  ) {}

  private getData(): ng.IPromise<any> {
    return this.dataService.getData()
  }
}

```

## ng2 使用 ng1 Component/Directive

``` typescript
const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
const module = angular.module('myExample', []);
module.directive('greet', () => {
  return {
    scope: { salutation: '=', name: '=' },
    template: '{{salutation}} {{name}}! - <span ng-transclude></span>',
  };
});
module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));
@Component({
  selector: 'ng2',
  template:
    'ng2 template: <greet salutation="Hello" [name]="world">text</greet>',
})
class Ng2Component {}
@NgModule({
  declarations: [Ng2Component, adapter.upgradeNg1Component('greet')],
  imports: [BrowserModule],
})
class MyNg2Module {}
```

## HTTP 请求

AJAX 请求使用 `src/app/shared/services/http/http.client.ts` 中封装的 `HTTPClient`，主要是方便参数传递和 loading 统一管理。

``` typescript
import { Injectable } from '@angular/core';
import { _HttpClient } from '@shared/shared.module';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { Country } from '../models/country.model';

@Injectable()
export class CountryService {
  constructor(private http: _HttpClient) {}

  getCountries(): Observable<see.ICommonResponse<Country[]>> {
    return this.http
      .get('api/CommonData/getConfigLocation')
      .pipe(catchError((error: any) => Observable.throw(error.json())));
  }
}
```

请求相关的额外处理，比如认证判断、报错控制等，统一位于 `src/app/core/net/` 目录下。`default.interceptor.ts` 配置了默认的 HTTP 拦截器，`http.options.ts` 配置拦截器中忽略规则的 API 正则：

``` ts
export interface HTTPOptions {
  /**
   * 忽略认证失败跳转登录页的 URL 地址列表
   */
  go_login_ignores: RegExp[];
  /**
   * 忽略请求报错全局展示提示信息的 URL 地址列表
   */
  notification_ignores: RegExp[];
  /**
   * 忽略拦截器内所有规则的 URL 地址列表
   */
  interceptor_ignores: RegExp[];
}
```
