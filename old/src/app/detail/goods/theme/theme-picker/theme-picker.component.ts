import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';

import { modalCreateKOLArticleNewController } from '../../../kol/modal-create-kol-article-new.controller';
import { modalEditWechatIdController } from '../../../kol/modal-edit-wechatid.controller';

import './theme-picker.less';
import GoodsThemeMsgController from '../msg/msg.component';


export default class Controller {

  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];

  static open = (kolId, articleId) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'goods-theme-theme-picker',
      component: 'goodsThemeThemePicker',
      resolve: {
        kolId: () => kolId,
        articleId: () => articleId,
      },
    });
  }

  close: Function;
  form: ng.IFormController;
  loading: boolean;
  keyword: string = '';
  kolId: number;
  nonResult: boolean = false;
  resolve: {
    kolId: string,
    articleId: string,
  };

  pageData: any = {
    page: 1,
    pageSize: 10,
    list: [],
  };

  formData: any = {
    keyword: '',
  };
  submitedKeyword: string = '';

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

  closeModal() {
    this.close(({ $value: null }));
  }

  $onInit() {
    this.getPageData();
  }

  select(item) {
    this.loading = true;
    this.dataService.goods_theme_appendThemeToArticle({
      params: {
        topic_id: item.id,
        article_id: this.resolve.articleId,
        kol_id: this.resolve.kolId,
      },
      noSpinner: true,
    }).then(({ data }) => {
      const { count, unvaliable_count, repeat_count } = data;
      const addedCount = count - unvaliable_count - repeat_count;
      GoodsThemeMsgController.alert(addedCount, repeat_count);
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  formatDate(ms) {
    return ms ? moment(ms).format('YYYY/MM/DD') : '';
  }

  search() {
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
      Object.assign(params, { keyWord: this.submitedKeyword });
    }
    this.dataService.goods_theme_listGoodsTheme({ params, noSpinner: true })//
      .then(({ data }) => {
        Object.assign(this.pageData, {
          page,
          list: data.list,
          count: data.count,
          totalPageNum: Math.ceil(data.count / pageSize),
        });
        this.nonResult = page == 1 && data.list.length === 0;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
  }
}

export const goodsThemeThemePicker: ng.IComponentOptions = {
  template: require('./theme-picker.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};


