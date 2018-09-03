import {
  Directive,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  Injector,
} from '@angular/core';
import { UpgradeComponent, UpgradeModule } from '@angular/upgrade/static';

@Directive({ selector: 'goods-group-list' })
export class GoodsGroupList extends UpgradeComponent {
  @Input() kolId: number;

  constructor(ref: ElementRef, inj: Injector) {
    super('goodsGroupList', ref, inj);
  }
}
