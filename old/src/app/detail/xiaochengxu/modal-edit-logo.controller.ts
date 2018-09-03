import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalEditLogoController {
  static $inject: string[] = ['$scope', '$q', '$cookies', '$uibModalInstance', 'info', 'dataService'];

  private style_block: string;
  is_kol: number;

  static open = (info) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    const dataService: see.IDataService = angular.element(document.body).injector().get('dataService');
    return $uibModal.open({
      animation: true,
      template: require('./modal-edit-logo.html'),
      controller: modalEditLogoController,
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
    this.is_kol = (this.$cookies.get('seller_privilege') === '24' || this.$cookies.get('seller_privilege') === '30') ? 1 : 0;
    this.style_block = 'block';
    if (this.is_kol) {
      this.style_block = 'none';
    }
  }


  uploadLogo1(res, size) {
    if (res.result === 1) {
      this.info.json_config.logo_1 = res.data;
    }
  }

  uploadLogo2(res, size) {
    if (res.result === 1) {
      this.info.json_config.logo_2 = res.data;
    }
  }

  uploadUrlSharePng(res, size) {
    if (res.result === 1) {
      this.info.json_config.url_share_png = res.data;
    }
  }

  uploadUrlBigBanner(res, size) {
    if (res.result === 1) {
      this.info.json_config.big_banner_img = res.data;
    }
  }


  resetLogo1() {
    this.info.json_config.logo_1 = 'https://image.seecsee.com/s/p/public_v2/1b0/062/h9o/3x4he04k8s8csso04wcgwok4ko.png';
  }

  resetBigbanner() {
    this.info.json_config.big_banner_img = '';
    this.info.json_config.big_banner_url = '';
    this.info.json_config.big_banner_width = 0;
    this.info.json_config.big_banner_height = 0;
  }


  resetLogo2() {
    this.info.json_config.logo_2 = '';
  }

  ok: () => void = () => {
    console.log(this.info.json_config.logo_1 + ',' + this.info.json_config.logo_2);
    this.$uibModalInstance.close({ info: this.info });
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

