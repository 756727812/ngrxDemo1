import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IKolService } from '../kol/kol.service';
import { IMallService } from './mall.service';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class mallTempDetailController {
  private page: string;
  total_items: number;
  hash: string;
  item_list: Array<any>;
  template_name: string;
  template_id: string;
  template_list: Array<any>;
  res: Object;

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
    private mallService: IMallService,
  ) { }

  $onInit() {
    this.template_name = this.$routeParams['template_name'];
    this.template_id = this.$routeParams['template_id'];
    this.page = this.$routeParams['page'] || '1';
    this.hash = this.$location.hash() || '1';


    const promises = [this.getMallListDetail()];
    this.$q.all(promises);
  }

  popSet(item_id) {
    this.mallService.popSet(Number(this.template_id), 0, Number(item_id));
  }

  private getMallListDetail(page_size = 20, show_article_type = -1) {
    let type = 0;
    if (this.hash === '2') {
      type = 1;
    }
    return this.dataService.mall_list_detail({
      page: this.page,
      page_size,
      type,
      template_id: this.template_id,
      // show_article_type:show_article_type,
      // start_date: this.filter_info.date_picker.startDate ? this.filter_info.date_picker.startDate.unix() : undefined,
      // end_date: this.filter_info.date_picker.endDate ? this.filter_info.date_picker.endDate.unix() : undefined,
      // filter_info: JSON.stringify(this.filter_info)
    }).then(res => {
      if (page_size === 20) this.total_items = res.data.count;
      this.res = res.data;
      this.template_list = res.data.list;
      return this.template_list;
    });
  }

  selectGoods() {
    this.mallService.selectGoods(Number(this.template_id), 0, 0, 0);
  }


  hideItem2: (template_id: string, mall_id: string, item_id: string, is_hide: string, title: string) => any = (template_id, mall_id, item_id, is_hide, title) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService.mall_template_itemSyncHide({
        template_id,
        mall_id,
        item_id,
        hide: is_hide,
      }).then(res => {
        this.Notification.success(title + '成功！');
        return this.getMallListDetail();
      });
    })

  recommendItem: (template_id: string, mall_id: string, item_id: string, tag_recommend: string, title: string) => any = (template_id, mall_id, item_id, tag_recommend, title) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService.mall_template_itemSyncRecommend({
        template_id,
        mall_id,
        item_id,
        recommend: tag_recommend,
      }).then(res => {
        this.Notification.success(title + '成功！');
        return this.getMallListDetail();
      });
    })

  deleteItem: (template_id: string, mall_id: string, item_id: string, is_delete: string, title: string) => any = (template_id, mall_id, item_id, is_delete, title) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService.mall_template_itemSyncDelete({
        template_id,
        mall_id,
        item_id,
        delete: is_delete,
      }).then(res => {
        this.Notification.success('删除成功！');
        return this.getMallListDetail();
      });
    })

  rankItem: (template_id: string, mall_id: string, item_id: string, rank: string, title: string) => any = (template_id, mall_id, item_id, rank, title) =>
    this.seeModal.confirm('确认提示', '确认' + title + '？', () => {
      return this.dataService.mall_template_itemSyncRank({
        template_id,
        mall_id,
        item_id,
        rank,
      }).then(res => {
        this.Notification.success(title + '成功！');
        return this.getMallListDetail();
      });
    })
}
export const mallTempDetail: ng.IComponentOptions = {
  template: require('./mall-temp-detail.template.html'),
  controller: mallTempDetailController,
};
