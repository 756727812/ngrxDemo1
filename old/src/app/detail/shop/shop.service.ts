import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
const version = +new Date();

export interface IShopService {}
export class shopService implements IShopService {
  static $inject: string[] = ['$uibModal', 'dataService', 'Notification'];
  constructor() {}
  private abctest = 0;

  private _isShowUpgradeInfo = false;

  get isShowUpgradeInfo() {
    return this._isShowUpgradeInfo;
  }

  set isShowUpgradeInfo(val: boolean) {
    this._isShowUpgradeInfo = val;
  }
}
