import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';

export class rechargeRedirectController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
  ];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {}

  $onInit() {
    let rechargeP = null;
    if (this.$routeParams.rechargeId > 0) {
      rechargeP = this.dataService.reRecharge_redirect(this.$routeParams);
    } else if (this.$routeParams.type === 'seedata') {
      rechargeP = this.dataService.seedata_recharge_redirect(this.$routeParams);
    } else {
      rechargeP = this.dataService.recharge_redirect(this.$routeParams);
    }
    rechargeP.catch(res => {
      if (res.result === 0) {
        this.Notification.error('支付异常，请关闭此页面后重试');
      } else if (res.result < 0) {
        this.Notification.error(res.msg);
      } else {
        //this.Notification.info('正在跳转' + res);
        $(document.body).html(res);
      }
    });
  }
}

export const rechargeRedirect: ng.IComponentOptions = {
  controller: rechargeRedirectController,
};
