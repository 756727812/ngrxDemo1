import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { ModalHelper } from '@shared/services';
import { FeedbackRoutingModule } from './feedback-routing.module';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import { directives } from './directives';
import { services } from './services';
import { pipes } from './pipes';

@NgModule({
  imports: [SharedModule, FeedbackRoutingModule],
  providers: [...services, ModalHelper],
  declarations: [
    ...fromContainers.containers,
    ...fromComponents.components,
    ...directives,
    ...pipes,
  ],
  entryComponents: [],
})
export class FeedbackModule {}
