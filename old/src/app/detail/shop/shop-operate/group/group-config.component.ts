import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;
import { MSG } from './const';

import './group-config.less';

export class Controller {

  static $inject: string[] = [
    'assertService',
    '$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal', '$element', '$scope'];
  groupList: any;
  formData: any;
  nameWhenLastBlur: string;
  ready: boolean;
  kolId?: string;


  constructor(
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private $element: any,
    private $scope: any,
  ) {
  }

  $onInit() {
    this.ready = false;
    this.groupList = [];
    this.nameWhenLastBlur = '';
    this.formData = { name: '' };
    // this.fetchName();
    this.refreshGroupList().then(() => {
      this.ready = true;
    });
  }

  fetchName() {
    this.dataService.goods_group_conifg_getName({
      kolId: this.getKolId(),
    })//
      .then(({ data }) => {
        this.formData.name = data;
      });
  }

  onNameInputBlur() {
    if (this.nameWhenLastBlur === this.formData.name) {
      return;
    }
    this.dataService.goods_group_conifg_updateName({
      kolId: this.getKolId(),
      configName: this.formData.name,
    }).then(() => {
      this.Notification.success('保存成功');
    });
    this.nameWhenLastBlur = this.formData.name;
  }

  refreshGroupList() {
    return this.dataService.goods_group_config_listGroup({
      kolId: this.getKolId(),
    })//
      .then(({ data }) => {
        this.groupList = data;
      });
  }

  moveDown(item) {
    this.changeOrder(item.categoryId, 2);

  }

  moveUp(item) {
    this.changeOrder(item.categoryId, 1);
  }

  remove(item) {
    const { categoryId } = item;
    this.seeModal.confirmP('确认提示', '确认移除该分组')
      .then(() => {
        this.dataService.goods_group_config_delGroup({
          kolId: this.getKolId(),
          categoryId,
        }).then(() => {
          this.refreshGroupList();
          this.Notification.success('取消成功');
        });
      });
  }

  //操作类型1-升序，2-降序
  private changeOrder(categoryId, operationType) {
    // categoryId operationType
    this.dataService.goods_group_conifg_sortGroup({
      kolId: this.getKolId(),
      categoryId,
      operationType,
    }).then(() => {
      this.refreshGroupList();
    });
  }

  isFromAdmin() {
    return this.$routeParams.source === 'admin';
  }

  getGroupListLinkHref() {
    // TODO 路由跳转统一一个方法，避免到处引用路径，跳转参数不统一
    if (this.isFromAdmin()) {
      const { wechat_id } = this.$routeParams;
      this.assertService.isOk(wechat_id, '内部权限跳转电铺装修未带上 wechat_id 参数');
      return `/kol/kol-cooperation-management/${this.getKolId()}?wechat_id=${wechat_id}#7`;
    } else {
      return '/goods/groups';
    }
  }

  getKolId() {
    return this.kolId;
  }

  getViewHref(item) {
    let path = `/goods/groups/${item.categoryId}`;
    if (this.getKolId()) {
      path += `?kolId=${this.getKolId()}`;
    }
    return path;
  }

  toAddGroup() {
    if (this.groupList.length >= 4) {
      this.seeModal.alert(void 0, MSG.AT_MOST_4_GROUP);
      return;
    }
    this.$uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'shop-operate-modal-group-list',
      component: 'modalShopOperateGroupList',
      resolve: {
        kolId: () => this.getKolId(),
        groupListHref: () => this.getGroupListLinkHref(),
        fromAdmin: () => this.isFromAdmin(),
      },
    }).result.then(hasUpdated => {
      if (hasUpdated && hasUpdated) {
        this.refreshGroupList();
      }
    });
  }

}

export const shopOperateGroupConfig: ng.IComponentOptions = {
  template: require('./group-config.template.html'),
  controller: Controller,
  bindings: {
    data: '<',
    kolId: '<',
  },
};

