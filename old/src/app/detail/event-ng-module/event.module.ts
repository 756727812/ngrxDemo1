import { NgModule } from '@angular/core';
// import { DatePipe } from '@angular/common';
// import { Routes, RouterModule } from '@angular/router';
// import { StoreModule } from '@ngrx/store';
// import { EffectsModule } from '@ngrx/effects';
import { SortablejsModule } from 'angular-sortablejs';
import { UpgradeModule, setAngularLib } from '@angular/upgrade/static';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CookieModule } from 'ngx-cookie';

import { SharedModule } from '@shared/shared.module';
import { EventRoutingModule } from './event-routing.module';
// import { reducers, effects } from './store';
import * as fromComponents from './components';
import { containers } from './containers';
// import { directives } from './directives';
import { services } from './services';
// import { NzUploadModule } from './components/ignore-this-after-zorro-upload-pr-complete/nz-upload.module';
// import { DynamicModule } from 'ng-dynamic-component';
// import * as fromPreview from './containers/preview-pane';
// import * as fromCtrlSub from './containers/ctrl-pane/sub';
// import { ModalHelper } from '@shared/services';
import {
  CNCurrencyPipe,
  CouponStatusPipe,
  SeckillStatusPipe,
} from '@shared/pipes';
// import { CompileDirective } from '@shared/directives/compile.directive';
import { EventGoodsPickerComponent } from './components/goods-picker/goods-picker.component';
import { EventCouponPickerComponent } from './components/coupon-picker/coupon-picker.component';
import { EventKolSelectorComponent } from './components/kol-selector/kol-selector.component';
import { EventChildItemsResultComponent } from './components/child-items-result/child-items-result.component';
import { EventAssignActResultComponent } from './components/assign-activity-result/assign-activity-result.component';
import { EventAssignActResultNg5Component } from './components/assign-activity-result-ng5/assign-activity-result-ng5.component';
import { EventAddCouponComponent } from './components/add-coupon/add-coupon.component';

// import { directives as directivesFromStoreConstruction } from '../store-construction/directives';
import { HybridHelper } from '../../../app/utils/hybrid-helper';
// import * as angular from 'angular';
// import { seegoNg1Module } from '../../ng1-app';
import { doBootstrapNg1 } from '../../ng1.module';
// import servicesModule from '../../services';
import { seeUpload } from '../../services/see-upload/see-upload.service';
import 'ng-file-upload';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const ng1Providers = ['seeUpload'].map(item =>
  HybridHelper.buildProviderForUpgrade(item),
);

@NgModule({
  imports: [
    NgZorroAntdModule,
    // NzUploadModule,
    SharedModule,
    EventRoutingModule,
    // StoreModule.forFeature('storeConstruction', reducers),
    // EffectsModule.forFeature(effects),
    // DynamicModule.withComponents([
    // ...fromPreview.dynamicPreviewComponents,
    // ...fromCtrlSub.dynamicCtrlWidgetComponents,
    // ]),
    FormsModule,
    ReactiveFormsModule,
    SortablejsModule,
    UpgradeModule,
    CookieModule.forChild(),
  ],
  exports: [
    ...containers,
    ...fromComponents.components,
    // ...directivesFromStoreConstruction,
  ],
  declarations: [
    ...containers,
    ...fromComponents.components,
    // CompileDirective,
  ],
  providers: [
    ...ng1Providers, // TODO ng1 的 service 还是注入不了
    ...services,
    // ModalHelper
  ],
  entryComponents: [
    /* for dynamic comp */
    EventGoodsPickerComponent,
    EventCouponPickerComponent,
    EventKolSelectorComponent,
    EventChildItemsResultComponent,
    EventAssignActResultComponent,
    EventAddCouponComponent,
    EventAssignActResultNg5Component,
  ],
})
export class EventModule {
  constructor(upgrade: UpgradeModule) {
    doBootstrapNg1(upgrade);
  }
}
