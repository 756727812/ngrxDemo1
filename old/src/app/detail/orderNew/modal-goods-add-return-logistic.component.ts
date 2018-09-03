export class modalGoodsAddReturnLogisticController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService', 'Notification'];

  resolve: {
    littleOrderId: number,
    exist: number,
  };
  transportList: any[];
  formData: {
    transportCode: string,
    transportNo: string,
  };
  isOKButtonDisabled: boolean = false;
  close: () => void;
  dismiss: ({ $value: any }) => void;

  constructor(
    private $q: ng.IQService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
  ) {}

  $onInit(): void {
    const promises = [this.getTransportList()];
    if (this.resolve.exist === 1) {
      promises.push(this.getLogisticByID(this.resolve.littleOrderId));
    }
    this.$q.all(promises);
  }

  ok(): void {
    const params = {
      littleOrderId: this.resolve.littleOrderId,
      ...this.formData,
    };
    this.isOKButtonDisabled = true;
    this.addOrUpdateLogistic(params)
      .then(() => this.close())
      .finally(() => this.isOKButtonDisabled = false);
  }

  cancel(): void {
    return this.dismiss({ $value: 'cancel' });
  }

  private addOrUpdateLogistic(params): ng.IPromise<any> {
    return this.dataService.returngoods_addOrUpdateLogistics(params)
      .then(() => this.notification.success());
  }

  private getLogisticByID(littleOrderId): ng.IPromise<any> {
    return this.dataService.returngoods_getLogistics({ littleOrderId })
      .then(({ data }) => {
        this.formData = {
          transportCode: data.transportCode,
          transportNo: data.transportNo,
        };
      });
  }

  private getTransportList(): ng.IPromise<any> {
    return this.dataService.order_getTransportList()
      .then(({ data }) => this.transportList = data);
  }
}

export const modalGoodsAddReturnLogistic: ng.IComponentOptions = {
  template: require('./modal-goods-add-return-logistic.template.html'),
  controller: modalGoodsAddReturnLogisticController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
