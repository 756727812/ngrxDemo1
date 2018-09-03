import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalEditServiceController {

  static open = function open(info)  {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    const dataService: see.IDataService = angular.element(document.body).injector().get('dataService');
    return $uibModal.open({
      animation: true,
      template: require('./modal-edit-service.html'),
      controller: modalEditServiceController,
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        info: () => info,
      },
    });
  };

  static $inject: string[] = ['$scope', '$q', '$cookies', '$uibModalInstance', 'info', 'dataService'];

  private style_block: string;
  is_kol: number;
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $cookies: any,
    private $uibModalInstance: any,
    private info: any,
    private dataService: IDataService,
  ) {
    this.is_kol = (this.$cookies.get('seller_privilege') === '24' || this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
    this.style_block = 'block';
    if (this.is_kol) {
      this.style_block = 'none';
    }
  }


  uploadQrc(res, size) {
    if (res.result === 1) {
      this.info.service_config.qrc_img = res.data;
    }
  }

  changeUseSeego(use_seego) {
    this.info.service_config.use_seego = use_seego;
  }

  ok: () => void = () => {
    this.$uibModalInstance.close({ info: this.info });
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

