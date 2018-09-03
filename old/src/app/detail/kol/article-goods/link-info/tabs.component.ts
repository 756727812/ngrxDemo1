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
  panes = [];

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

  select(pane) {
    angular.forEach(this.panes, pane => {
      pane.selected = false;
    });
    pane.selected = true;
  }

  addPane(pane) {
    if (this.panes.length === 0) {
      this.select(pane);
    }
    this.panes.push(pane);
  }
}

export const kolArticleGoodsLinkInfoTabs: ng.IComponentOptions = {
  template: `<div class="wrap" ng-class="$ctrl.dir">
  <ul class="x-tabs" ng-class="{'v-tabs':$ctrl.dir==='v','h-tabs':$ctrl.dir==='h'}">
    <li ng-click="$ctrl.select(pane)"
      ng-repeat="pane in $ctrl.panes" ng-class="{active:pane.selected}">
      <div class="tab-title ng-binding">
      {{pane.title}}
      <div ng-if="pane.recommend" class="recommend ng-scope" ng-class="$ctrl.dir">
        <span class="txt">推荐</span>
      </div>
      </div>
    </li>
  </ul>
  <div class="content" ng-transclude></div>
</div>`,
  transclude: true,
  controller: Controller,
  bindings: {
    dir: '@',
  },
};
