import * as angular from 'angular';

// copy from /xiaochengxu/** */
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

  resetShareImg() {
    this.info.json_config.url_share_png = '';
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

}



export const xcxCodeAuthInfoConfigDisplayForm: ng.IComponentOptions = {
  template: require('./display-form.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    ok: '&',
    cancel: '&',
    info: '=',
  },
};

