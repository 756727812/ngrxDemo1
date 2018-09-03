/**
 * 这个模块用来包裹ng1的代码，无需变更
 */

import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UpgradeModule, setAngularLib } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import * as angular from 'angular';
import { HybridHelper } from '@utils/hybrid-helper';
import { seegoNg1Module, seegoNg1AuthModule } from './ng1-app';
import { SharedModule } from '@shared/shared.module';
import { FashionHotGoodsNg5 } from './detail/fashion/fashion-hot-goods-ng5.component';
import { FashionHotGoodsNg5Favor } from './detail/fashion/fashion-hot-goods-ng5-favor.component';
import { EventKolSelectorV2Component } from './detail/event-ng-module/components/kol-selector-v2/kol-selector-v2.component';
import { services as EventServices } from './detail/event-ng-module/services';
import { EventTableAlertV2Component } from './detail/event-ng-module/components/table-alert-v2/table-alert-v2.component';
import { EventQuickJumperComponent } from './detail/event-ng-module/components/quick-jumper/quick-jumper.component';
import { EventChildItemsResultV2Component } from './detail/event-ng-module/components/child-items-result-v2/child-items-result-v2.component';
import { EventAssignActResultV2Component } from './detail/event-ng-module/components/assign-activity-result-v2/assign-activity-result-v2.component';
import { ParentGoodsConfirmComponent } from './detail/event-ng-module/components/parent-goods-confirm/parent-goods-confirm.component';
import { BatchAssignLogsComponent } from './detail/event-ng-module/components/batch-assign-logs/batch-assign-logs.component';
import { EventSeckillListNg5 } from './detail/event/seckill/event-seckill-list-ng5.component';
import { ModalArticleAddGroupBuyGoods } from './detail/kol/modal-article-add-group-buy-goods.component';
import { FinancialNewAccountFix } from './detail/financialNew/components/financial-new-account-fix.component';
import { LuckyBagSettings } from './detail/event/luckybag/lucky-bag-settings.component';
import { dailyWelfareList } from './detail/event/dailywelfare/daily-welfare-list.component';
import { dailyWelfareAction } from './detail/event/dailywelfare/daily-welfare-action.component';
import { ModalExportOrder } from './detail/orderNew/modal-export-order.component';
import { once } from 'lodash';
import { ModalOneKeyComponent } from './detail/goods/modal/modal-one-key.component';
import { SeeImgUploadComponentNg1 } from '@shared/components/img-upload-ng1-copy/img-upload.component';
import { SeeTreeSelectComponentNg1 } from '@shared/components/tree-select-ng1-copy/tree-select.component';
import { SeeTreeSelectCategoryComponentNg1 } from '@shared/components/tree-select-category-ng1-copy/tree-select-category.component';
import { BrandSelectorComponentNg1 } from '@shared/components/brand-selector-ng1-copy/brand-selector.component';
import { SeeSelectGoodsNg1 } from '@shared/components/select-goods-ng1-copy/select-goods.component';
import { ModalLinksComponentV2 } from './detail/kol-v2/components/modal-links-v2-ng1/modal-links.component'; // 新弹窗商品链接

import {
  NzButtonComponent,
  NzDatePickerComponent,
  NzRangePickerComponent,
  NzDropDownComponent,
  NzMenuComponent,
  NzMenuItemComponent,
  NzCheckboxComponent,
  NzSelectComponent,
  NzOptionComponent,
  NzRadioComponent,
  NzUploadComponent,
  NzPopconfirmComponent,
  NzPopconfirmDirective,
  NzTransferComponent,
} from 'ng-zorro-antd';
import { EllipsisComponent } from '@delon/abc';
import { ModalShowUpgradeInfoComponent } from 'app/detail/shop/shop-operate/modal-show-upgrade-info.component';
import { ModalGoodsSelectSkuMark } from 'app/detail/goods/modal-goods-select-sku-mark.component';

@Component({ template: `` })
export class EmptyComponent {}

// ng2 中可能用到的 ng1 DI 模块，统一放这里
const ng1Providers = [
  ...[
    '$location',
    '$routeParams',
    '$q',
    '$cookies',
    '$uibModal',
    'dataService',
    'Notification',
    'Notification',
    'seeModal',
    'fashionService',
    'webPService',
    '$http',
    '$httpParamSerializerJQLike',
    '$scope',
    '$timeout',
    '$document',
    '$window',
  ].map(item => HybridHelper.buildProviderForUpgrade(item)),
];

const ng2DowngradeShareComponents = [
  NzButtonComponent,
  NzDatePickerComponent,
  NzRangePickerComponent,
  NzDropDownComponent,
  NzMenuComponent,
  NzMenuItemComponent,
  NzCheckboxComponent,
  NzSelectComponent,
  NzOptionComponent,
  NzUploadComponent,
  EllipsisComponent,
  LuckyBagSettings,
  NzTransferComponent,
  // NzPopconfirmComponent,
  // NzPopconfirmDirective,
];

const hybridComponents = [
  FinancialNewAccountFix,
  LuckyBagSettings,
  dailyWelfareList,
  dailyWelfareAction,
  FashionHotGoodsNg5,
  FashionHotGoodsNg5Favor,
  EventKolSelectorV2Component,
  ModalArticleAddGroupBuyGoods,
  ModalExportOrder,
  ModalShowUpgradeInfoComponent,
  ModalGoodsSelectSkuMark,
  EventTableAlertV2Component,
  EventQuickJumperComponent,
  EventChildItemsResultV2Component,
  EventAssignActResultV2Component,
  EventSeckillListNg5,
  ParentGoodsConfirmComponent,
  BatchAssignLogsComponent,
  ModalOneKeyComponent,
  SeeImgUploadComponentNg1,
  SeeTreeSelectComponentNg1,
  SeeTreeSelectCategoryComponentNg1,
  BrandSelectorComponentNg1,
  SeeSelectGoodsNg1,
  ModalLinksComponentV2,
];

export const doBootstrapNg1 = once((upgrade: UpgradeModule) => {
  setAngularLib(angular);
  if (window.location.pathname === '/auth.html') {
    upgrade.bootstrap(document.body, [seegoNg1AuthModule.name]);
  } else {
    upgrade.bootstrap(document.body, [seegoNg1Module.name]);
  }
  setUpLocationSync(upgrade);
});

@NgModule({
  // 需要降级给 ng1 使用的组件放这里
  entryComponents: [...ng2DowngradeShareComponents, ...hybridComponents],
  // hybrid 组件声明为此模块所有
  declarations: [EmptyComponent, ...hybridComponents],
  imports: [
    SharedModule,
    UpgradeModule,
    RouterModule.forChild([{ path: '**', component: EmptyComponent }]),
  ],
  providers: [...ng1Providers, EventServices],
})
export class AngularJSModule {
  // 这里的构造函数只会调用一次，导航到老应用的时候才会启动
  constructor(upgrade: UpgradeModule) {
    doBootstrapNg1(upgrade);
  }
}
