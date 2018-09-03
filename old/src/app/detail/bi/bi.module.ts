import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SortablejsModule } from 'angular-sortablejs';

import { SharedModule } from '@shared/shared.module';
import { BiRoutingModule } from './bi-routing.module';
// import { reducers, effects } from './store';
import * as fromComponents from './components';
import { containers } from './containers';
// import { directives } from './directives';
import { services } from './services';
// import { NzUploadModule } from './components/ignore-this-after-zorro-upload-pr-complete/nz-upload.module';
// import { DynamicModule } from 'ng-dynamic-component';
// import * as fromPreview from './containers/preview-pane';
// import * as fromCtrlSub from './containers/ctrl-pane/sub';
import { ModalHelper } from '@shared/services';
import {
  CNCurrencyPipe,
  CouponStatusPipe,
  SeckillStatusPipe,
} from '@shared/pipes';
import { CompileDirective } from '@shared/directives/compile.directive';

import {BiGoodsTrendChartComponent} from './containers/goods/detail/chart.component'

@NgModule({
  imports: [
    // NzUploadModule,
    SharedModule,
    BiRoutingModule,
    // StoreModule.forFeature('storeConstruction', reducers),
    // EffectsModule.forFeature(effects),
    // DynamicModule.withComponents([
    // ...fromPreview.dynamicPreviewComponents,
    // ...fromCtrlSub.dynamicCtrlWidgetComponents,
    // ]),
    SortablejsModule,
  ],
  exports: [
    ...containers,
    ...fromComponents.components,
    // ...directives
  ],
  declarations: [
    ...containers,
    ...fromComponents.components,
    // ...directives,
    // CompileDirective,
  ],
  providers: [
    ...services,
    // ModalHelper
  ],
  entryComponents: [
    /* for dynamic comp */
    BiGoodsTrendChartComponent,
  ],
})
export class BiModule {}
