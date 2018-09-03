import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import * as angular from 'angular';
import { debug } from 'util';

export class modalMatchAttrController {
  comment: any = '';
  authorize_url: string;
  platform: string;
  youzanAttr: any = [];
  seeAttr: any = [];
  attrMap: any = {};
  errors: any = {};

  static $inject: string[] = [
    '$scope',
    '$q',
    'Notification',
    '$uibModalInstance',
    'dataService',
    'item',
  ];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private item: any,
  ) {
    this.authorize_url = '';
    this.platform = '';
  }

  $onInit() {
    this.youzanAttr = this.item.youzanAttr ? this.item.youzanAttr.split(',') : [];
    this.seeAttr = this.item.seeAttr ? this.item.seeAttr.split(',') : [];
    console.log(this.item);
    this.attrMap = this.item.attrJson ? JSON.parse(this.item.attrJson) : {};
  }

  ok: () => void = () => {
    /* let check = true;
    this.youzanAttr.forEach(element => {
      if (!this.attrMap[element]) {
        this.errors[element] = true;
        check = false;
      }
    });
    if (check) { */
      this.$uibModalInstance.close(this.attrMap);
    /* } */
  };

  cancel: () => void = () => this.$uibModalInstance.dismiss();
}
