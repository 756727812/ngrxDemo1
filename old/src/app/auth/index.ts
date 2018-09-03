import * as angular from 'angular'
import { bindComponent } from './bind.component'
import { forgetComponent } from './forget.component'
import { loginComponent } from './login.component'
import { registerComponent } from './register.component'
import { authComponent } from './auth.component'
import { authRegisterMobileSuccess } from './register-mobile-success.component'

export default
  angular
    .module('seego.auth', [])
    .component('auth', authComponent)
    .component('authBind', bindComponent)
    .component('authForget', forgetComponent)
    .component('authLogin', loginComponent)
    .component('authRegister', registerComponent)
    .component('authRegisterMobileSuccess', authRegisterMobileSuccess)
    .name
