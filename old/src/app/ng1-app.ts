import * as angular from 'angular';

/** Import ng-relative modules. */
import 'angular-animate';
import 'angular-cookies';
import 'angular-route';
import 'angular-sanitize';
import 'angular-touch';

/** Import third party modules & styles. */
import 'icheck';
import 'angular-ui-bootstrap';
// import 'ng-w5c-validator/w5cValidator.min'
import 'ng-dialog/js/ngDialog.min';
import 'ng-dialog/css/ngDialog.min.css';
import 'ng-dialog/css/ngDialog-theme-default.min.css';
import 'angucomplete-alt/dist/angucomplete-alt.min';
import 'angucomplete-alt/angucomplete-alt.css';
import 'ng-file-upload';
import 'ngclipboard';
import 'ng-infinite-scroll';
import 'bootstrap-daterangepicker/daterangepicker.css';
import 'angular-bootstrap-datetimepicker';
import 'angular-bootstrap-datetimepicker/src/css/datetimepicker.css';
import 'ng-tags-input';
import 'ng-tags-input/build/ng-tags-input.min.css';
import 'ng-tags-input/build/ng-tags-input.bootstrap.min.css';
import 'ui-select';
import 'ui-select/dist/select.min.css';
import 'angular-xeditable';
import 'angular-xeditable/dist/css/xeditable.min.css';
import 'angular-bootstrap-lightbox';
import 'angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.min.css';
import 'angular-ivh-treeview/dist/ivh-treeview.min';
import 'angular-ivh-treeview/dist/ivh-treeview.min.css';
import 'angular-ivh-treeview/dist/ivh-treeview-theme-basic.css';
import 'echarts-ng';
import 'amcharts3/amcharts/amcharts.js';
import 'amcharts3/amcharts/serial.js';
import 'amcharts3/amcharts/themes/light.js';
import 'angular-qrcode/angular-qrcode.js';
import 'angular-images-loaded';
import 'angular-loading-bar';
import jQueryBridget from 'jquery-bridget';
import imagesLoaded from 'imagesloaded';
import Masonry from 'masonry-layout';
import './misc/daterangepicker-fix';
import './misc/qrcode';
import './misc/qrcode_UTF8';

jQueryBridget('masonry', Masonry, $);

import { UpgradeModule, downgradeComponent } from '@angular/upgrade/static';
import {
  NzModalService,
  NzMessageService,
  NzNotificationService,
  NzButtonComponent,
  NzDatePickerComponent,
  NzRangePickerComponent,
  NzDropDownComponent,
  NzMenuComponent,
  NzMenuItemComponent,
  NzDropDownDirective,
  NzCheckboxComponent,
  NzSelectComponent,
  NzOptionComponent,
  NzUploadComponent,
  // NzRadioComponent,
  // NzRadioGroupComponent,
  // NzPopconfirmComponent,
  // NzPopconfirmDirective,
} from 'ng-zorro-antd';
import { EllipsisComponent } from '@delon/abc';

import { HybridHelper } from '@utils/hybrid-helper';
import { ReportService } from './services/report-service/report-service';

/** Import ng configuration.  */
import {
  httpConfig,
  locationConfig,
  routeConfig,
  dateRangePickerConfig,
  echartsConfig,
  ivhTreeviewConfig,
  w5cValidatorConfig,
  editableRun,
  fastclickRun,
  urlsignRun,
  authRouteConfig,
  sceDelegateConfig,
} from './configs';

/** Import business modules. */
import servicesModule from './services';
import filtersModule from './filters';
import directivesModule from './directives';
import componentsModule from './components';
import { MODULES } from './detail';
import authModule from './auth';

imagesLoaded.makeJQueryPlugin($);

const appModule = [
  componentsModule,
  servicesModule,
  filtersModule,
  directivesModule,
  ...MODULES,
];

const thirdModule = [
  'ngAnimate',
  'ngCookies',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ui.bootstrap',
  // 'w5c.validator',
  'angucomplete-alt',
  'ngDialog',
  'ngFileUpload',
  'ui.bootstrap.datetimepicker',
  'ngTagsInput',
  'ui.select',
  'xeditable',
  'bootstrapLightbox',
  'ivh.treeview',
  'echarts-ng',
  'monospaced.qrcode',
  'ngclipboard',
  'infinite-scroll',
  'hj.imagesLoaded',
  'angular-loading-bar',
];

export const seegoNg1Module = angular
  .module('seego', [...thirdModule, ...appModule])
  .run(editableRun)
  .run(fastclickRun)
  .run(urlsignRun)
  .run(ReportService.setupRouteReport)
  .config(locationConfig)
  .config(routeConfig)
  .config(httpConfig)
  .config(dateRangePickerConfig)
  .config(ivhTreeviewConfig)
  .config(w5cValidatorConfig)
  .config(sceDelegateConfig);

export const seegoNg1AuthModule = angular
  .module('auth', [
    ...thirdModule,
    componentsModule,
    servicesModule,
    filtersModule,
    directivesModule,
    authModule,
  ])
  .run(ReportService.setupRouteReport)
  .config(httpConfig)
  .config(w5cValidatorConfig)
  .config(authRouteConfig)
  .config(sceDelegateConfig);

// 降级给 ng1 使用的组件和 DI 放到这里统一处理
const downgradeComponentsMap = {
  nzButton: NzButtonComponent,
  nzDatepicker: NzDatePickerComponent,
  nzRangepicker: NzRangePickerComponent,
  nzDropdown: NzDropDownComponent,
  nzMenu: NzMenuComponent,
  nzMenuItem: NzMenuItemComponent,
  nzCheckbox: NzCheckboxComponent,
  nzSelect: NzSelectComponent,
  nzOption: NzOptionComponent,
  ellipsis: EllipsisComponent,
  nzUpload: NzUploadComponent,
  // nzRadio: NzRadioComponent,
  // nzRadioGroup: NzRadioGroupComponent,
  // nzPopconfirm: NzPopconfirmComponent,
  // NzPopconfirmDirective,
};
Object.keys(downgradeComponentsMap).forEach(key => {
  HybridHelper.downgradeComponent(
    seegoNg1Module.name,
    key,
    downgradeComponentsMap[key],
  );
});

const downgradeProvidersMap = {
  NzModalService,
  NzMessageService,
  NzNotificationService,
};
Object.keys(downgradeProvidersMap).forEach(key => {
  HybridHelper.downgradeProvider(
    seegoNg1Module.name,
    key,
    downgradeProvidersMap[key],
  );
  HybridHelper.downgradeProvider(
    seegoNg1AuthModule.name,
    key,
    downgradeProvidersMap[key],
  );
});
