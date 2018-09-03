import * as angular from 'angular';

export class Controller {


  static $inject: string[] = ['$scope', '$q', '$cookies', 'dataService'];

  private style_block: string;
  is_kol: number;
  info: any;

  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $cookies: any,
    private dataService: see.IDataService,
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

}



export const xcxCodeAuthInfoConfigServiceForm: ng.IComponentOptions = {
  template: require('./service-form.template.html'),
  controller: Controller,
  bindings: {
    info: '=',
    ok: '&',
    cancel: '&',
  },
};

