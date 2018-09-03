import * as angular from 'angular';

import './btn-sell-goods.less';

import { SellWayController } from '../../goods/theme/goods-list/sell-way.component';
import { ArticelPickerController } from '../../goods/theme/article-picker/article-picker.component';
import Injector from '../../../utils/injector';
import { makeSureTimeFly } from '../../../utils';

let _kolInfo = null;
const getUserInfo = () => {
  return new Promise(resolve => {
    if (_kolInfo) {
      resolve(_kolInfo);
    } else {
      Injector.getDataService()
        .kol_mgr_kolGetWithSeller({}) //
        .then(({ data }) => {
          _kolInfo = data.kol_info;
          resolve(_kolInfo);
        });
    }
  });
};

export class Controller {
  static $inject: string[] = [
    '$location',
    'dataService',
    'assertService',
    'Notification',
    'seeModal',
    '$uibModal',
  ];

  static toSellInArticle(themeId, goodsItemId) {
    return new Promise(resolve => {
      const dataService = Injector.getDataService();
      ArticelPickerController.open4OnlyPickWithWechatGuarantee(themeId) //
        .then(({ article }) => {
          const waitingModal: ng.ui.bootstrap.IModalInstanceService = Injector.getUibModal().open(
            {
              animation: true,
              template: `<div class="modal-body">商品正在添加到文章中，请稍候...</div>`,
              size: 'sm',
              backdrop: 'static',
            },
          );
          const { article_id, collection_id, article_type } = article;
          const holdingSeconds = makeSureTimeFly(1000);

          dataService
            .goods_theme_addItemToArticle({
              params: {
                article_id,
                item_ids: JSON.stringify([goodsItemId]),
                onsale: 1,
              },
            })
            .then(() => {
              holdingSeconds.then(() => {
                resolve();
                waitingModal.dismiss();
                // Injector.getNotifcation().success('保存成功');
                Injector.getSeeModal().confirm(
                  '提示',
                  '该商品已被添加到文章中，是否前往内容电商模块进行下一步操作',
                  () => {
                    getUserInfo().then((kol_info: any) => {
                      if (kol_info && kol_info.kol_id) {
                        // tslint:disable-next-line:max-line-length
                        const href = `/kol/kol-cooperation-management/${
                          kol_info.kol_id
                        }?article_id=${article_id}&wechat_id=${
                          kol_info.weixin_id
                        }&article_type=${article_type}&collection_id=${collection_id}#2`;
                        window.location.href = href;
                      }
                    });
                  },
                  null,
                  '前往',
                  '再看看',
                );
              });
            })
            .catch(() => {
              waitingModal.dismiss();
            });
        });
    });
  }

  constructor(
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private assertService: see.IAssertService,
    private Notification: see.INotificationService,
    private seeModal: see.seeModal,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  itemId: string;
  themeId?: string;
  onSuccess: Function;

  $onInit() {
    this.assertService.isOk(this.itemId, '必须传入 itemId');
  }

  confirmGoToWarehouse() {
    this.onSuccess && this.onSuccess({ itemId: this.itemId });
  }

  onClick() {
    // SellWayController.open().then(name => {
    //   let promise = null;
    //   if (name === 'article') {
    //     promise = Controller.toSellInArticle(this.themeId, this.itemId);
    //   } else if (name === 'shop') {
    //     promise = this.toAppendToXDP(this.itemId);
    //   }
    //   if (promise) {
    //     promise.then(() => this.onSuccess && this.onSuccess());
    //   }
    // });
    this.toAppendToXDP(this.itemId).then(
      () => this.onSuccess && this.onSuccess(),
    );
  }

  toAppendToXDP(itemId) {
    return new Promise(resolve => {
      // TODO 封装
      const modalInstance: ng.ui.bootstrap.IModalInstanceService = this.$uibModal.open(
        {
          animation: true,
          template: `<div class="modal-body">商品正在添加到小电铺中，请稍候...</div>`,
          size: 'sm',
          backdrop: 'static',
        },
      );
      const holdingSeconds = makeSureTimeFly(1000);
      return this.asyncSellGoods(itemId)
        .then(() => {
          holdingSeconds.then(() => {
            modalInstance.dismiss();
            resolve();
            this.confirmRedirectGoodsAllPage();
          });
        })
        .catch(() => {
          modalInstance.dismiss();
        });
    });
  }

  confirmRedirectGoodsAllPage() {
    // this.seeModal.confirm(
    //   '提示',
    //   '该商品已被添加到小电铺中，是否前往内容电商模块进行下一步操作',
    //   () => this.$location.path('/goods/all'),
    //   null,
    //   '前往',
    //   '再看看',
    // );
    // this.seeModal.alert('提示', '商品添加成功', null);
    this.Notification.success('商品添加成功');
  }

  private asyncSellGoods(itemId) {
    return this.dataService.goods_theme_addGoodsItemToXDPOrOff({
      params: {
        onsale: 1,
        item_ids: JSON.stringify([itemId]),
      },
    });
  }
}

export const commonBtnSellGoods: ng.IComponentOptions = {
  template: require('./btn-sell-goods.template.html'),
  controller: Controller,
  bindings: {
    itemId: '<',
    themeId: '<',
    onSuccess: '&',
  },
};
