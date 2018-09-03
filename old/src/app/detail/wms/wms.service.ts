import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
const version = +new Date();

export interface IWmsService {

}
export class wmsService implements IWmsService {
  static $inject: string[] = ['$uibModal', 'dataService', 'Notification'];
  constructor(
    private $uibModal: any,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) { }

}

