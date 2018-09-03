import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export class msgCenterController {

  private page: string;
  hash: string;

  total_items: number;
  list_kol_price: Array<any>;
  list_1688_price: Array<any>;


  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {

    this.hash = this.$location.hash() || '1';

    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';

    let promises: ng.IPromise<any>[];
    if (this.hash === '1') {
      promises = [this.getListAdjustPrice()];
    } else {
      promises = [this.getListAdjust1688()];
    }
    this.$q.all(promises);

  }

  private getListAdjustPrice() {
    const param = {
      page: this.page,
      page_size: 20,
    };

    return this.dataService.product_mgr_getPriceAdjustDetail(param).then(res => {
      this.list_kol_price = res.data.list;
      this.list_kol_price.forEach(function (v) {
        v['sku_pros'] = JSON.stringify(v['sku_pros']);
      });
      this.total_items = res.data.total_count;
      return this.list_kol_price;
    });
  }

  private getListAdjust1688() {
    /*
    //测试
    this.list_1688_price = [];
    for(var i=0;i<10;i++){
        var paramtt = {
          date:"2017-03-"+i+" 20:04:16",
          vendor:'卖家'+i,
          oriUrl:'http://m.seeapp.com',
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
          seeProductId:11,
          priceInfo:[{
            from:30,
            to:40,
            label:'测试规格1',
            type:"consignment",
          },{
            from:50,
            to:60,
            label:'测试规格2',
            type:"wholesale",
          }],
        }
        this.list_1688_price.push(paramtt);
    }
    */

    const param = {
      page: this.page,
      page_size: 20,
    };

    return this.dataService.api_1688_cloudprod_adjustprice(param).then(res => {
      this.list_1688_price = res.data.list;
      this.total_items = res.data.count;

      _.forEach(this.list_1688_price, (v, i) => {
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
      return this.list_1688_price;
    });
  }

  selectTab: () => void = () => this.$location.search({ page: 1 });


}
export const msgCenter: ng.IComponentOptions = {
  template: require('./msg-center.template.html'),
  controller: msgCenterController,
};
