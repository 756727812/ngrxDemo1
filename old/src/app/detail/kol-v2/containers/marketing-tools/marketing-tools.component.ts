import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';

@Component({
  selector: 'marketing-tools',
  templateUrl: 'marketing-tools.component.html',
  styleUrls: ['marketing-tools.component.less'],
})
export class MarketingToolsComponent {
  kolInfo: fromStore.IKolData;

  constructor(private store: Store<fromStore.KolState>) {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(kolInfo => {
        this.kolInfo = kolInfo;
      });
  }
}
// kol-v2/kol-cooperation-management/147/zigzag/marketing-tools
