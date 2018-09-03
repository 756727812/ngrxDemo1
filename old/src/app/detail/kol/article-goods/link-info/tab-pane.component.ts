import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

export class Controller {
  static $inject: string[] = [
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  tabsCtrl: any;
  selected = false;

  constructor(
    private assertService: see.IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  $onInit() {
    this.tabsCtrl.addPane(this);
  }
}

export const kolArticleGoodsLinkInfoTabPane: ng.IComponentOptions = {
  template: `<div class="tab-pane" ng-show="$ctrl.selected" ng-transclude></div>`,
  transclude: true,
  require: {
    tabsCtrl: '^^kolArticleGoodsLinkInfoTabs',
  },
  bindings: {
    title: '@',
    recommend: '<',
  },
  controller: Controller,
};
