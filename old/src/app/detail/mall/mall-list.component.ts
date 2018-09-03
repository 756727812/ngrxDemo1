import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IKolService } from '../kol/kol.service';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class mallListController {
  private page: string;

  sync_list_items: Array<any>;
  sync_list_recommend: Array<any>;
  sync_choie_array: Array<any>;
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
    // 时间
    date_picker: {
      startDate: any,
      endDate: any,
    },
    keyword: string,
    keyword_article: string,
    // rank: string,
    // is_delegate: string,
    // platform_id:string,
    // from_type:string,
    // category: number,
    // order_change: string,
    kol_select: string,
    template_select: string,
    start_date: number,
    end_date: number,
    mall_online: string,
    mall_sync: string,
  };
  article_list: Array<any>;
  list_key: Array<any>;
  list_template: Array<any>;
  kol_list: Array<any>;
  trend_list: Array<any>;
  config_category: Array<any>;
  total_items: number;
  kol_all_list: any[];


  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', 'Upload', '$uibModal', 'mallService'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private Upload: any,
    private $uibModal: any,
    private mallService: any,
  ) { }

  $onInit() {
    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';
    this.hash = this.$location.hash() || '1';
    this.filter_info = {
      date_picker: {
        startDate: this.$routeParams['start_date'] ? moment(this.$routeParams['start_date'] * 1000) : null,
        endDate: this.$routeParams['end_date'] ? moment(this.$routeParams['end_date'] * 1000) : null,
      },
      keyword: this.$routeParams['keyword'],
      keyword_article: this.$routeParams['keyword_article'],
      // rank: this.$routeParams['rank'],
      // from_type: this.$routeParams['from_type'],
      // is_delegate: this.$routeParams['is_delegate'],
      // platform_id: this.$routeParams['platform_id'],
      // order_change: this.$routeParams['order_change'],
      kol_select: typeof this.$routeParams['kol_select'] == 'string' ? [this.$routeParams['kol_select']] : this.$routeParams['kol_select'],
      template_select: typeof this.$routeParams['template_select'] == 'string' ? [this.$routeParams['template_select']] : this.$routeParams['template_select'],
      // category: this.$routeParams['category'] ? +this.$routeParams['category'] : undefined,
      start_date: this.$routeParams['start_date'] ? this.$routeParams['start_date'] : null,
      end_date: this.$routeParams['end_date'] ? this.$routeParams['end_date'] : null,
      mall_online: this.$routeParams['mall_online'] ? this.$routeParams['mall_online'] : '-1',
      mall_sync: this.$routeParams['mall_sync'] ? this.$routeParams['mall_sync'] : '-1',
    };

    const promises = [this.getKeyList(), this.getKeyTemplate(), this.getConfigCategory(), this.getArticleListAll()];
    this.$q.all(promises);
  }

  private getKeyList() {
    return this.dataService.kol_mgr_keyList({}).then(res => {
      this.list_key = res.data.list_key;
      return this.list_key;
    });
  }

  private getKeyTemplate() {
    return this.dataService.mall_template_getFilterTemplateList({}).then(res => {
      this.list_template = res.data;
      return this.list_template;
    });
  }

  private getConfigCategory() {
    return this.dataService.kol_mgr_configCategory().then(res => {
      this.config_category = res.data;
      return this.config_category;
    });
  }

  private getArticleListAll(page_size = 20, show_article_type = -1) {
    const is_shop_list = 1;
    // if(this.hash === '6'){
    //   is_shop_list = 1;
    // }
    return this.dataService.mall_list_all({
      page: this.page,
      page_size,
      is_shop_list,
      show_article_type,
      start_date: this.filter_info.date_picker.startDate ? this.filter_info.date_picker.startDate.unix() : undefined,
      end_date: this.filter_info.date_picker.endDate ? this.filter_info.date_picker.endDate.unix() : undefined,
      filter_info: JSON.stringify(this.filter_info),
    }).then(res => {
      if (page_size === 20) this.total_items = res.data.count;
      this.article_list = res.data.list;
      return this.article_list;
    });
  }

  submitSearch: () => any = () => {
    this.$location.search({});
    this.filter_info.start_date = this.filter_info.date_picker.startDate ? this.filter_info.date_picker.startDate.unix() : undefined,
      this.filter_info.end_date = this.filter_info.date_picker.endDate ? this.filter_info.date_picker.endDate.unix() : undefined;
    this.$location.search(this.filter_info);
  }

  listSet(mall_id, title, mall_online, mall_sync) {
    this.mallService.listSet(mall_id, title, mall_online, mall_sync, () => this.getArticleListAll());
  }
}
export const mallList: ng.IComponentOptions = {
  template: require('./mall-list.template.html'),
  controller: mallListController,
};
