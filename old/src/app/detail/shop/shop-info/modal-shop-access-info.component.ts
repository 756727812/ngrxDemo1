import * as moment from 'moment';
import { forEach } from 'lodash';
import * as md5 from 'md5';;
import * as _ from 'lodash';;

import { IDataService } from '../../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { INotificationService } from '../../../services/notification/notification.interface';

export class ModalShopAccessInfoController {
  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', '$uibModal', 'seeModal'];

  close: Function;
  dismiss: Function;
  resolve: any;
  is_online: boolean;
  str_status: string;

  constructor(private $q: ng.IQService,
              private $routeParams: ng.route.IRouteParamsService,
              private $location: ng.ILocationService,
              private dataService: IDataService,
              private Notification: INotificationService,
              private $uibModal: ng.ui.bootstrap.IModalService) {
    this.is_online = false;
    this.str_status = '';
    this.dataService.shop_checkCurrentStatus({}).then(res => {
      const data = res.data;
      this.str_status = data.str_manager_status;
      if (data.manager_status == 80) {//审核通过才会显示小程序
        this.is_online = true;
      }
    });
  }

  closeDlg() {
    this.dismiss();
  }
  // $onInit() {
  // }

  onCopySuccess() {
    this.Notification.success('复制链接成功');
  }

  hasXiaoChengXu() {
    const type = _.get(this.resolve, 'data.type');
    return type && type > 1;
  }

  onNonXiaoChengXuClick() {
    this.close();
    const upgrade_img = _.result(this.resolve, 'data.upgrade_img');
    this.$uibModal.open({
      animation: true,
      size: 'contact-to-access-xiaochengxu',
      template: `
<div>
  <p>升级服务，请联系工作人员</p>
  <img src="/api/xiaodianpu/headingHelpImg" width="120">
</div>
      `,
    });
  }
}

export const modalShopAccessInfo: ng.IComponentOptions = {
  template: require('./modal-shop-access-info.template.html'),
  controller: ModalShopAccessInfoController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
