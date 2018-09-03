  import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-purchase-order-item',
  templateUrl: './purchase-order-item.component.html',
  styleUrls: ['./purchase-order-item.component.less']
})
export class PurchaseOrderItemComponent implements OnInit {
  @Input() purchaseOrder: any = {
    items: []
  };

  @Input() warehouseOrderStatus: number = 0;

  constructor() { }

  ngOnInit() {

  }

}
