import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalEditInfoController {

  static $inject: string[] = ['$scope', '$q', '$cookies', '$uibModalInstance', 'info', 'dataService'];

  private style_block: any = {display:'block'};
  private is_kol: number;

  static open = (info) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    const dataService: see.IDataService = angular.element(document.body).injector().get('dataService');
    return $uibModal.open({
      animation: true,
      template: require('./modal-edit-info.html'),
      controller: modalEditInfoController,
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        info: () => info,
      },
    });
  }


  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $cookies: any,
    private $uibModalInstance: any,
    private info: any,
    private dataService: IDataService,
  ) {
    const seller_privilege = this.$cookies.get('seller_privilege');
    this.is_kol = (seller_privilege === '24' || seller_privilege === '30') ? 1 : 0;
    if (this.is_kol) {
      this.style_block = {display:'none'};
    }
    if (seller_privilege === '40') {
      // 流量采买没有这两项输入, 为了表单验证正常, 手动赋值
      this.info.mch_id = '-';
      this.info.mch_sign_key = '-';
    }
  }

  ok: () => void = () => {
    this.$uibModalInstance.close({ info: this.info });
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

