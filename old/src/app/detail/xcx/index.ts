import * as angular from 'angular';
import { xcxCodeAuthInfoConfigDialog } from './code/auth/info-config/dialog.component';
import { xcxCodeAuthInfoConfigDisplayForm } from './code/auth/info-config/display-form.component';
import { xcxCodeAuthInfoConfigServiceForm } from './code/auth/info-config/service-form.component';
import { xcxCodeAuthList } from './code/auth/list.component';
// import { xcxCodeAuthOneKey } from './code/auth/one-key.component';
import { xcxCodeAuthQr } from './code/auth/qr.component';
import { xcxCode } from './code/index.component';
import { xcxCodeTplList } from './code/tpl/list.component';

export default angular
  .module('seego.xcx', [])
  .component('xcxCodeAuthInfoConfigDialog', xcxCodeAuthInfoConfigDialog)
  .component(
    'xcxCodeAuthInfoConfigDisplayForm',
    xcxCodeAuthInfoConfigDisplayForm,
  )
  .component(
    'xcxCodeAuthInfoConfigServiceForm',
    xcxCodeAuthInfoConfigServiceForm,
  )
  .component('xcxCodeAuthList', xcxCodeAuthList)
  // .component('xcxCodeAuthOneKey', xcxCodeAuthOneKey)
  .component('xcxCodeAuthQr', xcxCodeAuthQr)
  .component('xcxCode', xcxCode)
  .component('xcxCodeTplList', xcxCodeTplList).name;
