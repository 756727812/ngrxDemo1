import * as moment from 'moment';
import * as _ from 'lodash';

import { DISTRIBUTE_MODAL_TYPE } from './distribute/list/list.component';
import { NzModalService } from 'ng-zorro-antd';
import { ModalLinksComponentV2 } from '../kol-v2/components/modal-links-v2-ng1/modal-links.component';
import './goods-all.less';

export class GoodsAllController implements ng.IComponentController {
  static $inject: string[] = [
    '$q',
    '$scope',
    'dataService',
    '$location',
    '$routeParams',
    'Notification',
    'seeModal',
    '$timeout',
    '$uibModal',
    'applicationService',
    '$cookies',
    "NzModalService"
  ];

  newBrandStatus: any = {};
  hash: string;
  formData = {
    // item_name: this.$routeParams.item_name,
    // sku_mark: this.$routeParams.sku_mark,
    // item_id: this.$routeParams.item_id,
    keyword: this.$routeParams.keyword,
    item_type: this.$routeParams.item_type || 1,
    datePicker: {
      startDate: this.$routeParams.begin_time
        ? moment(this.$routeParams.begin_time * 1000)
        : null,
      endDate: this.$routeParams.end_time
        ? moment(this.$routeParams.end_time * 1000)
        : null,
    },
  };
  selected_class: any[] = [];
  class_list: any[] = [];
  list_info: string = '加载中...';
  goods_list: any[];
  total_items: number = 0;
  is_start_watch_date = 0;
  b_get_list_success: boolean = false;
  tabs: any[];
  auth_info: any = {};
  listType: string = this.$routeParams.listType || 'list';
  selectOptions: any;
  private page: number = this.$routeParams.page || 1;
  datePickerOptions: any = {
    autoApply: true,
    eventHandlers: {
      'hide.daterangepicker': () => {
        this.submitSearch();
      },
    },
  };

  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private dataService: see.IDataService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $timeout: ng.ITimeoutService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private applicationService: any,
    private $cookies: ng.cookies.ICookiesService,
    private modalService: NzModalService
  ) {}

  $onInit() {
    let promises = [];
    if (this.$location.hash() === '2') {
      promises = [
        this.getMallClassKey(),
        this.checkNewBrandStatus(),
        this.getItemSelectOption(),
      ];
    } else {
      promises = [
        this.getClass2Tree(),
        this.checkNewBrandStatus(),
        this.getItemSelectOption(),
      ];
    }

    this.$q.all(promises).then(() => {
      // this.hash = this.$location.hash() || (this.newBrandStatus.type === 3 ? '1' : '2')
      this.hash = this.$location.hash() || '1';
      this.tabs = [
        {
          heading: '出售中',
          type: 1,
        },
        {
          heading: '仓库中',
          type: 0,
        },
      ];
      this.getGoodsList(this.hash);
      // this.watchDate()
      if (!this.$cookies.get('leadGoodsAll')) {
        this.showCover();
      }
    });
  }

  // 在搜索中显示
  getSelectedClassName() {
    return this.selected_class.map(o => o.class_name).join(',');
  }

  // 显示选择品类的Modal
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

  submitSearch: () => any = () => {
    this.$location.search({
      ...this.$location.search(),
      ...this.formData,
      page: 1,
      tmp_class_id:
        (this.selected_class.length &&
          JSON.stringify(this.selected_class.map(o => o.class_id))) ||
        undefined,
      datePicker: undefined,
      begin_time: this.formData.datePicker.startDate
        ? Date.parse(<any>this.formData.datePicker.startDate) / 1000
        : undefined,
      end_time: this.formData.datePicker.endDate
        ? Date.parse(<any>this.formData.datePicker.endDate) / 1000
        : undefined,
    });
  };

  selectTab: () => void = () => this.$location.search({});

  onffItem: (
    item_id: string,
    item_insale: string,
    group_status: number,
  ) => ng.IPromise<any> = (item_id, item_insale, group_status) => {
    const title = item_insale === '1' ? '下' : '上';
    if (item_insale === '1' && ~~group_status === 1) {
      this.Notification.warn(
        '该商品已配置了待开始或者正在进行中的拼团活动，可先联系 SEE 研发使活动失效再下架',
      );
      return;
    }
    return this.seeModal
      .confirmP(`${title}架商品`, `确认要${title}架该商品吗？`)
      .then(() => {
        const fnP = item_insale === '1' ? this.deleteItem : this.readyToSell;
        return fnP(item_id).then(() => {
          this.Notification.success(`${title}架商品成功！`);
          return this.getGoodsList(this.hash);
        });
      });
  };
  toPublish: () => any = () => {
    const that = this;
    this.dataService.xiaodianpu_getAuthResult({}).then(res => {
      this.auth_info = res.data;
      if (res.data.status == 3) {
        that.dataService.shop_checkCurrentStatus({}).then(res => {
          const data = res.data;
          if (Number(data.xdp_id) > 0 && Number(data.type) > 2) {
            that.$location.url('/goods/publish');
          } else {
            return that.promptMsg(2);
          }
        });
      } else if (res.data.status == 1) {
        return this.seeModal
          .confirmP(
            '小电铺认证',
            '小电铺相关功能需要认证后方可使用，快来认证吧',
            '小电铺认证',
            '',
          )
          .then(() => {
            this.$location.url('/personalInfo/account#4');
          });
      } else if (res.data.status == 2) {
        // 审核中
        return this.seeModal.confirmP(
          '小电铺认证',
          '认证审核中，请耐心等待',
          '',
          '',
        );
      } else if (res.data.status == 4) {
        // 认证失败
        return this.seeModal
          .confirmP(
            '小电铺认证',
            `小电铺认证未通过，原因如下：${res.data.rejectReason}`,
            '重新认证',
            '',
          )
          .then(() => {
            this.$location.url('/personalInfo/account#4');
          });
      } else {
        return false;
      }
    });
  };

  clearDate: () => any = () => {
    this.formData.datePicker = {
      startDate: null,
      endDate: null,
    };
    this.submitSearch();
  };

  changeView: (string) => any = type => {
    this.$location.search({
      ...this.$routeParams,
      listType: type,
    });
  };

  // copyUrl: (item: any) => ng.IPromise<any> = item => {
  //   const template = require('../kol/modal-copy-url.html');

  //   const list_url = [];
  //   console.log(item);
  //   if (item.item_link_conf.ori_url) {
  //     list_url.push({
  //       url: item.item_link_conf.ori_url,
  //       name: '原链接',
  //       is_png: 0,
  //       block_view: 0,
  //     });
  //   }
  //   if (item.item_link_conf.qrcode_url) {
  //     list_url.push({
  //       url: item.item_link_conf.qrcode_url,
  //       name: '二维码',
  //       is_png: 1,
  //       block_view: 0,
  //     });
  //   }
  //   if (item.item_link_conf.xdp_url) {
  //     list_url.push({
  //       url: item.item_link_conf.xdp_url,
  //       name: '小程序链接',
  //       is_png: 0,
  //       block_view: 0,
  //     });
  //   }

  //   const modalInstance = this.$uibModal.open({
  //     animation: true,
  //     template,
  //     controller: 'modalCopyUrlController',
  //     controllerAs: 'vm',
  //     backdrop: 'static',
  //     size: 'lg',
  //     resolve: {
  //       list_url: () => list_url,
  //       title: () => '商品链接配置',
  //     },
  //   });
  //   return modalInstance.result.then(params => {});
  // };

  copyUrl(item){
    this.dataService.shop_checkCurrentStatus().then(res=>{
      this.modalService.open({
      title: '商品链接',
      content: ModalLinksComponentV2,
      footer: false,
      maskClosable: false,
      width: 600,
      componentParams: {
        modalLink: {
          xdpId: res.data.xdp_id,
          type: 0,
          typeId: item.item_id,
          kolId: res.data.kol_id,
        },
      },
    });
    });

  }

  applyDistribution: (any) => any = item => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal/modal-distribution-info.html'),
      controller: 'modalDistributionInfoController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'lg',
      resolve: {
        item: () => item,
        modalType: () => DISTRIBUTE_MODAL_TYPE.APPLY,
      },
    });
    return modalInstance.result.then(params => {
      this.dataService.cds_applyCommodityDistribution(params).then(res => {
        this.seeModal.confirm(
          '提醒',
          res.msg,
          () => {
            this.$location.url('/goods/distribute/list');
          },
          null,
          '知道了',
          '',
        );
      });
    });
  };

  promptMsg: (number) => any = type => {
    switch (type) {
      case 1:
        this.seeModal.confirm(
          '提醒',
          '暂不支持分销商品的编辑，此功能将于近期版本上线哦。',
          null,
          null,
          '知道了',
          '',
        );
        break;
      case 2:
        this.seeModal.confirm(
          '提醒',
          '当前不支持此功能，请升级至专业版。',
          null,
          null,
          '知道了',
          '',
        );
        break;
    }
  };

  showCover() {
    setTimeout(() => {
      const that = this,
        elCover = document.getElementById('lead-cover'),
        elLGoodsSub = document.getElementById('lead_goods_sub'),
        elLGoodsSearch = document.getElementById('lead_goods_search');
      this.applicationService.coverGuide(
        elCover,
        elLGoodsSearch,
        '筛选自营和分销商品</br>让你一目了然',
        function() {
          $('.lead-cover,.lead-info')
            .removeAttr('style')
            .hide();
          that.applicationService.coverGuide(
            elCover,
            elLGoodsSub,
            '点击这里可以发布商品',
            function() {
              $('.lead-cover,.lead-info')
                .removeAttr('style')
                .hide();
              $('.lead-info').removeClass('lead_up');
              const expireDate = new Date();
              expireDate.setDate(expireDate.getDate() + 60);
              that.$cookies.put('leadGoodsAll', '1', { expires: expireDate });
            },
          );
          $('.lead-info')
            .css({
              left: 'initial',
              right: '10px',
              backgroundSize: '44px 60px',
              backgroundPosition: '70% 0',
            })
            .addClass('lead_up');
        },
      );
    }, 500);
  }

  private getMallClassKey: () => ng.IPromise<any> = () => {
    return this.dataService.mall_mallClassGetKey({}).then(res => {
      this.class_list = res.data;

      const tmp_class_id = this.$routeParams['tmp_class_id']
        ? JSON.parse(decodeURIComponent(this.$routeParams['tmp_class_id']))
        : [];
      tmp_class_id.length &&
        _.forEach(tmp_class_id, c1 => {
          _.forEach(this.class_list, c2 => {
            if (Number(c1) === Number(c2.class_id)) {
              this.selected_class.push(c2);
            }
          });
        });

      return this.class_list;
    });
  };

  private getItemSelectOption: () => ng.IPromise<any> = () => {
    return this.dataService.item_getItemSelectOption().then(res => {
      this.selectOptions = res.data;
    });
  };

  private deleteItem: (item_id: string) => ng.IPromise<any> = item_id =>
    this.dataService.item_deleteItem({ item_id });

  private readyToSell: (item_id: string) => ng.IPromise<any> = item_id =>
    this.dataService.item_readyToSell({ item_id });

  private checkNewBrandStatus: () => ng.IPromise<any> = () =>
    this.dataService.shop_checkCurrentStatus().then(({ data }) => {
      this.newBrandStatus = data;
      console.log(data);
    });

  private getGoodsList: (hash: string) => ng.IPromise<any> = hash => {
    let class_ids = '';
    if (this.$routeParams['tmp_class_id']) {
      const tmp_class_id = JSON.parse(
        decodeURIComponent(this.$routeParams['tmp_class_id']),
      );
      _.forEach(tmp_class_id, c2 => {
        if (class_ids === '') {
          class_ids += Number(c2);
        } else {
          class_ids += ',' + Number(c2);
        }
      });
    }
    // console.log(hash)
    // const fn = hash === '2' ? this.getDistributionItemList : this.getItemList
    const fn = this.getItemList;
    return fn(class_ids)
      .then(res => {
        _.forEach(
          res.data.data,
          item =>
            (item.item_created_at = moment(item.item_created_at).format(
              'YYYY-MM-DD',
            )),
        );
        this.goods_list = res.data.data;
        this.total_items = res.data.count;
        this.b_get_list_success = true;
        this.$timeout(() => {
          $('.page-spinner-loader').removeClass('hide');
          const $grid = (<any>$('.grid')).imagesLoaded(() => {
            $grid.masonry({
              itemSelector: '.grid-item',
              percentPosition: true,
              columnWidth: '.grid-sizer',
            });
            $('.grid').css('opacity', 1);
            $('.page-spinner-loader').addClass('hide');
          });
        });
      })
      .finally(
        () => (this.list_info = this.total_items ? '' : '暂时还没有数据哦！'),
      );
  };

  private getItemList: (class_ids: string) => ng.IPromise<any> = class_ids =>
    this.dataService.item_getItemList({
      ...this.$location.search(),
      p: this.page,
      item_insale: this.hash,
      class_ids,
    });

  private getDistributionItemList: (
    classIds: string,
  ) => ng.IPromise<any> = classIds =>
    this.dataService.item_getDistributionItemList({
      page: this.page,
      page_size: 20,
      filter_class_id: classIds,
      filter_info: JSON.stringify({
        // keyword_item_name: this.formData.item_name,
        // keyword_item_id: this.formData.item_id,
        // keyword_sku_mark: this.formData.sku_mark,
        keyword: this.formData.keyword,
        begin_time: this.$routeParams.begin_time || undefined,
        end_time: this.$routeParams.end_time || undefined,
      }),
    });

  private getClass2Tree: () => ng.IPromise<any> = () =>
    this.dataService
      .item_class2List({
        only_on: 1,
        get_all: 1,
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
          o.parent_id === '0' &&
            classList.push(Object.assign(o, { children: [] }));
        });
        const cllength = classList.length;
        for (i = 0; i < length; i++) {
          if (data[i].parent_id === '0') continue;
          for (j = 0; j < cllength; j++) {
            if (data[i].parent_id == classList[j].class_id) {
              classList[j].children.push(
                Object.assign(data[i], { children: [] }),
              );
              break;
            }
          }
        }
        let flag = true;

        for (i = 0; i < length; i++) {
          if (~data[i].class_path.indexOf(',')) {
            flag = true;
            for (j = 0; j < cllength; j++) {
              if (!flag) break;
              const templ = classList[j].children.length;
              for (k = 0; k < templ; k++) {
                if (classList[j].children[k].class_id == data[i].parent_id) {
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
          _.forEach(tmp_class_id, c1 => {
            _.forEach(this.class_list, c2 => {
              if (Number(c1) === Number(c2.class_id)) {
                this.selected_class.push(c2);
              }
            });
          });
      });
}

export const goodsAll: ng.IComponentOptions = {
  template: require('./goods-all.template.html'),
  controller: GoodsAllController,
};
