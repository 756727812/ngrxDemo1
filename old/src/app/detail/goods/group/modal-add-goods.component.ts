import * as _ from 'lodash';;

import './modal-add-goods.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../services/assert-service/assert.service.interface';

import { CHANNEL_VAL, CHANNEL_OPTIONS } from './const';

export class Controller {
  isNonGoods: boolean;
  loading: boolean;
  form: ng.IFormController;
  formData: any;
  close: Function;
  searchFormReadyPromise: Promise<any>;
  searFormReadyResolve: Function;
  rangeDate: any;
  searchParams: any;
  pageData: {
    totalPageNum: number;
    pageSize: number;
    list: any[];
    page: number;
    count: number;
  } = {
    totalPageNum: 0,
    pageSize: 10,
    list: [],
    count: 0,
    page: 1,
  };
  resolve: {
    groupName: string;
    groupId: string;
    kolId?: string;
  };

  static $inject: string[] = [
    'assertService',
    '$scope',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
  ];

  constructor(
    private assertService: IAssertService,
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {
    this.searchFormReadyPromise = new Promise(resolve => {
      this.searFormReadyResolve = resolve;
    });
  }

  CHANNEL_OPTIONS = CHANNEL_OPTIONS;
  categoryOptions = [];
  dirty = false;

  $onInit() {
    this.searchParams = {};
    this.assertService.isOk(this.resolve.groupId, '添加商品不能没有分组ID');
    this.rangeDate = { startDate: null, endDate: null };
    this.searchFormReadyPromise.then(searchFormComp => {
      this.searchParams = searchFormComp.getFormParams();
      this.getPageData();
    });
  }

  addAllGoods() {
    this.searchFormReadyPromise.then(searchFormComp => {
      const { category } = searchFormComp.getFormParams();
      this.dataService
        .goods_group_addAllCommodityToGroup({
          category,
          kolId: this.getKolId(),
          groupId: this.getGroupId(),
        })
        .then(() => {
          this.Notification.success('批量添加成功');
          this.getPageData(this.pageData.page);
        });
    });
  }

  closeDialog() {
    this.close({ $value: this.dirty });
  }

  onSearchSubmit = data => {
    this.searchParams = data;
    this.getPageData(1);
    // tslint:disable-next-line:semicolon
  };

  onSearchFormInit = searchFormComp => {
    this.searFormReadyResolve(searchFormComp);

    // tslint:disable-next-line:semicolon
  };

  getGroupId() {
    return this.resolve.groupId;
  }

  getKolId() {
    return this.resolve.kolId;
  }

  getPageData: (page?: number) => ng.IPromise<any> = (page = 1) => {
    if (this.loading) {
      return;
    }
    this.loading = true;
    return this.dataService
      .goods_group_commoditySearch({
        page,
        kolId: this.getKolId(),
        groupId: this.getGroupId(),
        pageSize: this.pageData.pageSize,
        ...this.searchParams,
      }) //
      .then(({ data }) => {
        const count = parseInt(data.count, 10);
        Object.assign(this.pageData, {
          count,
          page,
          list: data.list,
          totalPageNum: Math.ceil(data.count / this.pageData.pageSize),
        });
        this.loading = false;
        this.isNonGoods = ~~page === 1 && count === 0;
      })
      .catch(e => {
        this.loading = false;
      });
    // tslint:disable-next-line:semicolon
  };

  addGoods(item) {
    this.assertService.isOk(item.itemId, '添加商品必须要有商品 ID');
    const categoryId = this.getGroupId();
    const commodityId = item.itemId;
    this.dataService
      .goods_group_addCommodityToGroup({
        categoryId,
        commodityId,
        kolId: this.getKolId(),
      })
      .then(() => {
        this.dirty = true;
        this.Notification.success('添加成功');
        item.selected = !item.selected;
        item.belongToGroups.push(this.resolve.groupName);
      });
  }

  removeGoods(item) {
    this.assertService.isOk(item.itemId, '移除商品必须要有商品 ID');
    const categoryId = this.getGroupId();
    const commodityId = item.itemId;
    this.dataService
      .goods_group_delCommodityInGroup({
        categoryId,
        commodityId,
        kolId: this.getKolId(),
      })
      .then(() => {
        this.dirty = true;
        this.Notification.success('取消成功');
        item.selected = !item.selected;
        item.belongToGroups = _.without(
          item.belongToGroups,
          this.resolve.groupName,
        );
      });
  }
}

export const goodsGroupModalAddGoods: ng.IComponentOptions = {
  template: require('./modal-add-goods.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
