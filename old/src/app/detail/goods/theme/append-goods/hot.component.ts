import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';


import { confirmImgHost } from '../../../../utils';

export default class Controller {

  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];

  form: ng.IFormController;
  hasUpdated: boolean;
  notValidSearchId: boolean = false;
  nonGoods: boolean;
  loading: boolean;
  themeId: string;
  formData: any;
  submitedKeyword: string;
  submitedKeyword_id: any;

  sessionCheckItemIdList = []; // 在打开窗口之前商品已经是选中，那么不能切换
  keyword = '';
  pageData: any = {
    page: 1,
    pageSize: 20,
    list: [],
  };
  originalCheckedMap = {};

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
      keyword_id: '',
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

  isOriginalChecked(item) {
    if (this.originalCheckedMap[item.id] === void 0) {
      this.originalCheckedMap[item.id] = item.add;
    }
    return this.originalCheckedMap[item.id];
  }

  toggleCheck(item) {
    if (!this.canToggleCheck(item)) {
      return;
    }
    let promise;
    item._busy = true;
    let msg;
    if (item.add) {
      msg = '取消成功';
      promise = this.asyncRemoveGoods(item.id);
    } else {
      msg = '添加成功';
      promise = this.asyncAppendGoods(item.id).then(() => {
        this.sessionCheckItemIdList.push(item.id);
      });
    }
    promise
      .then(() => {
        this.hasUpdated = true;
        item.add = !item.add;
        item._busy = false;
        this.Notification.success(msg);
      })
      .catch(() => item._busy = false);
  }

  asyncAppendGoods(targetId) {
    return this.dataService.goods_theme_appendGoods({
      params: {
        type: 1,
        topicId: this.themeId,
        targetId,
      },
      noSpinner: true,
    });
  }

  asyncRemoveGoods(targetId) {
    return this.dataService.goods_theme_removeGoods({
      params: {
        type: 3,
        topicId: this.themeId,
        targetId,
      },
      noSpinner: true,
    });
  }

  search() {
    this.notValidSearchId = false;
    this.pageData.page = 1;
    this.submitedKeyword = this.formData.keyword;
    const keyword_id = this.formData.keyword_id;
    if (keyword_id.length) {
      const searchId = parseInt(keyword_id, 10);
      if (String(searchId) === 'NaN') {
        this.notValidSearchId = true;
        return;
      }
      this.submitedKeyword_id = searchId;
    }
    this.getPageData();
  }

  getPageData(page = 1) {
    const { pageSize } = this.pageData;
    const params = {
      topicId: this.themeId,
      page,
      pageSize,
    };
    if (this.submitedKeyword) {
      Object.assign(params, { keyWord: this.submitedKeyword });
    }
    if (typeof this.submitedKeyword_id === 'number') {
      Object.assign(params, { itemId: this.submitedKeyword_id });
      this.submitedKeyword_id = false;
    }
    this.dataService.goods_theme_getHotGoods({
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
      });
  }
}

export const goodsThemeAppendGoodsHot: ng.IComponentOptions = {
  template: require('./hot.template.html'),
  controller: Controller,
  bindings: {
    hasUpdated: '=',
    resolve: '<',
    themeId: '<',
    close: '&',
    dismiss: '&',
  },
};


