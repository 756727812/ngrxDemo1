import * as moment from 'moment';
import { forEach } from 'lodash';
import * as md5 from 'md5';

import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export class DatacenterGoodsController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    '$uibModal',
  ];

  order_id: string;
  str_export: string;

  search_form: {
    search: string;
    date_picker: {
      startDate: any;
      endDate: any;
    };
    min_price: number;
    max_price: number;
    location_id: string;
    brand: any;
    class_id: string[];
    class_type: string[];
  };
  item_list: Array<any>;
  total_items: number;
  config_location: Array<any>;
  brand_list: Array<any>;
  class_list: Array<any>;
  selected_class: Array<any> = [];

  private page: string;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {
    this.str_export = '';
    this.page = this.$routeParams['page'] || '1';
    this.order_id = this.$routeParams['order_id'] || '0';
    this.search_form = {
      search: this.$routeParams['search'],
      date_picker: {
        startDate: this.$routeParams['start_date']
          ? moment(this.$routeParams['start_date'] * 1000)
          : moment().subtract(1, 'days'),
        endDate: this.$routeParams['end_date']
          ? moment(this.$routeParams['end_date'] * 1000)
          : moment(),
      },
      min_price:
        this.$routeParams['min_price'] && +this.$routeParams['min_price'],
      max_price:
        this.$routeParams['max_price'] && +this.$routeParams['max_price'],
      location_id: this.$routeParams['location_id'],
      brand:
        this.$routeParams['brand'] &&
        JSON.parse(decodeURIComponent(this.$routeParams['brand'])),
      //
      class_id: this.$routeParams['class_id']
        ? JSON.parse(decodeURIComponent(this.$routeParams['class_id']))
        : [],
      class_type: this.$routeParams['class_type']
        ? JSON.parse(decodeURIComponent(this.$routeParams['class_type']))
        : [],
    };
  }

  $onInit() {
    const promises = [
      this.getConfigLocation(),
      this.getStandardBrandList(),
      this.getClass2Tree(),
      this.da_sentiment_item_select(),
    ];
    this.$q.all(promises).then(() => {
      this.search_form.class_id.length &&
        forEach(this.search_form.class_id, c1 => {
          forEach(this.class_list, c2 => {
            if (c1 === c2.class_id) this.selected_class.push(c2);
            else
              forEach(c2.children, c3 => {
                if (c1 === c3.class_id) this.selected_class.push(c3);
                else
                  forEach(c3.children, c4 => {
                    if (c1 === c4.class_id) this.selected_class.push(c4);
                  });
              });
          });
        });
    });
  }

  submitArticleSearch: () => void = () => {
    if (this.search_form.min_price > this.search_form.max_price) {
      const t = this.search_form.min_price;
      this.search_form.min_price = this.search_form.max_price;
      this.search_form.max_price = t;
    }
    // url
    this.$location.search(
      Object.assign({}, this.$location.search(), this.search_form, {
        start_date:
          this.search_form.date_picker.startDate &&
          this.search_form.date_picker.startDate.unix(),
        end_date:
          this.search_form.date_picker.endDate &&
          this.search_form.date_picker.endDate.unix(),
        brand: this.search_form.brand && JSON.stringify(this.search_form.brand),
        class_id:
          (this.selected_class.length &&
            JSON.stringify(this.selected_class.map(o => o.class_id))) ||
          undefined,
        class_type:
          (this.selected_class.length &&
            JSON.stringify(this.getChildrenClassId())) ||
          undefined,
        page: 1,
      }),
    );
  };

  changeOrder: (order_id: number) => void = order_id =>
    this.$location.search(
      Object.assign(this.$location.search(), {
        page: 1,
        order_id,
      }),
    );

  // 显示选择品类的表
  toSelectClass: () => ng.IPromise<any> = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('./modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => this.selected_class,
        // 获取全部的列表
        class_list: () => this.class_list,
      },
    });

    return modalInstance.result.then(
      (new_selected_class: any[]) => (this.selected_class = new_selected_class),
    );
  };

  // 在搜索中显示
  getSelectedClassName: () => string = () =>
    this.selected_class.map(o => o.class_name).join(',');

  getChildrenClassId: () => any = () => {
    const str = [];
    for (let i = 0; i < this.selected_class.length; i++) {
      if (this.selected_class[i].children) {
        if (this.selected_class[i].children[0].children) {
          str.push('1');
        } else {
          str.push('2');
        }
      } else {
        str.push('3');
      }
    }
    return str;
  };

  showDistributionData: (item_id: number) => void = item_id =>
    this.$uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalShowSubGoodsDistributionData',
      resolve: {
        item_id: () => item_id,
        min_day_id: () =>
          this.search_form.date_picker.startDate
            ? this.search_form.date_picker.startDate.format('YYYY-MM-DD')
            : undefined,
        max_day_id: () =>
          this.search_form.date_picker.endDate
            ? this.search_form.date_picker.endDate.format('YYYY-MM-DD')
            : undefined,
      },
    });

  private da_sentiment_item_select: (order_id?: number) => ng.IPromise<any> = (
    order_id = +this.order_id,
  ) => {
    const post_param = {
      ...this.search_form,
      min_day_id: this.search_form.date_picker.startDate
        ? this.search_form.date_picker.startDate.format('YYYY-MM-DD')
        : undefined,
      max_day_id: this.search_form.date_picker.endDate
        ? this.search_form.date_picker.endDate.format('YYYY-MM-DD')
        : undefined,
      brand_id: this.search_form.brand
        ? Object.keys(this.search_form.brand).length
          ? this.search_form.brand.brand_id
          : undefined
        : undefined,
      class_id: this.search_form.class_id.length
        ? this.search_form.class_id.join(',')
        : undefined,
      class_type: this.search_form.class_type.length
        ? this.search_form.class_type.join(',')
        : undefined,
      order_id,
      page: this.page,
      page_size: 20,
      token: md5(
        'see' +
          moment().format('YYYYMMDD') +
          (this.search_form.location_id || -1),
      ),
    };
    this.str_export = 'str_export=' + JSON.stringify(post_param);
    return this.dataService.da_sentiment_item_select(post_param).then(res => {
      this.item_list = res.data.list;
      this.total_items = res.data.count;
      return this.item_list;
    });
  };

  private getConfigLocation: () => ng.IPromise<any> = () =>
    this.dataService.CommonData_getConfigLocation().then(res => {
      this.config_location = res.data;
      return this.config_location;
    });

  private getStandardBrandList: () => ng.IPromise<any> = () =>
    this.dataService.item_getStandardBrandList().then(res => {
      this.brand_list = res.data;
      return this.brand_list;
    });

  private getClass2Tree: () => ng.IPromise<any> = () =>
    this.dataService
      .item_class2List({
        only_on: 1,
      })
      .then(res => {
        const data = res.data;
        let classList = [],
          length = data.length,
          temp = {},
          i,
          j,
          k;
        forEach(data, o => {
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
      });
}

export const datacenterGoods: ng.IComponentOptions = {
  template: require('./datacenter-goods.template.html'),
  controller: DatacenterGoodsController,
};
