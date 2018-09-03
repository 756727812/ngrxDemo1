import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { ModalHelper } from '@shared/services';
import * as fromContainers from './containers';
import { directives } from './directives';
import { services } from './services';
import { pipes } from './pipes';
import { BiModule } from '../bi/bi.module';
import { BenefitRoutingModule } from './benefit-routing.module';
import { CommonServices } from './services/common.service';
import { Utils } from './services/utils.service';
import { CommonModule } from '@angular/common';
import { ModalChooseGoodsComponent } from './components/modal-choose-goods/modal-choose-goods.component';
import { BenefitGroupComponent } from './components/benefit-group/benefit-group.component';
import { ActiveRulesComponent } from './components/active-rules/active-rules.component';
import {RulesFormComponent} from './components/rules-form/rules-form.component'
import { SortInputComponent } from './components/sort-input/sort-input.component';
import { TotalInfoComponent } from './components/total-info/total-info.component';

const components = [
  ModalChooseGoodsComponent,
  BenefitGroupComponent,
  SortInputComponent,
  TotalInfoComponent,
  ActiveRulesComponent,
  RulesFormComponent,
];

@NgModule({
  imports: [CommonModule, SharedModule, BenefitRoutingModule, BiModule],
  providers: [...services, CommonServices, Utils, ModalHelper],
  declarations: [
    ...fromContainers.containers,
    ...components,
    ...directives,
    ...pipes,
  ],
  entryComponents: [ModalChooseGoodsComponent],
})
export class BenefitModule {}
