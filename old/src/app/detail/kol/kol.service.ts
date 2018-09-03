import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
const version = +new Date();

export interface IKolService {
  createKol: (wechat_id: string, wechat_name: string) => ng.IPromise<any>;
}
export class kolService implements IKolService {
  static $inject: string[] = ['$uibModal', 'dataService', 'Notification'];
  constructor(
    private $uibModal: any,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) { }

  createKol: (wechat_id?: string, wechat_name?: string) => ng.IPromise<any> = (wechat_id = '', wechat_name = '') => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol.html'),
      controller: 'modalCreateKOLController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_id: () => 0,
        wechat_id: () => wechat_id,
        wechat_name: () => wechat_name,
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService.kol_mgr_kolAdd({
        kol_info: JSON.stringify(params),
      }).then(res => this.Notification.success('创建KOL成功！'));
    });
  }
}


