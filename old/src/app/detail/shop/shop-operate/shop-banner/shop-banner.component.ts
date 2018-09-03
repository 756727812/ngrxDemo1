import * as angular from 'angular';
import * as moment from 'moment';
import { BannerFormController } from '../banner-form.component';

import './shop-banner.less';

export class ShopBannerController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
    '$element',
    '$scope',
    'applicationService',
    '$cookies',
  ];

  data: any;
  rangeDate: any;
  validateOptions: any;
  errorMsg: any;
  form: any;
  hasNonContent: boolean;
  ready: boolean;
  hrefItem: any;
  bannerForm: BannerFormController;
  dirty: boolean = false;
  kolId: string; // binding

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: any,
    private $element: any,
    private $scope: any,
    private applicationService: any,
    private $cookies: ng.cookies.ICookiesService,
  ) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
    this.ready = false;
    this.errorMsg = [];
    this.rangeDate = { startDate: null, endDate: null };
    this.dataService
      .shop_getXdpBanner({ kol_id: this.kolId }) //
      .then(({ data }) => {
        this.data = data || {};
        this.ready = true;
        // if (!this.$cookies.get('leadShopOperate')) {
        //   this.showCover();
        // }
      });
    this.$scope.$watch(
      () => this.bannerForm && this.bannerForm.isDirty(),
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          this.dirty = newValue;
        }
      },
    );
  }

  onAddBannerForm = (bannerForm: BannerFormController) => {
    this.bannerForm = bannerForm;
  }; // tslint:disable-line semicolon

  submit() {
    if (this.bannerForm.hasError()) {
      return;
    }
    const params = this.bannerForm.getSubmitParams();
    this.dataService
      .shop_addAndUpdateXdpBanner(params) //
      .then(resp => {
        this.Notification.success('保存成功');
      });
  }
}

export const shopOperateShopBanner: ng.IComponentOptions = {
  template: require('./shop-banner.template.html'),
  controller: ShopBannerController,
  bindings: {
    data: '<',
    dirty: '=',
    kolId: '<',
  },
};
