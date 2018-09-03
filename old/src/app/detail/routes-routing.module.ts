import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { MpToolsModule } from './mp-tools/mp-tools.module';

const routes: Routes = [
  {
    path: 'store-construction',
    loadChildren:
      './store-construction/store-construction.module#StoreConstructionModule',
  },
  {
    path: 'warehouse',
    loadChildren: './warehouse/warehouse.module#WarehouseModule',
  },
  {
    path: 'bi',
    loadChildren: './bi/bi.module#BiModule',
  },
  {
    path: 'event2',
    loadChildren: './event-ng-module/event.module#EventModule',
  },
  {
    path: 'kol-v2',
    loadChildren: './kol-v2/kol.module#KolModule',
  },
  {
    path: 'kol-benefit',
    loadChildren: './benefit/benefit.module#BenefitModule',
  },
  {
    path: 'quhaodian',
    loadChildren: './quhaodian/quhaodian.module#QuhaodianModule',
  },
  {
    path: 'feedback',
    loadChildren: './feedback/feedback.module#FeedbackModule',
  },
  {
    path: 'mp-tools',
    loadChildren: './mp-tools/mp-tools.module#MpToolsModule',
  },
  {
    path: 'auto-operations',
    loadChildren: './auto-operations/auto-operations.module#AutoOperationsModule',
  },
  {
    path: 'template-message',
    loadChildren: './template-message/template-message.module#TemplateMessageModule',
  },
  // { path: '', pathMatch: 'full', redirectTo: 'store-construction' },
  { path: '', loadChildren: '../ng1.module#AngularJSModule' },
];

@NgModule({
  imports: [
    // 除了 lazyload 的模块，这里不需要提供任何路由，Router 将会收集所有注册模块的路由信息
    RouterModule.forRoot(routes, {
      // enableTracing: true,
      // 开启预加载和预引导，因为原有 ng1 代码体积太大
      // preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class RouteRoutingModule {}
