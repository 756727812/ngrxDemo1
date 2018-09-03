import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';
import { RULE_VAL } from './const';

import './goods-group-list.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../services/assert-service/assert.service.interface';

export class Controller {
  pageData: any;
  formData: any;
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
    'applicationService',
    '$cookies',
  ];
  private groupDataList: Array<any>;
  // 如果有传 kolId 表示针对某个 kol 查询（超管对 KOL 管理）
  // 没传 kolId 则针对当前登录人（菜单「商品分组」）
  kolId: string;
  private editingItemInfo: any;

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
    private applicationService: any,
    private $cookies: ng.cookies.ICookiesService,
  ) {}

  RULE_VAL = RULE_VAL;

  $onInit() {
    this.RULE_VAL = RULE_VAL;
    this.formData = {
      keyword: this.$routeParams.keyword || '',
    };
    this.pageData = {
      pageNo: this.$routeParams.page || 1,
      itemsPerPage: 20,
      list: [],
    };

    this.groupDataList = [];
    this.checkShopStatus().then(this.fetchGroupList.bind(this));
    $(document.body).on('click', this.onBodyClick);
  }

  $onDestroy() {
    $(document.body).off('click', this.onBodyClick);
  }

  onBodyClick = e => {
    if (!$(e.target).is('input.name-input')) {
      this.endItemEdit();
    }
  };

  private checkShopStatus() {
    return this.dataService.checkShopStatus({});
  }

  isCustomAutoGroup(item) {
    return item.type === 1 && item.isSystem === 0;
  }

  isMannualGroup(item) {
    return item.type === 2;
  }

  fetchGroupList() {
    this.dataService
      .goods_group_allCommodityGroups({
        kolId: this.kolId,
        pageSize: this.pageData.itemsPerPage,
        currentPageNo: this.pageData.pageNo,
        categoryName: this.formData.keyword,
      }) //
      .then(({ data }) => {
        Object.assign(this.pageData, {
          list: data.list,
          count: data.count,
        });
        if (!this.$cookies.get('leadGoodsGroup')) {
          this.showCover();
        }
      });
  }
  showCover() {
    setTimeout(() => {
      const that = this,
        elCover = document.getElementById('lead-cover'),
        elLGroupTd = document.getElementById('lead_group_td_0'),
        elLGroupBtn = document.getElementById('lead_group_btn');
      this.applicationService.coverGuide(
        elCover,
        elLGroupTd,
        '<span style="display:inline-block;text-align:right;padding-top:150px;padding-right:50px;">创建的商品分组<br/>可以在小电铺装修页面，配置到前端展示</span><img class="pull-right" src="//static.seecsee.com/seego_plus/images/goods-group.png?imageMogr2/strip/format/webp">',
        function() {
          $('.lead-cover,.lead-info')
            .removeAttr('style')
            .hide();
          $('.lead-info').removeClass('lead_left');
          that.applicationService.coverGuide(
            elCover,
            elLGroupBtn,
            '点击这里，创建你的商品分组',
            function() {
              $('.lead-cover,.lead-info')
                .removeAttr('style')
                .hide();
              const expireDate = new Date();
              expireDate.setDate(expireDate.getDate() + 60);
              that.$cookies.put('leadGoodsGroup', '1', { expires: expireDate });
            },
          );
          $('.lead-info').css({
            left: 'initial',
            right: '10px',
            backgroundSize: '44px 60px',
            backgroundPosition: '50% 0',
          });
        },
      );
      $('.lead-cover').css({
        height: '80px',
      });
      $('.lead-info')
        .css({
          padding: 0,
          textAlign: 'right',
          marginTop: '-45px',
          backgroundPosition: '30% 14%',
        })
        .addClass('lead_left')
        .find('.btn')
        .css('marginRight', '40px');
    }, 500);
  }
  reloadFirstPage() {
    if (this.$routeParams.page == 1) {
      this.refreshData();
    } else {
      this.$location.search({
        ...this.$location.search(),
        page: 1,
      });
    }
  }

  search() {
    this.$location.search({ keyword: this.formData.keyword });
    // this.reloadFirstPage();
  }

  refreshData() {
    this.fetchGroupList();
  }

  toAppendAutoGroup() {
    this.$uibModal
      .open({
        animation: true,
        backdrop: 'static',
        size: 'goods-group-add-auto-group',
        component: 'goodsGroupModalAddAutoGroup',
        resolve: {
          kolId: () => this.kolId,
        },
      })
      .result.then(result => {
        if (result && result.success) {
          this.reloadFirstPage();
        }
      });
  }

  toAppendManualGroup() {
    this.$uibModal
      .open({
        animation: true,
        backdrop: 'static',
        size: 'goods-group-add-manual-group',
        component: 'goodsGroupModalAddManualGroup',
        resolve: {
          type: () => 'add',
          kolId: () => this.kolId,
        },
      })
      .result.then(result => {
        if (result && result.success) {
          this.reloadFirstPage();
        }
      });
  }

  canEdit(item) {
    return !item.isSystem;
  }

  toEditGroupName(item) {
    if (!this.canEdit(item)) {
      return;
    }
    this.$uibModal
      .open({
        animation: true,
        backdrop: 'static',
        size: 'goods-group-add-manual-group',
        component: 'goodsGroupModalAddManualGroup',
        resolve: {
          type: () => 'edit',
          item: () => _.merge({}, item),
          kolId: () => this.kolId,
        },
      })
      .result.then(result => {
        if (result && result.success) {
          this.refreshData();
        }
      });
  }

  onInlineGroupNameClick(e, item) {
    if (!this.canEdit(item)) {
      return;
    }
    e.stopPropagation();
    item._isEditStatus = true;
    const jqNameInputEl = $(e.target)
      .closest('td')
      .find('.name-input');
    jqNameInputEl.val(item.categoryName);
    setTimeout(() => {
      jqNameInputEl.select();
    }, 10);
    this.editingItemInfo = { item, el: jqNameInputEl[0] };
  }

  onInlineGroupNameInputKeyEnter(e, item) {
    this.endItemEdit();
  }

  endItemEdit() {
    if (!this.editingItemInfo) {
      return;
    }
    const { item, el } = this.editingItemInfo;
    item._isEditStatus = false;
    const value = _.trim(el.value);
    if (value === '') {
      this.Notification.warn('商品分组名称不能为空');
      return;
    }
    this.asyncUpdateGroupName(item.categoryId, value) //
      .then(() => {
        this.Notification.success('保存成功');
        item.categoryName = value;
      })
      .catch(() => {
        // this.Notification.success('保存失败');
      });
    this.editingItemInfo = null;
  }

  asyncUpdateGroupName(categoryId, categoryName) {
    return this.dataService.goods_group_updateGroup({
      kolId: this.kolId,
      categoryId,
      categoryName,
    });
  }

  toAddGoods(item) {
    if (!this.canAddGoods(item)) {
      return;
    }
    const { categoryId, categoryName } = item;
    this.$uibModal
      .open({
        animation: true,
        // backdrop: 'static',
        size: 'goods-group-add-goods',
        component: 'goodsGroupModalAddGoods',
        resolve: {
          groupId: () => categoryId,
          groupName: () => categoryName,
          kolId: () => this.kolId,
        },
      })
      .result.then(hasUpdated => {
        if (hasUpdated && hasUpdated) {
          this.refreshData();
        }
      });
  }

  // TODO 弄个 moment 过滤器
  formatDate(ms) {
    return ms ? moment(ms).format('YYYY-MM-DD') : '';
  }

  delGroup(item) {
    if (item.isSystem) {
      return;
    }
    const { categoryId } = item;
    this.assertService.isOk(categoryId, '没有分组id');
    this.asyncIsGroupUsed(categoryId) //
      .then(({ data }) => {
        const msg = data
          ? '删除该分组后，会影响到小电铺目前的分类显示，确认删除？'
          : '确认删除该分组？';
        this.openConfirmDelDialog(msg, categoryId);
      });
  }

  private asyncIsGroupUsed(categoryId) {
    return this.dataService.goods_group_isGroupUsed({
      kolId: this.kolId,
      categoryId,
    });
  }

  openConfirmDelDialog(msg, categoryId) {
    this.seeModal.confirm('确认提示', msg, () => {
      this.dataService
        .goods_group_delGroup({
          kolId: this.kolId,
          categoryId,
        }) //
        .then(() => {
          this.refreshData();
          this.Notification.success('删除成功');
        });
    });
  }

  canAddGoods(item) {
    // 可添加商品：非系统默认、非自动分组
    return item.isSystem !== 1 && item.type !== 1;
  }

  getViewHref(item) {
    let base = `/goods/groups/${item.categoryId}?group=${encodeURIComponent(
      JSON.stringify(item),
    )}`;
    if (this.kolId) {
      base += `&kolId=${this.kolId}`;
    }
    return base;
  }

  canView(item) {
    return true; //item.commodityCount > 0;
  }

  shouldShowShopOperate() {
    return !!this.kolId;
  }

  toShopOperate() {
    this.$location
      .path('/shop/operate')
      .search({ kolId: this.kolId })
      .hash('group');
  }
}
export const goodsGroupList: ng.IComponentOptions = {
  template: require('./goods-group-list.template.html'),
  controller: Controller,
  bindings: {
    kolId: '<',
  },
};
