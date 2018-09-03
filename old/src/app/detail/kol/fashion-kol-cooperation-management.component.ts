import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IKolService } from './kol.service';
import * as angular from 'angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';

const version = +new Date();

export class fashionKolCooperationManagementController {
  private page: string;

  num_status_1: number;
  num_status_0: number;
  kol_status: string;
  article_status: string;
  sync_list_items: any[];
  sync_list_recommend: any[];
  sync_choie_array: any[];
  sync_count: number;
  sync_tip_error: string;
  sync_tip_choice: string;
  sync_tip_input_ids: string;
  sync_tip_input_recommend: string;
  sync_input_item_ids: string;
  sync_input_recommend_ids: string;
  sync_choice: string;

  hash: string;
  filter_info: {
    date_picker: {
      startDate: any;
      endDate: any;
    };
    keyword: string;
    keyword_article: string;
    rank: string;
    is_delegate: string;
    platform_id: string;
    from_type: string;
    category: number;
    order_change: string;
    is_kol_create: string;
    kol_select: string;
    start_date: number;
    end_date: number;
    rank_type: string;
    // status: string,
    article_status: string;
    operate_status: string;
  };
  article_list: any[];
  list_key: any[];
  kol_list: any[];
  trend_list: any[];
  config_category: any[];
  total_items: number;
  kol_all_list: any[];
  kolOpStatusOptions = [];

  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    'Upload',
    '$uibModal',
    'kolService',
    '$cookies',
  ];

  // kol状态 0-禁用,1-启用，2-未加入
  autoOperationStatus = {
    '0': '禁用',
    '1': '启用',
    '2': '未加入',
  };

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private Upload: any,
    private $uibModal: any,
    private kolService: IKolService,
    private $cookies: ng.cookies.ICookiesService,
  ) {}

  $onInit() {
    this.resetSync();

    this.num_status_1 = this.num_status_0 = 0;
    this.total_items = 0;
    this.kol_status = this.$routeParams['kol_status'] || '1';
    this.article_status = this.$routeParams['article_status'] || '1';
    this.page = this.$routeParams['page'] || '1';
    const user_code = this.$cookies.get('seller_privilege');
    const hash_num = user_code === '20' || user_code === '25' ? '1' : '2';
    this.hash = this.$location.hash() || hash_num;
    this.filter_info = {
      date_picker: {
        startDate: this.$routeParams['start_date']
          ? moment(this.$routeParams['start_date'] * 1000)
          : null,
        endDate: this.$routeParams['end_date']
          ? moment(this.$routeParams['end_date'] * 1000)
          : null,
      },
      keyword: this.$routeParams['keyword'],
      keyword_article: this.$routeParams['keyword_article'],
      rank: this.$routeParams['rank'],
      from_type: this.$routeParams['from_type'],
      is_delegate: this.$routeParams['is_delegate'],
      platform_id: this.$routeParams['platform_id'],
      is_kol_create: this.$routeParams['is_kol_create'] || '',
      order_change: this.$routeParams['order_change'],
      kol_select:
        typeof this.$routeParams['kol_select'] === 'string'
          ? [this.$routeParams['kol_select']]
          : this.$routeParams['kol_select'],
      category: this.$routeParams['category']
        ? +this.$routeParams['category']
        : undefined,
      start_date: this.$routeParams['start_date']
        ? this.$routeParams['start_date']
        : null,
      end_date: this.$routeParams['end_date']
        ? this.$routeParams['end_date']
        : null,
      rank_type: this.$routeParams['rank_type'],
      operate_status: this.$routeParams['operate_status'],
      // status: this.kol_status,
      article_status: this.article_status,
    };

    let promises: ng.IPromise<any>[];
    if (this.hash === '1') {
      promises = [
        this.getArticleListAll(),
        this.getConfigCategory(),
        this.getKeyList(),
      ];
    } else if (this.hash === '2') {
      promises = [
        this.getKolList(),
        this.getConfigCategory(),
        this.getKeyList(),
      ];
    } else if (this.hash === '6') {
      promises = [
        this.getArticleListAll(),
        this.getKolList(),
        this.getConfigCategory(),
        this.getKeyList(),
      ];
    } else if (this.hash === '3') {
      promises = [this.getTrendAllList(), this.getKeyList()];
    } else if (this.hash === '5') {
      promises = [this.getArticleListAll(100, 2)];
    } else {
      promises = [this.getKolFigureList()];
    }
    this.dataService.kol_mgr_getKolOperateStatus().then(resp => {
      this.kolOpStatusOptions = resp.data || [];
    });
    this.$q.all(promises);
  }

  selectTab: () => void = () => this.$location.search({});

  /************************ 批量同步店铺商品 begin **********************/
  isInArray(arr: any[], check: string) {
    if (!arr) {
      return false;
    }
    for (let i = 0; i < arr.length; i = i + 1) {
      if (Number(arr[i]) === Number(check)) {
        return true;
      }
    }
    return false;
  }

  choiceHotItem(type) {
    let cur_input = this.sync_input_item_ids;
    if (type === 2) {
      cur_input = this.sync_input_recommend_ids;
    }
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-hot-item.html'),
      controller: 'modalHotItemController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        cur_input: () => cur_input,
        kol_id: () => 0,
        wechat_id: () => '',
        wechat_name: () => '',
      },
    });
    return modalInstance.result.then(params => {
      const list_choice = params.list_choice;
      if (type === 1) {
        let arr_ids = [];
        if (this.sync_input_item_ids !== '') {
          arr_ids = this.sync_input_item_ids.split(',');
        }
        for (let i = 0; i < list_choice.length; i = i + 1) {
          if (!this.isInArray(arr_ids, list_choice[i])) {
            arr_ids.push(list_choice[i]);
          }
        }
        this.sync_input_item_ids = arr_ids.join();
      } else if (type === 2) {
        let arr_recomend = [];
        if (this.sync_input_recommend_ids !== '') {
          arr_recomend = this.sync_input_recommend_ids.split(',');
        }
        for (let i = 0; i < list_choice.length; i = i + 1) {
          if (!this.isInArray(arr_recomend, list_choice[i])) {
            arr_recomend.push(list_choice[i]);
          }
        }
        this.sync_input_recommend_ids = arr_recomend.join();
      }

      // 刷新
      this.replaceInput(type);
    });
  }

  resetSync() {
    this.sync_list_items = [];
    this.sync_list_recommend = [];
    this.sync_choie_array = [];
    this.sync_count = 0;
    this.sync_tip_error = this.sync_tip_input_ids = this.sync_tip_input_recommend =
      '';
    this.sync_input_item_ids = this.sync_input_recommend_ids = '';
    this.sync_tip_choice = this.sync_choice = '';
  }

  replaceInput(type) {
    if (type === 1) {
      this.sync_tip_input_ids = '';
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\，/g, ',');
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\[/g, '');
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\]/g, '');
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\ /g, ',');
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\【/g, '');
      this.sync_input_item_ids = this.sync_input_item_ids.replace(/\】/g, '');

      // this.sync_list_items = [];
      if (this.sync_input_item_ids !== '') {
        this.dataService
          .collection_getItemList({ ids: this.sync_input_item_ids })
          .then(res => {
            this.sync_list_items = res.data;
          });
      } else {
        this.sync_list_items = [];
      }
    } else {
      this.sync_tip_input_recommend = '';
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\，/g,
        ',',
      );
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\[/g,
        '',
      );
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\]/g,
        '',
      );
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\ /g,
        ',',
      );
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\【/g,
        '',
      );
      this.sync_input_recommend_ids = this.sync_input_recommend_ids.replace(
        /\】/g,
        '',
      );

      // this.sync_list_recommend = [];
      if (this.sync_input_recommend_ids !== '') {
        this.dataService
          .collection_getItemList({ ids: this.sync_input_recommend_ids })
          .then(res => {
            this.sync_list_recommend = res.data;
          });
      } else {
        this.sync_list_recommend = [];
      }
    }
  }

  contains(arr, obj) {
    let i = arr.length;
    while ((i = i - 1)) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  }
  confirmSync() {
    let canDo = true;
    this.sync_tip_input_ids = this.sync_tip_choice = '';
    this.sync_tip_input_recommend = '';
    if (
      this.sync_input_item_ids === '' &&
      this.sync_input_recommend_ids === ''
    ) {
      this.sync_tip_input_ids = '请输入商品ID列表';
      this.sync_input_recommend_ids = '请输入推荐商品ID';
      canDo = false;
    }
    if (this.sync_choice === '') {
      this.sync_tip_choice = '请选择商城';
      canDo = false;
    }

    // 判断数据是否正确
    const arr_ids = this.sync_input_item_ids.split(',');
    const arr_rec = this.sync_input_recommend_ids.split(',');
    for (
      let i = 0;
      i < arr_ids.length &&
      this.sync_tip_input_ids !== '' &&
      this.sync_tip_input_ids === '';
      i = i + 1
    ) {
      if (!Number(arr_ids[i])) {
        this.sync_tip_input_ids = '商品输入格式错误，请检查';
        canDo = false;
        break;
      }
    }
    for (
      let i = 0;
      i < arr_rec.length &&
      this.sync_input_recommend_ids !== '' &&
      this.sync_input_recommend_ids === '';
      i = i + 1
    ) {
      if (!Number(arr_rec[i])) {
        this.sync_tip_input_recommend = '推荐商品输入格式错误，请检查';
        canDo = false;
        break;
      }
    }

    // 判断是否有商品不存在
    if (true) {
      for (
        let i = 0;
        i < this.sync_list_items.length && this.sync_tip_input_ids === '';
        i = i + 1
      ) {
        if (this.sync_list_items[i].item_info === false) {
          this.sync_tip_input_ids = '有部分商品不存在，请检查';
          canDo = false;
          break;
        }
      }

      for (
        let i = 0;
        i < this.sync_list_recommend.length &&
        this.sync_tip_input_recommend === '';
        i = i + 1
      ) {
        if (this.sync_list_recommend[i].item_info === false) {
          this.sync_tip_input_recommend = '有部分推荐商品不存在，请检查';
          canDo = false;
          break;
        }
      }
    }

    if (canDo === false) {
      return;
    }

    const param = {
      sync_info: JSON.stringify({
        ids_items: this.sync_input_item_ids,
        ids_recommend: this.sync_input_recommend_ids,
        shop_array: this.sync_choie_array,
      }),
    };
    // console.log(this.sync_input_item_ids,this.sync_input_recommend_ids,this.sync_choice)
    this.seeModal.confirm(
      '批量同步商城商品',
      '确认要同步商品到以下商城：' + this.sync_choice,
      () => {
        this.dataService.collection_syncShopItem(param).then(res => {
          this.resetSync();
          this.getArticleListAll(100, 2);
          this.Notification.success('批量同步商城商品成功');
        });
      },
    );
  }

  changeSyncChoice() {
    this.sync_choie_array = [];
    this.sync_tip_choice = '';
    this.sync_count = 0;
    this.sync_choice = '';
    // const self = this;
    angular.forEach(this.article_list, item => {
      if (item.isChecked === true) {
        if (this.sync_choice !== '') {
          this.sync_choice += '、';
        }
        this.sync_count = this.sync_count + 1;
        this.sync_choice += item.title + '[' + item.kol_name + ']';
        this.sync_choie_array.push({
          kol_id: item.kol_id,
          article_id: item.article_id,
          collection_id: item.collection_id,
        });
      }
    });
  }
  // 全选
  checkAll() {
    angular.forEach(this.article_list, item => {
      item.isChecked = true;
    });
    this.changeSyncChoice();
  }
  checkReverse() {
    angular.forEach(this.article_list, item => {
      item.isChecked = false;
    });
    this.changeSyncChoice();
  }
  /***** 批量同步店铺商品 end *****/

  changeKolStatus: (kol_id: string, status: number) => any = (
    kol_id,
    status,
  ) => {
    let title = '';
    if (status === 0) {
      title = '确认将KOL移到合作结束列表？';
    } else {
      title = '确认将KOL移到合作中列表？';
    }
    this.seeModal.confirm('确认提示', title, () => {
      return this.dataService
        .kol_mgr_kolStatus({
          kol_id,
          status,
        })
        .then(res => {
          this.Notification.success('设置成功！');
          return this.getKolList();
        });
    });
  };

  changeArticleStatus: (article_id: string, status: number) => any = (
    article_id,
    status,
  ) => {
    let title = '';
    if (status === 0) {
      title = '确认将文章移到未上线列表？';
    } else {
      title = '确认将文章移到上线中列表？';
    }
    this.seeModal.confirm('确认提示', title, () => {
      return this.dataService
        .kol_mgr_articleStatus({
          article_id,
          status,
        })
        .then(res => {
          this.Notification.success('设置成功！');
          return this.getArticleListAll();
        });
    });
  };

  kolStatusFilter(kol_status) {
    this.kol_status = kol_status;
    this.$location.search({ kol_status: this.kol_status });
  }

  articleStatusFilter(article_status) {
    this.article_status = article_status;
    this.$location.search({ article_status: this.article_status });
  }

  submitSearch: () => any = () => {
    this.$location.search({});
    if (this.hash === '1' || this.hash === '6') {
      (this.filter_info.start_date = this.filter_info.date_picker.startDate
        ? this.filter_info.date_picker.startDate.unix()
        : undefined),
        (this.filter_info.end_date = this.filter_info.date_picker.endDate
          ? this.filter_info.date_picker.endDate.unix()
          : undefined);
    }
    this.$location.search(this.filter_info);
  };

  importDelegateGoods(file) {
    file &&
      this.Upload.upload({
        url: 'api/kol_mgr/delegeteInport',
        data: { file },
      }).then(res => {
        if (res.data.result === 1) {
          this.Notification.success('导入代销商品成功！');
        }
      });
  }

  // 这个页面也可以编辑文章，暂时没提到services里面。
  /*
  editArticle(article_id) {
    let modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol-article.html'),
      controller: 'modalCreateKOLArticleController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        article_id: () => article_id,
        routeParams: () => this.$routeParams,
      }
    })
    return modalInstance.result.then(params => {
      return this.dataService.kol_mgr_articleSet({
        article_info: JSON.stringify(params)
      }).then(res => {
        this.Notification.success('文章编辑成功！')
        return this.getArticleListAll()
      })
    })
  }

  //这个页面也可以编辑文章，暂时没提到services里面。
  editArticleNew(article_id) {
    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: `detail/kol/modal-create-kol-article-new.html?v=${version}`,
      controller: 'modalCreateKOLArticleNewController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        article_id: () => article_id,
        routeParams: () => this.$routeParams,
      }
    })
    return modalInstance.result.then(params => {
      return this.dataService.kol_mgr_articleSet({
        article_info: JSON.stringify(params)
      }).then(res => {
        this.Notification.success('文章编辑成功！')
        return this.getArticleListAll()
      })
    })
  }
  */

  createKOL() {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol.html'),
      controller: 'modalCreateKOLController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_id: () => 0,
        wechat_id: () => '',
        wechat_name: () => '',
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .kol_mgr_kolAdd({
          kol_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('创建KOL成功！');
          return this.getKolList();
        });
    });
  }

  editKol(id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-create-kol.html'),
      controller: 'modalCreateKOLController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_id() {
          return id;
        },
        wechat_id: () => '',
        wechat_name: () => '',
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .kol_mgr_kolSet({
          kol_info: JSON.stringify(params),
        })
        .then(res => {
          this.Notification.success('编辑KOL成功！');
          return this.getKolList();
        });
    });
  }

  setKolMall(kol_id, article_type) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-kol-selected.html'),
      controller: 'modalKOLSelectedController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        params() {
          return {
            kol_id,
            article_type,
          };
        },
      },
    });
    return modalInstance.result.then(params => {
      return this.dataService
        .kol_mgr_articleDefaultMall({
          kol_id: params.kol_id,
          article_id: params.article_id,
        })
        .then(res => {
          this.Notification.success('设置默认商城成功!');
          return this.getKolList();
        });
    });
  }

  exportKolAritcle() {
    let is_shop_list = 0;
    if (this.hash === '6') {
      is_shop_list = 1;
    }
    const param = {};
    let url =
      '/api/kol_mgr/exportArticleListAll?v=1&is_shop_list=' + is_shop_list;
    if (this.filter_info) {
      url = url + '&filter_info=' + JSON.stringify(this.filter_info);
    }
    window.open(url);
  }

  exportTrendAll() {
    const param = {};
    const url = '/api/kol_mgr/exportTrendAll';
    window.open(url);
  }

  syncStatus: (
    wechat_id: string,
    wechat_name: string,
    status: 1 | 0,
  ) => ng.IPromise<any> = (wechat_id, wechat_name, status) =>
    this.kolService.createKol(wechat_id, wechat_name).then(() =>
      this.dataService
        .da_portrait_list_status({
          status: ~~!status,
          wechat_ids: wechat_id,
          token: md5(
            `see${moment().format('YYYYMMDD')}${~~!status}${wechat_id}`,
          ),
        })
        .then(res => {
          this.Notification.success(`${status ? '取消' : ''}同步操作成功！`);
          return this.getKolFigureList();
        }),
    );

  refreshKolSelList(keyword) {
    if (!keyword) {
      return;
    }
    this.dataService
      .kol_mgr_keyListSearch({ keyword }) //
      .then(({ data }) => {
        this.list_key = data.list_key;
      });
  }

  private getKolFigureList: () => ng.IPromise<any> = () =>
    this.dataService
      .da_portrait_list_search({
        key: this.filter_info.keyword,
        page: this.page,
        page_size: 20,
        token: md5(
          `see${moment().format('YYYYMMDD')}${this.filter_info.keyword || ''}${
            this.page
          }20`,
        ),
      })
      .then(res => {
        this.kol_all_list = res.data.list;
        this.total_items = res.data.count;
        const offset = (~~this.page - 1) * 20;
        _.forEach(this.kol_all_list, (v, k) => {
          v.rank = offset + k + 1;
        });
        return this.kol_all_list;
      });

  private getArticleListAll(page_size = 20, show_article_type = -1) {
    let is_shop_list = 0;
    if (this.hash === '6') {
      is_shop_list = 1;
    }
    return this.dataService
      .kol_mgr_articleListAll({
        page_size,
        is_shop_list,
        show_article_type,
        page: this.page,
        start_date: this.filter_info.date_picker.startDate
          ? this.filter_info.date_picker.startDate.unix()
          : undefined,
        end_date: this.filter_info.date_picker.endDate
          ? this.filter_info.date_picker.endDate.unix()
          : undefined,
        filter_info: JSON.stringify(this.filter_info),
      })
      .then(res => {
        if (page_size === 20) this.total_items = res.data.count;
        this.article_list = res.data.list;
        this.num_status_0 = res.data.num_status_0;
        this.num_status_1 = res.data.num_status_1;
        return this.article_list;
      });
  }

  private getKolList() {
    return this.dataService
      .kol_mgr_kolList({
        page: this.page,
        page_size: 20,
        filter_info: JSON.stringify(this.filter_info),
      })
      .then(res => {
        this.total_items = res.data.count;
        this.kol_list = res.data.list;
        this.num_status_0 = res.data.num_status_0;
        this.num_status_1 = res.data.num_status_1;
        // console.log(this.kol_list);
        return this.kol_list;
      });
  }

  private getKeyList() {
    // 原来会获取所有 kol 列表用作前端静态搜索
    // 现在改成每次 remote 搜索
    return this.$q(resolve => resolve());
    // return this.dataService.kol_mgr_keyList({}).then(res => {
    //   this.list_key = res.data.list_key
    //   return this.list_key
    // })
  }

  private getTrendAllList() {
    return this.dataService
      .kol_mgr_trendAll({
        page: this.page,
        page_size: 20,
      })
      .then(res => {
        this.total_items = res.data.count;
        this.trend_list = res.data.list;
        return this.trend_list;
      });
  }

  private getConfigCategory() {
    return this.dataService.kol_mgr_configCategory().then(res => {
      this.config_category = res.data;
      return this.config_category;
    });
  }
}

export const fashionKolCooperationManagement: ng.IComponentOptions = {
  template: require('./fashion-kol-cooperation-management.template.html'),
  controller: fashionKolCooperationManagementController,
};
