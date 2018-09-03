import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SortablejsModule } from 'angular-sortablejs';

import { SharedModule } from '@shared/shared.module';
import { StoreConstructionRoutingModule } from './store-construction-routing.module';
import { reducers, effects } from './store';
import * as fromComponents from './components';
import { containers } from './containers';
import { directives } from './directives';
import { services } from './services';
import { NzUploadModule } from './components/ignore-this-after-zorro-upload-pr-complete/nz-upload.module';
import { DynamicModule } from 'ng-dynamic-component';
import * as fromPreview from './containers/preview-pane';
import * as fromCtrlSub from './containers/ctrl-pane/sub';
import { ModalHelper } from '@shared/services';
import {
  CNCurrencyPipe,
  CouponStatusPipe,
  SeckillStatusPipe,
} from '@shared/pipes';
import { CompileDirective } from '@shared/directives/compile.directive';
import { PreviewColumnComponent } from './containers/editor-post-pay/preview-column.component';
import { EditorPostPayComponent } from './containers/editor-post-pay/editor-post-pay.component';
import { SeeKolSelectorComponent } from '@shared/components/kol-selector/kol-selector.component';

@NgModule({
  imports: [
    NzUploadModule,
    SharedModule,
    StoreConstructionRoutingModule,
    StoreModule.forFeature('storeConstruction', reducers),
    EffectsModule.forFeature(effects),
    DynamicModule.withComponents([
      ...fromPreview.dynamicPreviewComponents,
      ...fromCtrlSub.dynamicCtrlWidgetComponents,
    ]),
    SortablejsModule,
  ],
  exports: [...containers, ...fromComponents.components, ...directives],
  declarations: [
    ...containers,
    ...fromComponents.components,
    ...directives,
    CompileDirective,
    PreviewColumnComponent,
    EditorPostPayComponent,
  ],
  providers: [...services, ModalHelper],
  entryComponents: [
    /* for dynamic comp */
    fromComponents.ModalAddItems,
    SeeKolSelectorComponent,
  ],
})
export class StoreConstructionModule {}
