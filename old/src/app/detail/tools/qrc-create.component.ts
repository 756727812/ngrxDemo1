import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class qrcCreateController {
  private;
  url_set: string;
  queen: {
    item_type: any,
    item_id: any,
    kol_id: any,
    qr_img: string,
  }
  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {
    this.url_set = '';
    this.queen = {
      item_type: '1',
      item_id: '',
      kol_id: '0',
      qr_img: ''
    };
  }


  submitCreate() {
    console.log('submitCreate');
  }

  resetCreate() {
    console.log('resetCreate');
  }

  getUrl() {
    return encodeURIComponent(this.url_set);
  }

  getQueenQr: () => void = () => {
    if (this.queen.item_id && this.queen.kol_id != 0) {
      this.dataService.get_queen_qrcode({
        itemType: this.queen.item_type,
        itemId: this.queen.item_id,
        kolId: this.queen.kol_id,
      }).then((data) => {
        this.queen.qr_img = data.data
      })
    }
  }

  downloadPng() {

  }


}
export const qrcCreate: ng.IComponentOptions = {
  template: require('./qrc-create.template.html'),
  controller: qrcCreateController,
};
