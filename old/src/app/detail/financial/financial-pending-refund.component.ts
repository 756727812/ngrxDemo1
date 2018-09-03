import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as _ from 'lodash';;

const version = +new Date();

export class financialPendingRefundController {
  private page: string;

  refund_order_list: any[];
  total_items: number;

  static $inject: string[] = ['$q', '$routeParams', 'dataService', '$uibModal', 'Notification'];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
    private $uibModal: any,
    private Notification: INotificationService,
  ) {
    this.page = $routeParams['page'] || '1';
    this.total_items = 0;
  }

  $onInit() {
    const promises: ng.IPromise<any>[] = [this.getPendingRefundOrderList()];
    this.$q.all(promises);
  }

  reviewRefund: (small_order_id: string, refund_fee: number, is_withdraw: number) => ng.IPromise<any> = (small_order_id, refund_fee, is_withdraw) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-review-the-refund.html'),
      controller: 'modalReviewTheRefundController',
      controllerAs: 'vm',
      size: 'md',
      backdrop: 'static',
      resolve: {
        refund_fee: () => +refund_fee,
        is_withdraw: () => is_withdraw,
      },
    });
    return modalInstance.result.then(params => {
      _.assign(params, { lit_order_id: small_order_id });
      this.dataService.orderv2_comfirmRefund(params).then(res => {
        this.Notification.success('审核退款操作成功！');
        return this.getPendingRefundOrderList();
      });
    });
  }

  private getPendingRefundOrderList: () => ng.IPromise<any> = () =>
    this.dataService.orderv2_getRefundAuditOrderList({
      page: this.page,
      page_size: 20,
    }).then(res => {
      this.refund_order_list = res.data.list;
      this.total_items = res.data.count;
      return this.refund_order_list;
    })

}

export const financialPendingRefund: ng.IComponentOptions = {
  template: require('./financial-pending-refund.template.html'),
  controller: financialPendingRefundController,
};

