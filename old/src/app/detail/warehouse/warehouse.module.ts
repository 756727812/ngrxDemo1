import { AddItemsService } from 'app/detail/store-construction/services';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { SharedModule } from '@shared/shared.module';
import { ModalHelper } from '@shared/services';
import { WarehouseRoutingModule } from './warehouse-routing.module';
import * as fromComponents from './components';
import { containers } from './containers';
import { directives } from './directives';
import { services } from './services';
import { pipes } from './pipes';
import { guards } from './guards';
import { reducers, effects } from './store';

@NgModule({
	imports: [
		SharedModule,
		WarehouseRoutingModule,
		StoreModule.forFeature('warehouse', reducers),
		EffectsModule.forFeature(effects)
	],
	providers: [ ...services, ...guards, ModalHelper ],
	declarations: [ ...containers, ...fromComponents.components, ...directives, ...pipes ],
	exports: [ ...containers, ...fromComponents.components, ...directives ],
	entryComponents: [ fromComponents.ModalWarehouseItemListComponent, fromComponents.ModalPurchaseOrderListComponent ]
})
export class WarehouseModule {}
