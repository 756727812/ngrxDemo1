import * as angular from 'angular';

import { footer } from './footer/footer';
import { main } from './main/main';
import { login } from './login/login';
import { register } from './register/register.component';
import { c2cSignup } from './register/c2c-signup.component';
import { kolSignup } from './register/kol-signup.component';
import { pgcSignup } from './register/pgc-signup.component';
import { xiaodianpuSignup } from './register/xiaodianpu-signup.component';
import { modalConfirmCtrl } from './register/show-bind-modal.controller';
import { stepBar } from './stepBar/stepBar.component';
import { reportWhenInit } from './report-when-init/report-when-init.component';

export default angular
  .module('seego.components', [])
  .component('app', main)
  .component('footer', footer)
  .component('login', login)
  .component('register', register)
  .component('c2cSignup', c2cSignup)
  .component('kolSignup', kolSignup)
  .component('pgcSignup', pgcSignup)
  .component('xiaodianpuSignup', xiaodianpuSignup)
  .controller('modalConfirmCtrl', modalConfirmCtrl)
  .component('stepBar', stepBar)
  .component('reportWhenInit', reportWhenInit).name;
