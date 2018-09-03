import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';


import { confirmImgHost } from '../../../../utils';

import GoodsThemeMsgController from '../msg/msg.component';


export default class Controller {

  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];

  form: ng.IFormController;
  hasUpdated: boolean;
  loading: boolean;
  themeId: string;
  formData: any;
  submitedKeyword: string;

  sessionCheckItemIdList = []; // 在打开窗口之前商品已经是选中，那么不能切换
  keyword = '';
  nonGoods: boolean = false;
  pageData: any = {
    page: 1,
    pageSize: 10,
    list: [],
  };

  constructor(
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {
  }


  $onInit() {
    this.formData = {
      keyword: '',
    };
    this.getPageData();
  }

  canToggleCheck(item) {
    // 只有在窗口「会话」内可以取消选中
    if (item.add) {
      return _.includes(this.sessionCheckItemIdList, item.id);
    }
    return true;
  }

  toAppend(item) {
    this.loading = true;
    this.asyncAppendGoodsInArticel(item.articleId)
      .then(({ data }) => {
        const { addCount, duplicateCount, newCount, unMatchCount } = data;
        GoodsThemeMsgController.alert(newCount, duplicateCount, unMatchCount);
        this.loading = false;
        this.hasUpdated = true;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  asyncAppendGoodsInArticel(targetId) {
    return this.dataService.goods_theme_appendGoods({
      params: {
        type: 2,
        topicId: this.themeId,
        targetId,
      },
      noSpinner: true,
    });
  }

  search() {
    this.pageData.page = 1;
    this.submitedKeyword = this.formData.keyword;
    this.getPageData();
  }

  getPageData(page = 1) {
    this.loading = true;
    const { pageSize } = this.pageData;
    const params = {
      page,
      pageSize,
    };
    if (this.submitedKeyword) {
      Object.assign(params, { title: this.submitedKeyword });
    }
    this.dataService.goods_theme_getArticleList({
      params,
    })//
      .then(({ data }) => {
        Object.assign(this.pageData, {
          page,
          list: data.list,
          count: data.count,
          totalPageNum: Math.ceil(data.count / pageSize),
        });
        this.nonGoods = page == 1 && data.list.length === 0;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
  }
}

export const goodsThemeAppendGoodsArticleList: ng.IComponentOptions = {
  template: require('./article-list.template.html'),
  controller: Controller,
  bindings: {
    hasUpdated: '=',
    resolve: '<',
    themeId: '<',
    close: '&',
    dismiss: '&',
  },
};


