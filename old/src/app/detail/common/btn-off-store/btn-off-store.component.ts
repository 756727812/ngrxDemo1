import * as angular from 'angular';
import { makeSureTimeFly } from '../../../utils';

import './btn-off-store.less';

export class Controller {
  static $inject: string[] = [
    '$location',
    'dataService',
    'assertService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  constructor(
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private assertService: see.IAssertService,
    private Notification: see.INotificationService,
    private seeModal: see.seeModal,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  itemId: string;
  onSuccess: Function;

  $onInit() {
    this.assertService.isOk(this.itemId, '必须传入 itemId');
  }

  confirmGoToWarehouse() {
    this.onSuccess && this.onSuccess({ itemId: this.itemId });

    this.seeModal.confirm(
      '提示',
      '该商品已被添加到小电铺仓库中，是否前往仓库查看/编辑该商品',
      () => {
        this.$location.path('/goods/all').hash('0');
      },
      null,
      '前往',
      '再看看',
    );
  }

  onClick() {
    const modalInstance: ng.ui.bootstrap.IModalInstanceService = this.$uibModal.open(
      {
        animation: true,
        template: `<div class="modal-body">商品正在放入仓库中，请稍候...</div>`,
        size: 'sm',
        backdrop: 'static',
      },
    );
    const holdingSeconds = makeSureTimeFly(1000);
    this.dataService
      .kol_mgr_addWarehouseItem({ item_ids: JSON.stringify([this.itemId]) })
      .then(() => {
        holdingSeconds.then(() => {
          this.confirmGoToWarehouse();
          modalInstance.dismiss();
        });
      })
      .catch(() => {
        modalInstance.dismiss();
      });
  }
}

export const commonBtnOffStore: ng.IComponentOptions = {
  template: require('./btn-off-store.template.html'),
  controller: Controller,
  bindings: {
    itemId: '<',
    onSuccess: '&',
  },
};
