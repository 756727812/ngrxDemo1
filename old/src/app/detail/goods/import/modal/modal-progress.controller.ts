import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import * as angular from 'angular';
import * as md5 from 'md5';;
import { findKey } from 'lodash';
import './modal.less';
import { debug } from 'util';
import youzanConfig from '../youzan.config';

export class modalProgressController {
  progressKey: string;
  progressStatus: any;
  warningMap: any = {
    导入商品: '正在导入有赞商品',
    批量铺货: '正在铺货',
    全店铺货: '正在铺货',
    批量设置品类: '正在设置品类',
    检查更新: '正在检查有赞更新',
  };

  static $inject: Array<string> = [
    '$scope',
    '$q',
    '$routeParams',
    'Notification',
    '$uibModalInstance',
    '$interval',
    'dataService',
    'data',
  ];
  loadTimer: any = null;
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private $interval: ng.IIntervalService,
    private dataService: IDataService,
    private data: any,
  ) {}

  $onInit() {
    this.progressKey =
      md5(this.data.shopId).substr(2, 6) +
      Math.round(new Date().getTime() / 1000);
    let actionP = null;
    switch (this.data.type) {
      case '导入商品':
        actionP = this.dataService.youzan_product_onlineList({
          shopId: this.data.shopId,
          progressKey: this.progressKey,
        });
        break;
      case '批量铺货':
        actionP = this.dataService.youzan_product_add({
          itemIds: this.data.itemIds,
          shopId: this.data.shopId,
          progressKey: this.progressKey,
        });
        break;
      case '全店铺货':
        actionP = this.dataService.youzan_product_addAll({
          shopId: this.data.shopId,
          progressKey: this.progressKey,
        });
        break;
      case '批量设置品类':
        return this.dataService
          .youzan_product_updateClass({
            ids: Object.keys(this.data.itemIds),
            shopId: this.data.shopId,
            progressKey: this.progressKey,
            classId: this.data.newClass[0].id,
          })
          .then(() => {
            this.$uibModalInstance.close();
          })
          .catch(err => {
            this.$uibModalInstance.dismiss();
            console.log(err);
          });
      // break;
      case '检查更新':
        actionP = this.dataService.youzan_product_check({
          shopId: this.data.shopId,
          progressKey: this.progressKey,
        });
        break;
    }
    actionP
      .then(() => {
        this.loadTimer = this.$interval(
          () => {
            this.dataService
              .youzan_product_progress({
                shopId: this.data.shopId,
                progressKey: this.progressKey,
              })
              .then(res => {
                this.progressStatus = res.data;
                const tmpStatus = this.progressStatus.process.split('/');
                if (+tmpStatus[0] === +tmpStatus[1]) {
                  this.$interval.cancel(this.loadTimer);
                  this.progressStatus.process = 'finished';
                  this.$uibModalInstance.close(this.progressStatus.result);
                }
              })
              .catch(err => {
                this.$interval.cancel(this.loadTimer);
                this.$uibModalInstance.dismiss();
              });
          },
          1000,
          // 25,
        );
      })
      .catch(err => {
        if (err.msg === '有赞店铺授权已经过期，请重新授权') {
          window.location.href = youzanConfig.authorize_url;
        }
        this.$uibModalInstance.dismiss();
      });
  }

  ok: () => void = () => {};

  cancel: () => void = () => {
    this.$interval.cancel(this.loadTimer);
    this.$uibModalInstance.dismiss();
  };
}
