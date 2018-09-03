import * as _ from 'lodash';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';


export class shopGuideController implements ng.IComponentController {
  force_active_tab: string;
  show_type: number;
  xdp_data: any;
  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {
    this.force_active_tab = this.$routeParams['force_active_tab'] || '';
    this.force_active_tab = decodeURI(this.force_active_tab);

    const cur_type = this.$routeParams['show_type'] || '0';
    this.show_type = Number(cur_type);
    this.xdp_data = this.$routeParams['xdp_data'] || '[]';
    this.xdp_data = JSON.parse(this.xdp_data);

    // console.log(this.force_active_tab, this.show_type, this.xdp_data);
  }

  $onInit() {

  }


}


export const shopGuide: ng.IComponentOptions = {
  template: require('./shop-guide.template.html'),
  controller: shopGuideController,
};

