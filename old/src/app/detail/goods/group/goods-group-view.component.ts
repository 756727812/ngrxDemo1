import * as moment from 'moment';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../services/assert-service/assert.service.interface';

import './goods-group-view.less';
import { CUSTOM_GROUP_TYPE_VAL } from './const';
import { debug } from 'util';

export class Controller {


  searFormReadyResolve: Function;
  searchFormReadyPromise: Promise<any>;
  pageData: any;
  formData: any;
  groupInfo: any;
  searchParams: any;
  initDataLoaded: boolean;
  isNonGoods: boolean;
  noneSearchResult: boolean;
  static $inject: string[] = ['assertService', '$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$element'];
  private groupDataList: Array<any>;
  kolId: string; // 超管对单个 KOL 管理分组的时候，会传 url 参数 `kolId`

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
    this.searchFormReadyPromise = new Promise(resolve => {
      this.searFormReadyResolve = resolve;
    });
  }

  $onInit() {
    this.noneSearchResult = false;
    this.isNonGoods = false;
    this.initDataLoaded = false;
    this.searchParams = {};
    this.formData = {};
    this.pageData = {
      pageNo: this.$routeParams.page ? ~~this.$routeParams.page : 1,
      itemsPerPage: 20,
      list: [],
    };
    this.groupDataList = [];
    if (this.$routeParams.kolId) {
      this.kolId = this.$routeParams.kolId;
    }
    // TODO 统一 groupInfo 的来源方式
    if (this.$routeParams.group) {
      this.groupInfo = JSON.parse(this.$routeParams.group);
    } else {
      this.asyncGetGroupDetail(this.getGroupId())//
        .then(({ data }) => {
          this.groupInfo = data;
          this.groupInfo.categoryId = data.id;
        });
    }
    this.searchFormReadyPromise.then(searchFormComp => {
      this.searchParams = searchFormComp.getFormParams();
      this.getPageData().then(({ data }) => {
        this.initDataLoaded = true;
        // NOTE: 第一次获取数据的 count 可以表示该分组是否有商品数
        // 更好的方式就是 groupInfo 里面直接取，但是目前从商品配置
        // 过来的话，后台拿到的 group info 没有这个字段
        // 所以先这么恶心的来判断「有无商品」
        if (data.count === 0) {
          this.isNonGoods = true;
        }
      });
    });
  }

  getGroupId() {
    return this.$routeParams.groupId;
  }

  asyncGetGroupDetail(categoryId) {
    return this.dataService.goods_group_conifg_groupDetail({
      kolId: this.kolId,
      categoryId,
    });
  }

  getPageData(isForSearch = false) {
    return this.dataService.goods_group_commodityListInGroup({
      kolId: this.kolId,
      pageSize: this.pageData.itemsPerPage,
      page: this.pageData.pageNo,
      groupId: this.getGroupId(),
      ...this.searchParams,
      ...this.$location.search()
    })//
      .then(resp => {
        const { data } = resp;
        Object.assign(this.pageData, {
          list: data.list,
          count: data.count,
        });
        if (!isForSearch) {
          this.isNonGoods = data.count === 0;
        }
        return resp;
      });
  }

  canAddGoods() {
    const groupInfo = this.groupInfo;
    return groupInfo && groupInfo.isSystem !== 1 && groupInfo.type !== 1;
  }

  toAddGoods() {
    if (!this.canAddGoods() || !this.groupInfo) {
      return;
    }
    const { categoryName } = this.groupInfo;
    this.$uibModal.open({
      animation: true,
      // backdrop: 'static',
      size: 'goods-group-add-goods',
      component: 'goodsGroupModalAddGoods',
      resolve: {
        groupId: () => this.getGroupId(),
        groupName: () => categoryName,
        kolId: () => this.kolId,
      },
    }).result.then(hasUpdated => {
      if (hasUpdated && hasUpdated) {
        this.pageData.pageNo = 1;
        this.getPageData();
      }
    });
  }

  removeFromGroup(item) {
    this.seeModal.confirmP('确认提示', '确认将该商品移出分组')//
      .then(() => {
        this.dataService.goods_group_delCommodityInGroup({
          kolId: this.kolId,
          categoryId: this.getGroupId(),
          commodityId: item.itemId,
        }).then(() => {
          this.Notification.success('保存成功');
          this.getPageData();
        });
      });
  }

  onSearchSubmit = (data) => {
    this.pageData.pageNo = 1;
    this.searchParams = data;
    const search = this.$location.search()
    this.$location.search({
      ...search,
      ...data,
      page: 1
    })
    // this.getPageData(true).then(({ data }) => {
    //   this.noneSearchResult = data.count === 0;
    // });
  }

  onSearchFormInit = (searchFormComp) => {
    this.searFormReadyResolve(searchFormComp);
  }

  formatDate(ms) {
    return ms ? moment(ms).format('YYYY/MM/DD') : '';
  }

  shouldShowOpCol() {
    return this.groupInfo && this.groupInfo.type === CUSTOM_GROUP_TYPE_VAL.MANNUAL;
  }

  shouldShowOrderOpCol() {
    return this.groupInfo && this.groupInfo.type === CUSTOM_GROUP_TYPE_VAL.MANNUAL;
  }

  canMoveTop(item, index) {
    // 不允许：首页第一条
    const { pageNo } = this.pageData;
    return !(pageNo == 1 && index === 0);
  }

  canMoveUp(item, index) {
    return this.canMoveTop(item, index);
  }

  canMoveDown(item, index) {
    return this.canMoveBottom(item, index);
  }

  canMoveBottom(item, index) {
    // 不允许：最后一页的最后一条
    const { pageNo, count, itemsPerPage, list } = this.pageData;
    try {
      return !(pageNo == Math.ceil(count / itemsPerPage) &&
        index === list.length - 1);
    } catch (e) {
      // x
    }
    return false;
  }

  moveTop(item, index) {
    this.canMoveTop(item, index) && this.changeOrder(item, 1);
  }

  moveUp(item, index) {
    this.canMoveUp(item, index) && this.changeOrder(item, 2);
  }

  moveDown(item, index) {
    this.canMoveDown(item, index) && this.changeOrder(item, 3);
  }

  moveBottom(item, index) {
    this.canMoveBottom(item, index) && this.changeOrder(item, 4);
  }

  changeOrder(item, sortId) {
    //sortId 商品排序类型，1=置顶，2=上升一位，3=下沉一位，4=置尾
    this.dataService.goods_group_sortCommodityInGroup({
      kolId: this.kolId,
      categoryId: this.groupInfo.categoryId,
      commodityId: item.itemId,
      sortId,
    }).then(() => {
      this.getPageData().then(() => {
        this.Notification.success('保存成功');
      });
    });
  }
}

export const goodsGroupView: ng.IComponentOptions = {
  template: require('./goods-group-view.template.html'),
  controller: Controller,
};

