import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;
import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';
import { modalAuthorizeController } from '../modal/modal-authorize.controller';
import { modalProgressController } from '../modal/modal-progress.controller';
import { modalAddSuccessController } from '../modal/modal-add-success.controller';
import { modalMatchAttrController } from '../modal/modal-match-attr.controller';

import '../import.less';
import youzanConfig from '../youzan.config';
import { confirmImgHost } from '../../../../utils';
import { debug } from 'util';
/* import { modalSelectClassController } from 'app/detail/datacenter/modal-select-class.controller'; */

export class Controller {
  static $inject: string[] = [
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
    '$httpParamSerializer',
  ];

  pageData: any;
  lastPageDataParams: any = null;
  formData: any;
  steps: string[];
  keyword: string = '';
  nonSearchResult: boolean = false;
  submitedKeyword: string;
  hasLastPageLoaded: boolean = false;
  class_list: any = [];
  ready = false;
  list = [];
  count: number;
  shopList: any = [];
  markedItem: any = {};
  markedId: any = {};
  markAll = false;
  progressKey: string = '';
  searchForm: any = {};
  loading: boolean = false;

  constructor(
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
    private $httpParamSerializer: ng.IHttpParamSerializer,
  ) {
    // super();
  }

  $onInit() {
    this.searchForm = {
      itemName: this.$routeParams.itemName,
      status: this.$routeParams.status,
    };
    const promises = [];
    if (!this.$routeParams.importshopId) {
      promises.push(this.getLocalList());
    }
    this.steps = [
      '添加并授权电铺',
      '查看并选择商品',
      '导入所选商品',
      '设置商品品类',
      '完成首次铺货',
      '检查并更新商品',
    ];
    if (!this.$location.hash()) {
      this.getShopList();
      return;
    }
    this.getShopList().then(() => this.$q.all(promises));

    if (this.$routeParams.importshopid > 0) {
      /* 初次导入商品进度框 */
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'sm',
        backdrop: 'static',
        template: require('../modal/modal-progress.template.html'),
        controller: modalProgressController,
        controllerAs: 'vm',
        resolve: {
          data: () => {
            return {
              /* 类型 */
              type: '导入商品',
              /* 商铺id */
              shopId: this.$routeParams.importshopid,
              itemIds: null,
            };
          },
        },
      });

      return modalInstance.result.then((params: any) => {
        this.$location.search({ page: 1 });
      });
    }
  }

  private getLocalList: () => ng.IPromise<any> = () => {
    this.loading = true;
    const { page, itemName, status } = this.$routeParams;
    const shopId = this.$location.hash();
    const params = { itemName, status, shopId, pageNO: page, pageSize: 50 };
    return shopId
      ? this.dataService
          .youzan_product_localList(params)
          .then(res => {
            this.list = res.data.list;
            this.count = res.data.count;
          })
          .finally(() => {
            this.loading = false;
          })
      : null;
  };

  private getShopList: () => ng.IPromise<any> = () => {
    if (this.shopList.length === 0) {
      return this.dataService.youzan_authorization_list().then(res => {
        this.shopList = res.data;
        if (!this.$location.hash() && this.shopList.length > 0)
          this.$location.hash(this.shopList[0].shopId);
      });
    }
    return this.$q.resolve();
  };

  private getClass2Tree: () => ng.IPromise<any> = () =>
    this.dataService
      .youzan_product_classList({
        // only_on: 1,
        // get_all: 1,
      })
      .then(res => {
        const data = res.data;
        let classList = [],
          length = data.length,
          temp = {},
          i,
          j,
          k;
        _.forEach(data, o => {
          o.parentId === 0 &&
            classList.push(Object.assign(o, { children: [] }));
        });
        const cllength = classList.length;
        for (i = 0; i < length; i++) {
          if (data[i].parentId === 0) continue;
          for (j = 0; j < cllength; j++) {
            if (data[i].parentId == classList[j].id) {
              classList[j].children.push(
                Object.assign(data[i], { children: [] }),
              );
              break;
            }
          }
        }
        let flag = true;

        for (i = 0; i < length; i++) {
          if (~data[i].classPath.indexOf(',')) {
            flag = true;
            for (j = 0; j < cllength; j++) {
              if (!flag) break;
              const templ = classList[j].children.length;
              for (k = 0; k < templ; k++) {
                if (classList[j].children[k].id == data[i].parentId) {
                  classList[j].children[k].children.push(data[i]);
                  flag = false;
                  break;
                }
              }
            }
          }
        }
        this.class_list = classList;
      });

  submitSearch() {
    this.$location.search(this.searchForm);
    /* this.$onInit(); */
  }

  // 显示选择品类的Modal
  updateClass: (item) => any = item => {
    if (item.status == 1) {
      return false;
    }
    return this.selectClass().then((new_selected_class: any[]) => {
      this.seeModal
        .confirmP(
          '设置品类',
          `<h4>当前商品的品类将设置为<br>
      <b>${new_selected_class[0]['className']}</b> <br>
      确认进行该操作？</h4>
      <h4>注意：商品一旦铺货后品类不可修改</h4>
      `,
          '确定',
          '取消',
        )
        .then(() => {
          return this.dataService.youzan_product_updateClass({
            ids: [item.id],
            shopId: this.$location.hash(),
            classId: new_selected_class[0]['id'],
          });
        })
        .then(res => {
          this.Notification.success();
          this.$onInit();
        });
    });
  };

  selectClass(prevClass = 0) {
    return this.getClass2Tree().then(() => {
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'sm',
        backdrop: 'static',
        template: require('../../../datacenter/modal-select-single-class.html'),
        controller: 'modalSelectClassController',
        controllerAs: 'vm',
        resolve: {
          // 获取选择的列表
          // selected_class: () => this.selected_class,
          selected_class: () => [],
          // 获取全部的列表
          class_list: () => this.class_list,
        },
      });
      return modalInstance.result.then(
        (new_selected_class: any[]) => new_selected_class,
      );
    });
  }

  selectTab() {
    this.$location.search(_.assign({}, { page: 1 }));
  }

  markItem = (itemId, id) => {
    this.markedId[id] = this.markedId[id] ? !this.markedId[id] : true;
  };

  markAllChange = () => {
    this.list.forEach(v => {
      if (v.status != 1) {
        this.markedId[v.id] = this.markAll;
        this.markedItem[v.itemId] = this.markAll;
      }
    });
  };

  /**
   * 检查有赞新增商品
   */
  check() {
    const shopId = this.$location.hash();
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../modal/modal-progress.template.html'),
      controller: modalProgressController,
      controllerAs: 'vm',
      resolve: {
        data: () => {
          return {
            /* 类型 */
            type: '检查更新',
            /* 商铺id */
            shopId,
          };
        },
      },
    });

    return modalInstance.result.then((params: any) => {
      this.Notification.info(
        '本次更新检测到新增 ' + params.split('/')[0] + '个商品',
      );
      this.$onInit();
    });
  }

  /**
   * 铺货
   * @param itemId 有赞id
   */
  add(item) {
    if (!(item.itemType > 0)) {
      this.seeModal.confirmP('提示', '请先设置品类');
      return;
    }
    const shopId = this.$location.hash();
    this.dataService
      .youzan_product_add({
        shopId,
        itemIds: [item.itemId],
      })
      .then(res => {
        if (+res.result === 1) {
          const modalInstance = this.$uibModal.open({
            animation: true,
            size: 'md',
            backdrop: 'static',
            template: require('../modal/modal-add-success.template.html'),
            controller: modalAddSuccessController,
            controllerAs: 'vm',
            resolve: {
              payload: () => {
                return {
                  isBatch: false,
                };
              },
            },
          });
          this.markedItem = {};
          this.markedId = {};
          this.markAll = false;
        }
      })
      .catch(err => {
        if (err.msg === '有赞店铺授权已经过期，请重新授权') {
          window.location.href = youzanConfig.authorize_url;
        }
      })
      .finally(() => {
        this.$onInit();
      });
  }

  delete(item) {
    this.dataService.youzan_product_delete({ id: item.id }).then(res => {
      this.$onInit();
    });
  }

  /**
   * 重新设置规格并铺货
   * @param item 商品信息
   */
  addWithAttr(item) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../modal/modal-match-attr.template.html'),
      controller: modalMatchAttrController,
      controllerAs: 'vm',
      resolve: {
        item: () => item,
      },
    });

    return modalInstance.result.then((attrMap: any) => {
      const shopId = this.$location.hash();
      this.dataService
        .youzan_product_add({
          itemIds: [item.itemId],
          shopId,
          attrMap: JSON.stringify(attrMap),
        })
        .then(res => {
          this.$onInit();
          const modalInstance = this.$uibModal.open({
            animation: true,
            size: 'md',
            backdrop: 'static',
            template: require('../modal/modal-add-success.template.html'),
            controller: modalAddSuccessController,
            controllerAs: 'vm',
            resolve: {
              payload: () => {
                return {
                  isBatch: false,
                };
              },
            },
          });
        });
    });
  }

  matchAttr(item) {
    const shopId = this.$location.hash();
    this.dataService
      .youzan_product_getProduct({ shopId, id: item.id })
      .then(res => {
        const curItem = res.data;
        const modalInstance = this.$uibModal.open({
          animation: true,
          size: 'sm',
          backdrop: 'static',
          template: require('../modal/modal-match-attr.template.html'),
          controller: modalMatchAttrController,
          controllerAs: 'vm',
          resolve: {
            item: () => curItem,
          },
        });

        return modalInstance.result.then((attrMap: any) => {
          const shopId = this.$location.hash();
          this.dataService
            .youzan_product_updateProductAttr({
              shopId,
              id: item.id,
              attrMap: JSON.stringify(attrMap),
            })
            .then(res => {})
            .finally(() => {
              this.$onInit();
            });
        });
      })
      .catch(err => {
        if (err && err.msg === '有赞店铺授权已经过期，请重新授权') {
          window.location.href = youzanConfig.authorize_url;
        }
      });
  }

  /**
   * 批量铺货
   */
  batchAdd() {
    const itemIds = Object.keys(_.pickBy(this.markedItem, v => v));
    if (!(itemIds.length > 0)) {
      return this.seeModal.confirmP('提示', '请先选择商品.');
    }
    if (itemIds.length == 0) {
      return;
    }
    for (let i = 0; i < itemIds.length; i++) {
      const id = +itemIds[i];
      // console.log(_.find(this.list, { itemId: id }));
      if (!(_.find(this.list, { itemId: id }).itemType > 0)) {
        this.seeModal.confirmP('提示', '请先设置品类');
        return;
      }
    }
    const shopId = this.$location.hash();
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../modal/modal-progress.template.html'),
      controller: modalProgressController,
      controllerAs: 'vm',
      resolve: {
        data: () => {
          return {
            /* 商铺id */
            shopId,
            itemIds,
            /* 类型 */
            type: '批量铺货',
          };
        },
      },
    });

    return modalInstance.result.then((params: any) => {
      this.$onInit();
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'md',
        backdrop: 'static',
        template: require('../modal/modal-add-success.template.html'),
        controller: modalAddSuccessController,
        controllerAs: 'vm',
        resolve: {
          payload: () => {
            return {
              result: params,
              isBatch: true,
            };
          },
        },
      });
      modalInstance.result.finally(() => {
        this.markedItem = {};
        this.markedId = {};
        this.markAll = false;
      });
    });
  }

  /**
   * 全店铺货
   */
  allAdd() {
    const shopId = this.$location.hash();
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../modal/modal-progress.template.html'),
      controller: modalProgressController,
      controllerAs: 'vm',
      resolve: {
        data: () => {
          return {
            /* 类型 */
            type: '全店铺货',
            /* 商铺id */
            shopId,
          };
        },
      },
    });

    return modalInstance.result.then((params: any) => {
      this.$onInit();
      const modalInstance = this.$uibModal.open({
        animation: true,
        size: 'md',
        backdrop: 'static',
        template: require('../modal/modal-add-success.template.html'),
        controller: modalAddSuccessController,
        controllerAs: 'vm',
        resolve: {
          payload: () => {
            return {
              result: params,
              isBatch: true,
            };
          },
        },
      });
      modalInstance.result.finally(() => {
        this.markedItem = {};
        this.markedId = {};
        this.markAll = false;
      });
    });
  }

  /**
   * 批量设置品类
   */
  batchUpdate() {
    const itemIds = Object.keys(_.pickBy(this.markedItem, v => v));
    if (!(itemIds.length > 0)) {
      return this.seeModal.confirmP('提示', '请先选择商品.');
    }
    this.selectClass().then(newClass => {
      const shopId = this.$location.hash();
      const selectedItems = _.pickBy(this.markedId, v => v);
      this.seeModal
        .confirmP(
          '设置品类',
          `<h4>你已将选中的${
            Object.keys(selectedItems).length
          }个商品的品类将设置为<br>
      <b>${newClass[0]['className']}</b> <br>
      确认进行该操作？</h4><h4>注意：商品一旦铺货后品类不可修改</h4>`,
          '确定',
          '取消',
        )
        .then(() => {
          const modalInstance = this.$uibModal.open({
            animation: true,
            size: 'sm',
            backdrop: 'static',
            template: require('../modal/modal-progress.template.html'),
            controller: modalProgressController,
            controllerAs: 'vm',
            resolve: {
              data: () => {
                return {
                  /* 类型 */
                  type: '批量设置品类',
                  /* 商铺id */
                  shopId,
                  itemIds: selectedItems,
                  newClass,
                };
              },
            },
          });

          return modalInstance.result.then((params: any) => {
            this.$onInit();
          });
        });
    });
  }

  jumpToGoods(item) {
    const hash = item.itemInsale ? '1' : '0';
    const params = { keyword: item.title, item_type: 1 };
    this.$window.open(
      '/goods/all?' + this.$httpParamSerializer(params) + '#' + hash,
    );
    /* this.$location
      .path('/goods/all')
      .search({ keyword: item.title, item_type: 1 })
      .hash(hash); */
  }

  private addShop: () => any = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'platform',
      backdrop: 'static',
      template: require('../modal/modal-authorize.template.html'),
      controller: modalAuthorizeController,
      controllerAs: 'vm',
    });

    return modalInstance.result.then(params => {
      this.$onInit();
    });
  };
}

export const goodsImportList: ng.IComponentOptions = {
  template: require('./list.template.html'),
  controller: Controller,
};
