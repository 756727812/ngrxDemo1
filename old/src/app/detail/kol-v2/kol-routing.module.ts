import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '@shared/guards';
import * as fromContainers from './containers';
import * as fromGuards from './guards';
import { BiAdminComponent } from '../bi/containers';
import { BaseInfoComponent } from './containers/base-info/base-info.component';
import {
  EditorPostPayComponent,
  ResourceNicheManagementComponent,
} from '../store-construction/containers';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'kol-cooperation-management',
  },
  {
    path: 'kol-cooperation-management',
    children: [
      {
        path: '',
        pathMatch: 'full',
        // component: fromContainers.WarehouseGoodsComponent,
      },
      {
        path: ':kolId',
        component: fromContainers.ContentECommerceComponent,
      },
      {
        path: ':kolId/:wechatId',
        canActivate: [fromGuards.CooperationManagementGuard],
        component: fromContainers.CooperationManagementComponent,
        children: [
          {
            path: 'micro-page',
            component: fromContainers.MicroPageComponent,
          },
          {
            path: 'goods-group',
            component: fromContainers.GoodsGroupListContainerComponent,
          },
          {
            path: 'store-config',
            component: fromContainers.StoreConfigComponent,
            children: [
              {
                path: '',
                redirectTo: 'main-page-share',
                pathMatch: 'full',
              },
              {
                path: 'main-page-share',
                component: fromContainers.MainPageShareComponent,
              },
              {
                path: 'resource-niche-management/:type',
                component: ResourceNicheManagementComponent,
                canDeactivate: [CanDeactivateGuard],
              },
              {
                path: 'editor-post-pay',
                component: EditorPostPayComponent,
                canDeactivate: [CanDeactivateGuard],
              },
            ],
          },
          {
            path: 'article',
            component: fromContainers.ArticleManagement,
          },
          {
            path: 'article-v2',
            component: fromContainers.ArticleManagementV2,
          },
          {
            path: 'goods-v2',
            component: fromContainers.GoodsManagementComponent,
          },
          {
            path: 'baseinfo',
            component: fromContainers.BaseInfoComponent,
          },
          {
            path: 'goods',
            // component: fromContainers.MicroPageComponent,
          },
          {
            path: 'marketing-tools',
            component: fromContainers.MarketingToolsComponent,
          },
          {
            path: 'cate-nav',
            component: fromContainers.CateNavComponent,
          },
          {
            path: 'bi',
            component: BiAdminComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KolRoutingModule {}
