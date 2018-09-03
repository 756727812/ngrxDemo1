import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class orderInBatchController {
  list_confirm_dispatch_order: Array<any>;
  form_data: {
    orders: string,
    action: string,
    buyer?: string,
  };
  orders: string;
  static $inject: string[] = ['$q', 'dataService', '$uibModal', 'Notification', 'Upload', 'seeModal'];
  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private Notification: INotificationService,
    private Upload: any,
    private seeModal: ISeeModalService,
  ) {
    this.form_data = {
      orders: '',
      action: '0',
      buyer: '',
    };
  }

  $onInit() {
  }

  confirm: () => ng.IPromise<any> = () => {
    const modalInstance = this.$uibModal.open({
      backdrop: 'static',
      component: 'modalOrderInBatchConfirm',
      resolve: {
        orders: () => this.orders.split(',').map(order => { return { order }; }),
        action: () => this.form_data.action,
      },
    });

    return modalInstance.result.then(orders => {
      this.form_data.orders = JSON.stringify(orders);
      this.dataService.orderv2_inBatchOperation(this.form_data)
        .then(res => this.Notification.success('订单批量操作成功!'));
    });
  }

  checkAction() {
    return (this.form_data.action === '22'
      || this.form_data.action === '23'
      || this.form_data.action === '24'
      || this.form_data.action === '25'
    );
  }

  importExcel: (file: File) => ng.IPromise<any> = file => {
    let url;
    const action = Number(this.form_data.action);
    switch (this.form_data.action) {
      case '22':
        url = 'api/orderv2/batchFinishBuy';
        break;
      case '23':
        url = 'api/orderv2/batchSendGoods';
        break;
      case '24':
        url = 'api/orderv2/batchDispatchOrder';
        break;
      case '25':
        url = 'api/orderv2/batchDispatchOrderEmailImport';
        break;
      default:
    }
    return file ?
      this.Upload.upload({
        url,
        data: { file },
      }).then(res => {
        if (action == 25) {
          if (res.data.result === 0) {
            // this.Notification.dataError(res.data && res.data.msg)
            this.seeModal.confirm('提示', res.data && res.data.msg, () => { }, () => { }, '确认', '');
          } else {
            console.log(res.data.data);
            this.list_confirm_dispatch_order = res.data.data;
          }
        } else {
          // res.data.result === 1 ? this.Notification.success(res.data.msg, false) : this.Notification.dataError(res.data && res.data.msg),
          // err => this.Notification.serverError('抱歉！请稍后再试！')
          this.seeModal.confirm('提示', res.data && res.data.msg, () => { }, () => { }, '确认', '');
        }
      })
      :
      this.$q.reject('没有选择上传文件！');
  }

  //确认批量派发订单
  confirmDispatch(b) {
    if (!b) {
      this.seeModal.confirm('提示', '确认要取消派发订单？', () => {
        this.list_confirm_dispatch_order = [];
      });
    } else {
      this.seeModal.confirm('提示', '确认要派发' + this.list_confirm_dispatch_order.length + '个中订单？', () => {
        const param = {
          dispatch_list: JSON.stringify(this.list_confirm_dispatch_order),
        };
        this.dataService.orderv2_batchDispatchOrderEmailConfirm(param)
          .then(res => {
            console.log(res);
            this.list_confirm_dispatch_order = [];
            this.Notification.success(res.msg, false);
          });
      });
    }
  }


  getTemplateUrl: () => string = () => {
    let
      { action } = this.form_data,
      url_str = '/api/orderv2/exportMasterplate?type=';
    switch (action) {
      case '22':
        url_str += '1';
        break;
      case '23':
        url_str += '2';
        break;
      case '24':
        url_str += '3';
        break;
      case '25':
        url_str = 'https://static.seecsee.com/file/excel/(%E6%A8%A1%E6%9D%BF)See%E6%89%B9%E9%87%8F%E6%B4%BE%E5%8F%91%E8%AE%A2%E5%8D%95.xls';
        //url_str += '4'
        break;
      default:
    }
    return url_str;
  }
}

export const orderInBatch: ng.IComponentOptions = {
  template: require('./order-in-batch.template.html'),
  controller: orderInBatchController,
};

