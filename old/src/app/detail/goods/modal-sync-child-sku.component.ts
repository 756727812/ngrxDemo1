import * as _ from 'lodash';
import * as moment from 'moment';
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';

export class ModalSyncChildSkuController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    'dataService',
    'seeModal',
    'Notification',
    'seeUpload',
  ];
  close: Function;
  dismiss: Function;
  resolve: {
    sku_id: number;
  };
  childStatus: string;

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
    private Notification: INotificationService,
    private seeUpload: ISeeUploadService,
  ) {}

  $onInit() {
    this.dataService
      .product_mgr_checkChildSku({ sku_id: this.resolve.sku_id })
      .then(res => {
        this.childStatus = res.data;
      });
  }

  ok: () => any = () => {
    this.dataService
      .product_mgr_syncChildSku({ sku_id: this.resolve.sku_id })
      .then(res => {
        this.Notification.info(res.data);
      });
    return this.close({});
  };

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });
}

export const ModalSyncChildSku: ng.IComponentOptions = {
  template: require('./modal-sync-child-sku.template.html'),
  controller: ModalSyncChildSkuController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
