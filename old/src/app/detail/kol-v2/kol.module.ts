import { AddItemsService } from 'app/detail/store-construction/services';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CookieModule } from 'ngx-cookie';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { ModalHelper } from '@shared/services';
import { KolRoutingModule } from './kol-routing.module';
import * as fromComponents from './components';
import * as fromContainers from './containers';
import { directives } from './directives';
import { services } from './services';
import { pipes } from './pipes';
import { guards } from './guards';
import { reducers, effects } from './store';
import { BiModule } from '../bi/bi.module';
import { StoreConstructionModule } from '../store-construction/store-construction.module';
import { ModalGoodsListComponent } from './containers/content-e-commerce/modal-goods-list/modal-goods-list.component';

@NgModule({
  imports: [
    CookieModule.forChild(),
    SharedModule,
    KolRoutingModule,
    StoreModule.forFeature('kol', reducers),
    EffectsModule.forFeature(effects),
    BiModule,
    StoreConstructionModule,
  ],
  providers: [...services, ...guards, ModalHelper],
  declarations: [
    ...fromContainers.containers,
    ...fromComponents.components,
    ...directives,
    ...pipes,
    ModalGoodsListComponent,
  ],
  entryComponents: [
    fromComponents.ModalMicroPageModelComponent,
    fromComponents.ModalArticleModelComponent,
    fromComponents.ModalLinksComponent,
    fromContainers.ModalArticleLinkToMicroPageComponent,
    fromComponents.ModalGoodsGroupMoedlComponent,
    fromComponents.ModalGoodsGroupAddGoodsComponent,
    fromComponents.CateConfigModalComponent,
    ModalGoodsListComponent,
    fromComponents.ModalArticleGoodsComponent,
    fromComponents.ModalLinksComponentV2,
  ],
})
export class KolModule {}
