import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import authContainer from './containers';

const routes: Routes = [
  {
    path: 'login',
    component: authContainer.LoginComponent,
  },
  {
    path: 'entry',
    component: authContainer.LoginComponent,
    data: {
      report: 'PAGE_ENTRY',
    },
  },
  {
    path: 'bind',
    redirectTo: 'bind/1',
    pathMatch: 'full',
  },
  {
    path: 'bind/:currentStep',
    component: authContainer.BindComponent,
  },
  {
    path: 'register',
    redirectTo: 'register/1',
    pathMatch: 'full',
  },
  {
    path: 'register/:currentStep',
    // 注册部分的report在组件内部处理了(不同currentStep的reportKey不一样)
    component: authContainer.RegisterComponent,
  },
  {
    path: 'forget',
    redirectTo: 'forget/1',
    pathMatch: 'full',
  },
  {
    path: 'forget/:currentStep',
    component: authContainer.ForgetComponent,
  },
  {
    path: '**',
    redirectTo: 'entry',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class RoutesModule {}
