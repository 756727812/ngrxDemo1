import { NgModule } from '@angular/core';
import { SortablejsModule } from 'angular-sortablejs';

import { SharedModule } from '@shared/shared.module';
import { AutoOperationsRoutingModule } from './auto-operations-routing.module';
// import { reducers, effects } from './store';
import * as fromComponents from './components';
import { containers } from './containers';
// import { directives } from './directives';
import { services } from './services';

import { RulesTipsComponent } from './components/rules-tips/rules-tips.component';
import { RulesKolListComponent } from './components/rules-kol-list/rules-kol-list.component';
import { RulesCardAddFormComponent } from './components/rules-card-add-form/rules-card-add-form.component';
import { KolSelectorSingleColComponent } from './components/kol-selector/kol-selector.component';
import { TextAvatarPipe } from './pipes/text-avatar.pipe';
import { LevelPrefixPipe } from './pipes/level-prefix.pipe';
import { RulesCardComponent } from './components/rules-card/rules-card.component';

@NgModule({
  imports: [SharedModule, AutoOperationsRoutingModule, SortablejsModule],
  exports: [...containers, ...fromComponents.components],
  declarations: [
    ...containers,
    ...fromComponents.components,
    TextAvatarPipe,
    LevelPrefixPipe,
  ],
  providers: [...services],
  entryComponents: [
    /* for dynamic comp */
    RulesTipsComponent,
    RulesKolListComponent,
    RulesCardAddFormComponent,
    KolSelectorSingleColComponent,
  ],
})
export class AutoOperationsModule {}
