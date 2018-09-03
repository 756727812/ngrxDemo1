import './content-block.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;


export class ContentBlockController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  data: any;
  dataPromise: Promise<any>;
  hasNonContent: boolean;

  constructor(private $q: ng.IQService,
              private $routeParams: ng.route.IRouteParamsService,
              private $location: ng.ILocationService,
              private dataService: IDataService,
              private Notification: INotificationService,
              private seeModal: ISeeModalService,
              private $uibModal: any) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
    /*
     article_time: "2018-02-14"
     article_title: "test article"
     glance_over_num: "7000"
     read_num: "7000"
     sale_num: "7000"
     visitor_num: "7000"
     wx_official_account: "Adidas 中国"
     */
    this.hasNonContent = false;
    this.dataService.shop_getRecentArticle()//
      .then(({ data }) => {
        this.data = data;
        if (data.length === 0) {
          this.hasNonContent = true;
        }
      });
  }

  goToContentBiz() {
    // TODO 通过 evtbus
    const contentBizHrefEL = $('#sidebar').find('.nav-item-content-business').find('a').first();
    if (contentBizHrefEL.length) {
      window.location.href = contentBizHrefEL.attr('href');
    }
  }
}

export const shopInfoContentBlock: ng.IComponentOptions = {
  template: require('./content-block.template.html'),
  controller: ContentBlockController,
  bindings: {
    data: '<',
  },
};

