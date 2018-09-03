import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { TemplateMessageRoutingModule } from './template-message-routing.module';
// import { reducers, effects } from './store';
import * as formComponents from './components';
import { containers } from './containers';
// import { directives } from './directives';
import { services } from './services';
import { SeeKolSelectorSingleColComponent } from '@shared/components/kol-selector-single-col/kol-selector-single-col.component';
import { GoodsSelectorComponent } from './components/goods-selector/goods-selector.component';
import { ActivitySelectorComponent } from './components/activity-selector/activity-selector.component';
import { PageSelectorComponent } from './components/page-selector/page-selector.component';

@NgModule({
  imports: [SharedModule, TemplateMessageRoutingModule],
  exports: [...containers, ...formComponents.components],
  declarations: [
    ...containers,
    ...formComponents.components,
    GoodsSelectorComponent,
    ActivitySelectorComponent,
    PageSelectorComponent,
  ],
  providers: [...services],
  entryComponents: [
    /* for dynamic comp */
    SeeKolSelectorSingleColComponent,
    GoodsSelectorComponent,
    ActivitySelectorComponent,
    PageSelectorComponent,
  ],
})
export class TemplateMessageModule {}
