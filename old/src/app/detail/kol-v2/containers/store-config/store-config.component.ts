import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';

@Component({
  selector: 'store-config-container',
  templateUrl: 'store-config.component.html',
  styleUrls: ['store-config.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class StoreConfigComponent implements OnInit {
  constructor(private store: Store<fromStore.KolState>) {}

  kolInfo: fromStore.IKolData;
  // selectedIndex: number = 0;
  // showMagicCube: boolean = false;
  // @ViewChild('mainPageShare') mainPageShareNav: ElementRef;

  ngOnInit() {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
  }

  // ngAfterViewInit() {
  //   // this.mainPageShareNav.nativeElement.click();
  // }
}
