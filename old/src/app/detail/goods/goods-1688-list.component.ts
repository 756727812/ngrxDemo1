import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class goods1688ListController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal', '$cookies'];

  hash: string;

  total_items: number;
  list_item: Array<any>;

  status: number;
  filter_info: {
    name: string,
    oriId: string,
    kw: string,
  };
  keyword: null;
  list_brand: Array<any>;
  list_c2c: Array<any>;
  list_class: Array<any>;
  list_key: Array<any>;
  isInvestor: boolean = ~~this.$cookies.get('seller_privilege') === 26;

  private page: string;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private $cookies: ng.cookies.ICookiesService,
  ) {

    this.hash = this.$location.hash() || '1';

    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';
    if (this.hash === '1') {
      this.status = 1;
    } else if (this.hash === '2') {
      this.status = 0;
    }

    this.filter_info = {
      name: this.$routeParams['name'] || '',
      oriId: this.$routeParams['oriId'] || '',
      kw: this.$routeParams['kw'] || '',
    };
    if (this.filter_info.kw === '') {
      this.filter_info.kw = '全部';
    }

    let promises: ng.IPromise<any>[];
    promises = [this.getListKey(), this.getBrandList(), this.getClassList(), this.getC2cList(), this.getItemList1688()];
    this.$q.all(promises);

  }

  verifyPrivilege(event: Event): void {
    if (this.isInvestor) {
      event.preventDefault();
      this.Notification.warn('抱歉，您尚无相关权限');
    }
  }

  //同步/取消
  switchStatus(cur_id) {
    if (this.isInvestor) {
      this.Notification.warn('抱歉，您尚无相关权限');
      return;
    }
    let tips = '终止同步';
    if (this.status == 0) {
      tips = '开启同步';
    }
    this.seeModal.confirm('确认提示', '确认要' + tips + '?', () => {
      const param = {
        id: cur_id,
        status: this.status == 1 ? 0 : 1,
      };
      return this.dataService.api_1688_cloudprod_switchstatus(param).then(res => {
        this.Notification.success(tips + '成功');
        this.getItemList1688();
      });
    });
  }

  //关联商品
  linkParentItem(cur_id) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-goods-1688-link.html'),
      controller: 'modalgoods1688LinkController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        cur_id: () => cur_id,
        list_c2c: () => this.list_c2c,
        list_class: () => this.list_class,
        list_brand: () => this.list_brand,
      },
    });
    return modalInstance.result.then(params => {
      this.Notification.success(params.msg);
      return this.getItemList1688();
    });
  }

  //取消关联
  unlinkParentItem(cur_id) {
    if (this.isInvestor) {
      this.Notification.warn('抱歉，您尚无相关权限');
      return;
    }
    const tips = '取消关联';
    this.seeModal.confirm('确认提示', '确认要' + tips + '?', () => {
      const param = {
        id: cur_id,
      };
      return this.dataService.api_1688_cloudprod_mother_unlink(param).then(res => {
        this.Notification.success(tips + '成功');
        this.getItemList1688();
      });
    });
  }


  selectTab: () => void = () => this.$location.search({ page: 1 });

  submitSearch: () => any = () => {
    this.$location.search({
      page: 1,
      status: this.status,
      name: this.filter_info.name,
      oriId: this.filter_info.oriId,
      kw: this.filter_info.kw,
    });
  }

  private getListKey() {
    return this.dataService.api_1688_cloudprod_listKw({}).then(res => {
      this.list_key = [];
      this.list_key.push({ kw: '全部', v: -1 });
      const self = this;
      _.forEach(res.data, (v, i) => {
        self.list_key.push({
          kw: v,
          id: i,
        });
      });
      console.log(this.list_key);
    });
  }

  private getBrandList() {
    return this.dataService.item_getStandardBrandList().then(res => {
      this.list_brand = res.data;
    });
  }

  private getClassList() {
    return this.dataService.item_class2Tree({
      only_on: 1,
    }).then(res => {
      this.list_class = res.data;
    });
  }

  private getC2cList() {
    return this.dataService.user_getAllSeller().then(res => {
      this.list_c2c = res.data.list;
      _.forEach(this.list_c2c, (v, i) => {
        v.seller_name = v.seller_name + '(' + v.seller_email + ')';
      });
    });
  }

  private getItemList1688() {
    /*
    //测试
    this.list_item = [];
    for(var i=0;i<10;i++){
        var paramtt = {
          id:i,
          vendor:'卖家'+i,
          oriUrl:'http://baidu.com',
          searchKw:'测试'+i,
          tradeAmount:i,
          oriId:11+i,
          name:'商品名'+i,
          brand:'品牌'+i,
          totalStock:i,
          minWholesalePrice:i,
          maxWholesalePrice:i,
          minShipFee:i+10,
          maxShipFee:i+10+1,
          status:'同步中',
          seeProductId:'null',
          priceInfo:[{
            type:'spec',
            minPrice:i,
            maxPrice:i,
          },{
            type:'batch',
            minPrice:i+20,
            maxPrice:i+30,
          }],
          wholesalePriceInfo:[{
            type:'batch',
            minPrice:i,
            maxPrice:i+10,
          },{
            type:'spec',
            minPrice:i,
            maxPrice:i,
          }],
        }
        if(i%2 == 0){
          paramtt.seeProductId = String(i);
        }
        this.list_item.push(paramtt);
    }
    this.setListInfo();
    */

    const param = {
      page: this.page,
      page_size: 20,
      sortBy: 0,
      status: this.status,
      name: this.filter_info.name,
      oriId: this.filter_info.oriId,
      kw: this.filter_info.kw,
    };
    if (param.kw === '全部') {
      param.kw = '';
    }
    return this.dataService.api_1688_cloudprod_list(param).then(res => {
      this.list_item = res.data.list;
      this.total_items = res.data.count;
      this.setListInfo();

      return this.list_item;
    });
  }

  private setListInfo() {
    _.forEach(this.list_item, (v, i) => {
      if (String(v.seeProductId) === 'null' || Number(v.seeProductId) == 0) {
        v.seeProductId = 0;
      } else {
        v.seeProductId = Number(v.seeProductId);
      }
      if (Number(v.itemInsale) == 1) {
        v.goods_url = '/goods/posted?item_id=' + v.seeProductId;
      } else {
        v.goods_url = '/goods/Off?item_id=' + v.seeProductId;
      }
    });
  }

}
export const goods1688List: ng.IComponentOptions = {
  template: require('./goods-1688-list.template.html'),
  controller: goods1688ListController,
};
