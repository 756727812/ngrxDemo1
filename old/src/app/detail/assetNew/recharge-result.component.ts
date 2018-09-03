import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;
import { merge, findIndex } from 'lodash';
import { IDataService } from '../../services/data-service/data-service.interface';

import './recharge.less';

export class Controller {
  static $inject: string[] = [
    '$scope',
    '$compile',
    '$window',
    '$routeParams',
    'dataService',
  ];

  isUnApplyYet: boolean;
  ready: boolean;
  profileData: any;
  userinfo: any;
  nowPrivList: any[];
  vipPrivList: any[];
  rechargeType: string;

  constructor(
    private $scope: ng.IScope,
    private $compile: Function,
    private $window: ng.IWindowService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: IDataService,
  ) {}

  $onInit() {
    const params = this.$routeParams;
    switch (params.rechargeType) {
      case 'see':
        this.dataService.recharge_alipay_return(params);
        break;
      case 'seedata':
        this.dataService.recharge_alipay_return(params);
        break;
    }
    this.rechargeType = this.$routeParams.rechargeType;
  }
}

export const rechargeResult: ng.IComponentOptions = {
  template: require('./recharge-result.template.html'),
  controller: Controller,
  bindings: {},
};
