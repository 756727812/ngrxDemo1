import * as moment from 'moment';
import { filter, forEach } from 'lodash';
import * as imagesLoaded from 'imagesloaded';
import * as Masonry from 'masonry-layout';

import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

import { DISTRIBUTE_MODAL_TYPE } from './distribute/list/list.component';

export class GoodsList implements ng.IComponentController {
  private sellerPrivilege = ~~this.$cookies.get('seller_privilege');
  private page: number;

  form_data: any;
  total_items: number;
  goods_list: any[] = [];
  country_list: any[];
  insale: string;
  hash: string;
  is_c2c: boolean;
  list_info: string;
  selected_class: any[];
  class_list: any[];
  curPath: string;
  b_get_list_success: boolean;
  b_get_searching: boolean;
  xdp_list: any;
  searchXdp: any;
  isAdmin = [7, 10].includes(this.sellerPrivilege);
  xdpIdList: any;
  searchSelect: any[];

  static $inject = [
    '$q',
    '$timeout',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$cookies',
    '$uibModal',
    '$scope',
    'goodsModalService',
    'goodsService',
  ];

  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $cookies: ng.cookies.ICookiesService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private $scope: ng.IScope,
    private goodsModalService: any,
    private goodsService: any,
  ) {
    this.b_get_list_success = false;
    this.b_get_searching = false;

    this.selected_class = [];
    this.class_list = [];
    this.is_c2c =
      $cookies.get('seller_privilege') === '1' ||
      $cookies.get('seller_privilege') === '30';
    this.hash = $location.hash() || '0'; // 母商品(hash=0), 子商品(hash=1)
    this.curPath = $location.path();
    this.page = $routeParams.page || 1;
    this.total_items = 0;
    this.list_info = '加载中...';
    this.form_data = {
      ship_country: $routeParams.ship_country,
      is_stored: $routeParams.is_stored || undefined,
      // is_cloud_item: $routeParams.is_cloud_item ? $routeParams.is_cloud_item : undefined,
      youzan_flag: $routeParams.youzan_flag
        ? $routeParams.youzan_flag
        : undefined,

      item_name: $routeParams.item_name,
      sku_mark: $routeParams.sku_mark,
      item_id: $routeParams.item_id,
      parent_item_id: $routeParams.parent_item_id,
      xdp_id_list: $routeParams.xdp_id_list,
      datePicker: {
        startDate: $routeParams.begin_time
          ? moment($routeParams.begin_time * 1000)
          : null,
        endDate: $routeParams.end_time
          ? moment($routeParams.end_time * 1000)
          : null,
      },
      searchSelectData: {
        selectedValue: $routeParams.selectedValue || 'item_name',
        inputValue: $routeParams.inputValue,
      },
    };

    this.searchSelect = [
      {
        label: '商品名称',
        value: 'item_name',
      },
      {
        label: '小电铺名称',
        value: 'app_title',
      },
      {
        label: '商户名',
        value: 'seller_name',
      },
    ];

    if (
      $routeParams['item_name'] ||
      $routeParams['begin_time'] ||
      $routeParams['item_id'] ||
      $routeParams['sku_mark']
    ) {
      this.b_get_searching = true;
    }
  }

  $onInit() {
    this.dataService.checkShopStatus({
      url: this.$location.path(),
      status: 'check_update',
    });

    const promises = [
      this.getClass2Tree(),
      this.getItemList(),
      this.getConfigLocation(),
      this.getXdpList(),
    ];
    this.$q.all(promises).then(() => {
      if (this.$routeParams.xdp_id) {
        this.searchXdp = this.xdp_list.find(e => {
          return +e.xdp_id === +this.$routeParams.xdp_id;
        });
      }
    });

    this.$scope.$on('imagesLoaded:loaded', (event, element) => {
      imagesLoaded('.grid', () => {
        const msnry = new Masonry('.grid', {
          itemSelector: '.grid-item',
          percentPosition: true,
          columnWidth: '.grid-sizer',
        });
        $('.grid').css('opacity', 1);
        $('.page-spinner-loader').addClass('hide');
      });
    });
  }

  submitSearch: () => any = () => {
    if (this.searchXdp) {
      this.form_data.xdp_id = this.searchXdp.xdp_id;
    }
    if (this.form_data.xdp_id_list) {
      this.form_data.xdp_id_list = this.form_data.xdp_id_list.replace(
        /，/gi,
        ',',
      );
    }
    const selectItem = {};
    selectItem['searchSelectData'] = undefined;
    if (this.hash === '0') {
      selectItem[
        'selectedValue'
      ] = this.form_data.searchSelectData.selectedValue;
      selectItem['inputValue'] = this.form_data.searchSelectData.inputValue;
    }
    this.$location.search({
      ...this.$location.search(),
      ...this.form_data,
      page: 1,
      tmp_class_id:
        (this.selected_class.length &&
          JSON.stringify(this.selected_class.map(o => o.class_id))) ||
        undefined,
      datePicker: undefined,
      begin_time: this.form_data.datePicker.startDate
        ? Date.parse(this.form_data.datePicker.startDate) / 1000
        : undefined,
      end_time: this.form_data.datePicker.endDate
        ? Date.parse(this.form_data.datePicker.endDate) / 1000
        : undefined,
      ...selectItem,
    });
  };

  selectTab: () => void = () => this.$location.search({});

  addToHotItem: () => ng.IPromise<any> = () => {
    const ida = this.selectedChanged();
    if (ida.length === 0) {
      this.Notification.warn('请勾选商品！');
      return;
    }
    const ids = ida.join(',');
    return this.dataService
      .data_api_materialAddItems({ ids, is_v2: 1 })
      .then(res => this.Notification.success('添加热门单品成功！'));
  };

  hideGoods: (item_id: string, hidden: string) => ng.IPromise<any> = (
    item_id,
    hidden,
  ) => {
    const title = String(hidden) === '0' ? '隐藏商品' : '显示商品';
    return this.seeModal.confirmP(title, '你确定吗?').then(() =>
      this.dataService
        .item_setHidden({
          item_id,
          hidden: +!+hidden,
        })
        .then(res => {
          this.Notification.success(title + '成功！');
          this.getItemList();
        }),
    );
  };

  applyDistribution: (any) => any = item => {
    if (!this.isAdmin && item.in_warehouse > 0) {
      // 囤货型先判断供货价和成本价关系，是否弹二次确认
      this.dataService
        .product_mgr_getProduct({
          item_id: item.item_id,
          class_id: item.class_id,
        })
        .then(res => {
          const product = res.data;
          let supplyPriceCheckFlag = 0;
          forEach(product.sku_list, v => {
            [v.supply_price, v.cost_price] = [v.cost_price, v.supply_price]; // hack. php接口的cost_price和supply_price含义反了
            if (v.supply_price < v.cost_price) {
              supplyPriceCheckFlag |= 1;
            }
            if (
              !(
                v.supply_price &&
                v.cost_price &&
                v.suggested_retail_price_from &&
                v.suggested_retail_price_to
              )
            ) {
              supplyPriceCheckFlag |= 2;
            }
          });
          if (supplyPriceCheckFlag & 2) {
            const URL = `/goods/posted/${product.item_info.class_id}/${
              product.item_info.item_id
            }?needClose=true`;
            this.seeModal.confirm(
              '提醒',
              '必填信息未填写完整，请完善',
              () => this.$location.path(URL),
              null,
              '现在编辑',
              '取消',
            );
            return this.$q.reject();
          }
          return supplyPriceCheckFlag & 1 ? true : false;
        })
        .then(supplyPriceCheckFlag => {
          if (supplyPriceCheckFlag) {
            return this.seeModal.confirmP(
              '提示',
              '该商品“供货价”比“成本价”低，会导致亏本售卖，确认当前操作吗？',
              '确定',
              '取消',
            );
          }
        })
        .then(() => {
          return this.dataService.cds_applyCommodityDistribution({
            itemId: item.item_id,
          });
        })
        .then(() => {
          return this.seeModal
            .confirmP('提示', '是否将该商品加入热门单品库?', '确认', '取消')
            .then(
              () => {
                return this.dataService
                  .data_api_materialAddItems({ ids: item.item_id, is_v2: 1 })
                  .then(res => this.Notification.success('添加热门单品成功！'));
              },
              () => {
                return this.$q.resolve();
              },
            );
        })
        .then(res => {
          this.seeModal.confirm(
            '提醒',
            '申请已提交，内部权限自动审核成功',
            null,
            null,
            '知道了',
            '',
          );
          this.$onInit();
        });
    } else {
      return this.goodsModalService
        .openDistrModal(item, DISTRIBUTE_MODAL_TYPE.APPLY)
        .then(params => {
          params['isCheckPrice'] = 0;
          this.dataService
            .cds_applyCommodityDistribution(params)
            .then(data => {
              if (this.is_c2c) {
                return this.$q.resolve(data.msg);
              }
              return this.seeModal
                .confirmP('提示', '是否将该商品加入热门单品库?', '确认', '取消')
                .then(
                  () => {
                    return this.dataService
                      .data_api_materialAddItems({
                        ids: item.item_id,
                        is_v2: 1,
                      })
                      .then(res =>
                        this.Notification.success('添加热门单品成功！'),
                      );
                  },
                  () => {
                    return this.$q.resolve();
                  },
                );
            })
            .then(data => {
              const warningMsg = this.is_c2c
                ? data
                : '申请已提交，内部权限自动审核成功';
              this.seeModal.confirm(
                '提醒',
                warningMsg,
                null,
                null,
                '知道了',
                '',
              );
              this.$onInit();
            });
        });
    }
  };

  getClass2Tree: () => ng.IPromise<any> = () =>
    this.dataService
      .item_class2List({
        only_on: 1,
        get_all: 1,
      })
      .then(res => {
        const data = res.data;
        const classList = [];
        const length = data.length;
        const temp = {};
        let i;
        let j;
        let k;

        forEach(data, o => {
          o.parent_id === '0' &&
            classList.push(Object.assign(o, { children: [] }));
        });
        const cllength = classList.length;
        for (i = 0; i < length; i += 1) {
          if (data[i].parent_id === '0') continue;
          for (j = 0; j < cllength; j += 1) {
            if (+data[i].parent_id === +classList[j].class_id) {
              classList[j].children.push(
                Object.assign(data[i], { children: [] }),
              );
              break;
            }
          }
        }
        let flag = true;

        for (i = 0; i < length; i += 1) {
          if (~data[i].class_path.indexOf(',')) {
            flag = true;
            for (j = 0; j < cllength; j += 1) {
              if (!flag) break;
              const templ = classList[j].children.length;
              for (k = 0; k < templ; k += 1) {
                if (+classList[j].children[k].class_id === +data[i].parent_id) {
                  classList[j].children[k].children.push(data[i]);
                  flag = false;
                  break;
                }
              }
            }
          }
        }
        this.class_list = classList;

        const tmp_class_id = this.$routeParams['tmp_class_id']
          ? JSON.parse(decodeURIComponent(this.$routeParams['tmp_class_id']))
          : [];
        tmp_class_id.length &&
          forEach(tmp_class_id, c1 => {
            forEach(this.class_list, c2 => {
              if (Number(c1) === Number(c2.class_id)) {
                this.selected_class.push(c2);
              }
            });
          });
      });

  // 显示选择品类的表
  toSelectClass: () => ng.IPromise<any> = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../datacenter/modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => this.selected_class,
        // 获取全部的列表
        class_list: () => this.class_list,
      },
    });

    return modalInstance.result.then((new_selected_class: any[]) => {
      this.selected_class = new_selected_class;
      this.submitSearch();
    });
  };

  // 在搜索中显示
  getSelectedClassName() {
    return this.selected_class.map(o => o.class_name).join(',');
  }

  onffItem: (
    item_id: string,
    item_insale: string,
    activity_status: number,
    seckill_status: number,
  ) => ng.IPromise<any> = (
    item_id,
    item_insale,
    activity_status,
    seckill_status,
  ) => {
    if (item_insale === '1' && activity_status === 2) {
      // 拼团中的商品执行下架操作
      this.Notification.warn(
        '该商品已配置了待开始或者正在进行中的拼团活动，可先联系 SEE 研发使活动失效再下架',
      );
      return;
    }
    if (item_insale === '1' && (seckill_status === 1 || seckill_status === 2)) {
      // 秒杀中的商品执行下架操作
      this.Notification.warn(
        '该商品已配置了待开始或正在进行中的促销活动，请先使活动失效后再下架',
      );
      return;
    }
    const title = item_insale === '1' ? '下架商品' : '上架商品';

    return this.seeModal
      .confirmP(
        title,
        item_insale === '1'
          ? require('./distribute/list/off-item-warning.html')
          : '确认要上架该商品吗？',
      )
      .then(
        () =>
          item_insale === '1'
            ? this.dataService.item_deleteItem({ item_id }).then(res => {
                this.Notification.success('下架商品成功！');
                this.getItemList();
              })
            : this.dataService.item_readyToSell({ item_id }).then(res => {
                this.Notification.success('上架商品成功！');
                this.getItemList();
              }),
      );
  };

  selectedChanged: () => string[] = () =>
    filter(this.goods_list, 'is_checked').map(item => item.item_id);

  private getConfigLocation: () => ng.IPromise<any> = () =>
    this.dataService
      .CommonData_getConfigLocation()
      .then(res => (this.country_list = res.data));

  private getXdpList: () => ng.IPromise<any> = () => {
    return this.dataService.user_getXdpList().then(res => {
      this.xdp_list = res.data;
    });
  };
  private readyToSell: () => ng.IPromise<any> = () => {
    const item_id_list = this.selectedChanged().toString();
    if (!item_id_list) {
      this.Notification.warn('请勾选商品！');
      return;
    }
    return this.seeModal
      .confirmP('批量上架', '确认要上架这些商品么？')
      .then(() =>
        this.dataService.batch_readyToSell({ item_id_list }).then(res => {
          const msg = res.msg;
          if (msg.includes('上架失败')) {
            this.Notification.warn(msg, true);
          } else {
            this.Notification.success('上架商品成功！');
            this.getItemList();
          }
        }),
      );
  };
  private getItemList: () => ng.IPromise<any> = () => {
    let class_ids: string = '';
    if (this.$routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(
        decodeURIComponent(this.$routeParams['tmp_class_id']),
      );
      forEach(tmp_class_id, c2 => {
        if (class_ids === '') {
          class_ids += Number(c2);
        } else {
          class_ids += ',' + Number(c2);
        }
      });
    }

    const selectItem = {};
    if (this.hash === '0') {
      selectItem[
        this.form_data.searchSelectData.selectedValue
      ] = this.form_data.searchSelectData.inputValue;
      selectItem['selectedValue'] = undefined;
      selectItem['inputValue'] = undefined;
    }
    return this.dataService
      .item_getItemList({
        ...this.$location.search(),
        class_ids,
        p: this.page,
        parent_id: this.$location.hash() || 0,
        item_insale: this.insale,
        ...selectItem,
      })
      .then(res => {
        $('.page-spinner-loader').removeClass('hide');
        forEach(
          res.data.data,
          item =>
            (item.item_created_at = moment(item.item_created_at).format(
              'YYYY-MM-DD',
            )),
        );
        this.goods_list = res.data.data;
        this.total_items = res.data.count;
        this.b_get_list_success = true;
      })
      .finally(() => (this.list_info = '暂时还没有数据哦！'));
  };
}

export const goodsList: ng.IComponentOptions = {
  template: require('./goods-list.template.html'),
  controller: GoodsList,
  bindings: {
    insale: '@',
  },
};
