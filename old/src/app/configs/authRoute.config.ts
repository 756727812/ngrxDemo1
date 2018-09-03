import { MyIRouteProvider } from './route.config';
import { result } from 'lodash';

authRouteConfig.$inject = ['$routeProvider'];
export function authRouteConfig($routeProvider: MyIRouteProvider): void {
  $routeProvider
    .when('/', {
      redirectTo: '/entry',
    })
    .when('/entry', {
      // 原来的 `/login` 在扫码注册过程会多跳一次 `/login`
      // 避免多上报一次 登录页 pv，这里新增一个路由用来给官网跳转过来
      reportKey: 'PAGE_ENTRY',
      template: '<auth-login></auth-login>',
    })
    .when('/login', {
      // 给扫码注册过程会跳转到这个路由url
      // !!如果不需要上报的登录页，就用用这个路由!!
      template: '<auth-login></auth-login>',
    })
    .when('/register', {
      reportKey: 'PAGE_ENTRY.PV_ENTER_REGISTER',
      redirectTo: '/register/1',
    })
    .when('/register/:currentStep', {
      reportKey: current => {
        const currentStep: any = result(current, 'pathParams.currentStep');
        const map = {
          2: 'PAGE_ENTRY.PV_INFO_FORM',
          3: 'PAGE_ENTRY.PV_REGISTER_SUCC',
        };
        return map[currentStep];
      },
      template: '<auth-register></auth-register>',
    })
    .when('/bind', {
      redirectTo: '/bind/1',
    })
    .when('/bind/:currentStep', {
      template: '<auth-bind></auth-bind>',
    })
    .when('/forget', {
      redirectTo: '/forget/1',
    })
    .when('/forget/:currentStep', {
      template: '<auth-forget></auth-forget>',
    })
    .otherwise({ redirectTo: '/entry' });
}
