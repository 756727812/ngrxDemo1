import { IDataService } from '../../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as md5 from 'md5';;

export class ModalPostOrderBatchController {
  static $inject: string[] = ['$scope', '$uibModalInstance', '$q', '$interval', 'dataService', 'seeModal'];
  orderCount: number;
  doneCount: number = 0;
  orders: string = '';
  status: string = 'form';
  progressKey: string;
  postOrderResult: Array<any>;

  constructor(private $scope: ng.IScope,
              private $uibModalInstance: any,
              private $q: ng.IQService,
              private $interval: ng.IIntervalService,
              private dataService: IDataService,
              private seeModal: ISeeModalService) {
    const promises = [];
    $q.all(promises);
  }

  ok = () => {
    if (this.status === 'form') {
      this.status = 'loading';
      this.progressKey = md5(this.orders).substr(2, 6) + Math.round(new Date().getTime() / 1000);
      this.dataService.wms_outboundOrder_batchCreate({ midOrderIdList: this.orders.split('\n'), progressKey: this.progressKey }).then((res) => {
        this.postOrderResult = res.data;
      });

      const loadTimer = this.$interval(() => {
        this.dataService.wms_outboundOrder_batchCreate_progress({ progressKey: this.progressKey }).then((res) => {
          this.doneCount = res.data;
          if (res.data === this.orderCount) {
            this.$interval.cancel(loadTimer);
            this.status = 'finished';
          }
        });
      },                               1000, 10);
    } else {
      this.$uibModalInstance.dismiss('cancel');
    }
  }

  cancel = () => {
    if (this.status === 'form') {
      this.seeModal.confirm('取消确认', '取消会导致当前输入订单消失', () => {
        this.$uibModalInstance.dismiss('cancel');
      });
    } else {
      this.$uibModalInstance.dismiss('cancel');
    }
  }

  validateOrder = () => {
    this.orderCount = this.orders ? this.orders.split('\n').length : 0;
    return !(this.orderCount > 150);
  }
}

