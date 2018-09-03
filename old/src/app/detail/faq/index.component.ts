import * as angular from 'angular';
import * as moment from 'moment';
import * as md5 from 'md5';
import { merge, findIndex } from 'lodash';

import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../services/assert-service/assert.service.interface';

import './index.less';
import faqConfig from './const';

export class Controller {
  static $inject: string[] = [
    '$scope',
    '$compile',
    '$window',
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

  pageData: any;
  lastPageDataParams: any = null;
  formData: any;

  keyword: string = '';
  nonSearchResult: boolean = false;
  submitedKeyword: string = '';
  loading: boolean = false;
  hasLastPageLoaded: boolean = false;
  ready = false;
  list: any;
  activeIndex: any = 0;
  activeItem: any;
  showingSearchResult: boolean = false;
  searchResultList = [];
  showingTpl: boolean = false;
  tplMap: any = {};
  tplCtDom: any;
  isShowSearchForm: boolean = true;

  constructor(
    private $scope: ng.IScope,
    private $compile: Function,
    private $window: ng.IWindowService,
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {}

  $onInit() {
    this.list = faqConfig.list;
    if (
      localStorage.getItem('seller_privilege') === '30' ||
      localStorage.getItem('seller_privilege') === '1'
    ) {
      const length = this.list.length;
      if (length === 0 || this.list[length - 1].id !== 'feedback') {
        this.list.push({
          id: 'feedback',
          title: '意见反馈',
          template: '<feedback-form></feedback-form>',
        });
      }
    }
    const hash = this.$window.location.hash.replace('#', '');
    if (hash) {
      const index = findIndex(this.list, { id: hash });
      if (index !== -1) {
        this.activeIndex = index;
      }
    }
    this.activeItem = this.list.length ? this.list[this.activeIndex] : null;
    this.tplCtDom = this.$element.find('.tpl-ct');
  }

  showTplConent(item) {
    this.tplCtDom.find('.tpl').hide();
    if (!this.tplMap[item.id]) {
      const tplDom = (this.tplMap[item.id] = this.$compile(
        `<div class="tpl tpl-${item.id}">${item.template}</div>`,
      )(this.$scope));
      this.tplCtDom.append(tplDom);
    }
    this.tplCtDom.find(`.tpl.tpl-${item.id}`).show();
  }

  select(item) {
    this.activeIndex = findIndex(this.list, { id: item.id });
    this.activeItem = item;
    if (item.template) {
      this.showingTpl = true;
      this.showTplConent(item);
      if (item.id === 'feedback') {
        this.isShowSearchForm = false;
      } else {
        this.isShowSearchForm = true;
      }
    } else {
      this.showingTpl = false;
    }
  }

  submitSearch() {
    if (this.keyword === this.submitedKeyword) {
      return;
    }
    // this.showingTpl = false
    if (!this.keyword) {
      this.submitedKeyword = '';
      this.showingSearchResult = false;
      return;
    }
    this.submitedKeyword = this.keyword;
    this.calcSearchReulstList();
    this.showingSearchResult = true;
  }

  clearSearch() {
    this.keyword = '';
    this.submitSearch();
    // this.showingTpl = false
  }

  onSearchResultTplItemClick(item) {
    if (this.isTplItem(item)) {
      this.clearSearch();
      this.select(item);
    }
  }

  isTplItem(item) {
    return item.template;
  }

  isItemMatch(item, kw) {
    const upKw = kw.toUpperCase();
    if (item.title.toUpperCase().indexOf(kw) !== -1) {
      return true;
    }
    return false;
  }

  getUpperCaseKeyword() {
    return this.keyword.toUpperCase();
  }

  calcSearchReulstList() {
    this.searchResultList = merge([], this.list).filter(item => {
      const kw = this.getUpperCaseKeyword();
      const titleUp = item.title.toUpperCase();
      // 如果话题的名称匹配到关键字，则所有文档显示
      if (titleUp.indexOf(kw) !== -1) {
        return true;
      }
      if (!item.items) {
        return false;
      }
      // 如果话题名称不匹配，但是某些文档匹配，那么只展示该文档
      const matchSubItems = item.items.filter(subItem => {
        return subItem.title.toUpperCase().indexOf(kw) !== -1;
      });
      if (matchSubItems.length) {
        item.items = matchSubItems;
        return true;
      }
    });
  }

  getDocHref(item) {
    const { title, href } = item;
    return `/help-doc.html?title=${encodeURIComponent(
      title,
    )}&src=${encodeURIComponent(href)}`;
  }
}

export const faq: ng.IComponentOptions = {
  template: require('./index.template.html'),
  controller: Controller,
  bindings: {},
};
