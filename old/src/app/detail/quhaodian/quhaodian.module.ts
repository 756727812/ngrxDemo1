import { AddItemsService } from 'app/detail/store-construction/services';
import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { ModalHelper } from '@shared/services';
import { QuhaodianRoutingModule } from './quhaodian-routing.module';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import { directives } from './directives';
import { services } from './services';
import { pipes } from './pipes';

@NgModule({
  imports: [SharedModule, QuhaodianRoutingModule],
  providers: [...services, ModalHelper],
  declarations: [
    ...fromContainers.containers,
    ...fromComponents.components,
    ...directives,
    ...pipes,
  ],
  entryComponents: [
    fromComponents.UserIdentifyInfoComponent,
    fromComponents.QrCodeComponent,
  ],
})
export class QuhaodianModule {}
