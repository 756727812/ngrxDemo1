import './gmv-composition-tips.less';

import * as moment from 'moment';
import * as md5 from 'md5';
import * as _ from 'lodash';

export class GmvCompositionTipsController {
  data: any;
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    '$uibModal',
  ];
  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private $uibModal: any,
  ) {}

  $onInit() {}

  get isTipsVisible() {
    return this.data.date && +this.data.date.replace(/\W/g, '') >= 201803;
  }
}

export const GmvCompositionTips: ng.IComponentOptions = {
  template: require('./gmv-composition-tips.html'),
  controller: GmvCompositionTipsController,
  transclude: true,
  bindings: {
    data: '<',
  },
};
