interface Orders {
  order: string;
  price?: number;
}

export class modalOrderInBatchConfirmController {
  resolve: {
    orders: Orders[],
    action: string,
  };
  close: Function;
  dismiss: Function;
  orders: Orders[];
  static $inject: string[] = [];
  constructor() { }

  $onInit() {
    this.orders = this.resolve.orders;
  }

  ok: () => void = () => this.close({ $value: this.orders });

  cancel: () => void = () => this.dismiss();
}

export const modalOrderInBatchConfirm: ng.IComponentOptions = {
  template: require('./modal-order-in-batch-confirm.template.html'),
  controller: modalOrderInBatchConfirmController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
