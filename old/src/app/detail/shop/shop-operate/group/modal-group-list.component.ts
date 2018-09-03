import * as moment from 'moment';
import * as _ from 'lodash';;

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { MSG } from './const';

import './modal-group-list.less';

export class Controller implements ng.IComponentController {
  static $inject: string[] = ['$q', 'dataService', '$uibModal', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  dirty: boolean;
  keyword: string;
  pageData: {
    list: any[],
    count: number,
    page: number,
    pageSize: number,
  } = {
    list: [],
    count: 0,
    page: 1,
    pageSize: 20,
  };
  resolve: {
    addedCount: number,
    kolId?: string,
  };

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private seeModal: ISeeModalService,
    private Notification: INotificationService,
  ) {
  }

  $onInit() {
    this.keyword = '';
    this.dirty = false;
    this.getPageData();
  }

  search() {
    this.getPageData();
  }

  resetSearch() {
    this.keyword = '';
    this.getPageData();
  }

  getKolId() {
    return this.resolve.kolId;
  }

  closeDialog() {
    this.close({ $value: this.dirty });
  }

  formatDate(ms) {
    return ms ? moment(ms).format('YYYY/MM/DD') : '';
  }

  getPageData: (page?: number) => ng.IPromise<any> = (page = 1) => {
    return this.dataService.goods_group_config_listGroup4Add({
      kolId: this.getKolId(),
      pageSize: this.pageData.pageSize,
      currentPageNo: page,
      categoryName: _.trim(this.keyword),
    })//
      .then(({ data }) => {
        Object.assign(this.pageData, {
          list: data.list,
          count: parseInt(data.count, 10),
          page,
          totalPageNum: Math.ceil(data.count / this.pageData.pageSize),
        });
      });
  }

  deferCanAddMoreGroup() {
    return this.dataService.goods_group_config_listGroup({
      kolId: this.getKolId(),
    })//
      .then(({ data }) => {
        return data && data.length < 4;
      });
  }

  addGroup(item) {
    this.deferCanAddMoreGroup()//
      .then(allow => {
        if (!allow) {
          this.seeModal.alert(void 0, MSG.AT_MOST_4_GROUP);
          return;
        }
        const { categoryId } = item;
        this.dataService.goods_group_config_addGroup({
          kolId: this.getKolId(),
          categoryId,
        }).then(() => {
          this.dirty = true;
          this.Notification.success('添加成功');
          item.hasRel = !item.hasRel;
        });
      });
  }

  removeGroup(item) {
    const { categoryId } = item;
    this.dataService.goods_group_config_delGroup({
      kolId: this.getKolId(),
      categoryId,
    }).then(() => {
      this.dirty = true;
      this.Notification.success('取消成功');
      item.hasRel = !item.hasRel;
    });
  }
}

export const modalShopOperateGroupList: ng.IComponentOptions = {
  template: require('./modal-group-list.template.html'),
  controller: Controller,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
