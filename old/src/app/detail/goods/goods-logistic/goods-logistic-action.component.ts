import * as angular from 'angular';
import * as _ from 'lodash';;

export class goodsLogisticActionController implements ng.IComponentController {
  static $inject: string[] = [
    '$sce',
    '$q',
    '$cookies',
    '$routeParams',
    '$location',
    'Notification',
    'dataService',
    'seeModal',
    '$window',
    '$uibModal',
  ];

  private page = this.$routeParams.page || 1;
  private domestic_transport_list: any[];
  private international_transport_list: any[];
  private logistic_id = this.$routeParams.id;
  private page_from = this.$routeParams.page_from
    ? decodeURIComponent(this.$routeParams.page_from)
    : null;
  private sellerPrivilege = this.$cookies.get('seller_privilege');

  is_edit = this.$routeParams.logistics_type === 'edit';
  limit_classes = [
    {
      is_checked: false,
      category: [],
    },
  ];
  formData: {
    is_seego: number;
    charge_rule_type: string;
    free_mail_method: string;
    mail_type: string;
    promise_goods_time_e?: number;
    promise_goods_time_s?: number;
    tax_type?: number;
    free_mail_count?: number;
    kol_backend_id?;
    backend_id?;
    promise_goods_type?: number;
    province?: {
      [key: string]: boolean;
    };
    limit_class?;
    limit_ship_country?;
    ex_id?;
    ex_name?;
    ex_type?: number;
    ex_desc?;
    is_youzan?;
    transport_code?;
    charge_rule_param_1?: number;
    charge_rule_param_2?: number;
    charge_rule_param_3?: number;
    charge_rule_param_4?: number;
    limit_price?: number;
    limit_weight?: number;
    tax_prepay?: number;
    tax_rate?: number;
    is_need_idcard?: number;
    rule_list: {
      charge_rule_province: string;
      charge_rule_province_str?: string;
      charge_rule_param_1?: number;
      charge_rule_param_2?: number;
      charge_rule_param_3?: number;
      charge_rule_param_4?: number;
    }[];
  } = {
    is_seego: 1,
    charge_rule_type: '1',
    free_mail_method: '0',
    mail_type: '1',
    province: {},
    rule_list: [],
  };
  is_c2c = ['1', '30'].includes(this.sellerPrivilege);
  limit_ship_country_arr = [];
  errors = [];
  provinces = [];
  tooltip = this.$sce.trustAsHtml(
    '<p class="m-0">1.用户将在下单时给商品选择一条运费模版。为了方便用户理解，所有运费模版将不会显示名称，而仅显示类型；<br />2.你在给运费模版选择类型时，' +
      '建议选取最符合该路线服务特色的类型名称；<br />3.在发布/编辑商品时，你只能给每个商品提供最多三条路线，且每条路线需属于不同类型.</p>',
  );
  ex_type_list;
  class_tree;
  countryList;
  dates;
  is_free_mail;
  privilege_id;
  is_seego;
  seller_list_key;
  list_key;
  new_brand_list;
  provincesList: any[];

  constructor(
    private $sce: ng.ISCEService,
    private $q: ng.IQService,
    private $cookies: ng.cookies.ICookiesService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private Notification: see.INotificationService,
    private dataService: see.IDataService,
    private seeModal: see.ISeeModalService,
    private $window: ng.IWindowService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit(): void {
    const promises = [
      this.getConfigArea(),
      this.getExTypeList(),
      this.getTransportList(),
      this.getClass2Tree(),
      this.getLocationList(),
      this.getDates(),
    ];
    if (this.is_edit) {
      promises.push(this.getProvinseList());
    }
    this.$q.all(promises).then(() => {
      this.is_edit && this.getItem();
    });
  }

  changeLimitClass(index) {
    this.limit_classes[index].is_checked = !!this.limit_classes[index]
      .category[0];
  }

  openAddAreaModal(index = -1, currentProvincesStr = '') {
    this.$uibModal
      .open({
        size: 'lg',
        backdrop: 'static',
        component: 'modalGoodsLogisticAddAreas',
        resolve: {
          selectedProvinces: this.getSelectedProvinces.bind(this),
          currentProvinces: () => currentProvincesStr.split(','),
        },
      })
      .result.then(provinces => {
        if (provinces.length) {
          const provincesName = provinces.map(p => p.fullname).join(',');
          const provincesID = provinces.map(p => p.id).join(',');
          if (index === -1) {
            this.formData.rule_list.push({
              charge_rule_province: provincesID,
              charge_rule_province_str: provincesName,
            });
          } else {
            this.formData.rule_list[index].charge_rule_province = provincesID;
            this.formData.rule_list[
              index
            ].charge_rule_province_str = provincesName;
          }
        } else {
          if (index > -1 && Boolean(currentProvincesStr)) {
            this.formData.rule_list.splice(index, 1);
          }
        }
      })
      .catch(e => e);
  }

  removeThisAreas(index: number) {
    this.seeModal
      .confirmP('删除', '确认删除该区域？')
      .then(() => {
        this.formData.rule_list.splice(index, 1);
      })
      .catch(e => e);
  }

  isAreaFeesRequired(): boolean {
    return (
      this.getSelectedProvinces().length === 34 &&
      this.formData.rule_list.every(item => {
        return (
          !_.isNil(item.charge_rule_param_1) &&
          !_.isNil(item.charge_rule_param_2) &&
          !_.isNil(item.charge_rule_param_3) &&
          !_.isNil(item.charge_rule_param_4)
        );
      })
    );
  }

  clearPriceForm(): void {
    this.formData.rule_list.forEach(item => {
      item.charge_rule_param_1 = item.charge_rule_param_2 = item.charge_rule_param_3 = item.charge_rule_param_4 = undefined;
    });
  }

  showTransport(type) {
    return type === 4
      ? this.domestic_transport_list
      : this.international_transport_list;
  }

  getXDPList: (keyword: string) => ng.IPromise<any> = keyword =>
    this.dataService
      .user_getNewBrandUserList({ keyword, pageSize: 10 })
      .then(({ data }) => data);

  save() {
    this.errors.length = 0;
    if (typeof this.formData.tax_type === 'undefined') {
      this.errors.push('请选择是否包关税！');
    }
    if (this.is_free_mail && this.formData.free_mail_count <= 0) {
      this.errors.push('包邮详情必须>0 ！');
    }
    if (
      this.formData.free_mail_method === '2' &&
      !Number.isInteger(this.formData.free_mail_count)
    ) {
      this.errors.push('满件必须为正整数！');
    }
    if (!this.is_edit && !this.is_c2c) {
      if (typeof this.formData.is_seego === 'undefined') {
        this.errors.push('请选择路线所有者');
      }
      if (typeof this.formData.is_seego !== 'undefined') {
        if (
          !this.is_edit &&
          +this.formData.is_seego === 0 &&
          (typeof this.formData.kol_backend_id === 'undefined' ||
            ~~this.formData.kol_backend_id === 0)
        ) {
          this.errors.push('请选择指派的KOL账号');
        }
        if (
          !this.is_edit &&
          this.formData.is_seego === 3 &&
          _.isNil(this.formData.backend_id)
        ) {
          this.errors.push('请选择指派的小电铺账号');
        }
        if (
          typeof this.formData.free_mail_method === 'undefined' &&
          +this.formData.is_seego === 0
        ) {
          this.errors.push('请选择是否包邮！');
        }
        if (
          this.formData.free_mail_method !== '0' &&
          typeof this.formData.free_mail_count === 'undefined'
        ) {
          this.errors.push('请选择包邮详情！');
        }
        if (this.formData.is_seego === 1) {
          this.formData.kol_backend_id = 0;
        }
      }
    }
    const selectedProvinces = this.getSelectedProvinces();
    if (selectedProvinces.length < 34) {
      this.errors.push('请检查必填项！');
    }
    if (this.errors.length > 0) return;
    // 省份字段
    const provinces = Object.keys(this.formData.province).filter(
      name => this.formData.province[name],
    );

    const params = {
      ...this.formData,
      backend_id: this.formData.backend_id
        ? this.formData.backend_id.id
        : undefined,
      is_seego: this.is_c2c ? 0 : this.formData.is_seego,
      limit_price: this.formData.limit_price || '',
      limit_weight: this.formData.limit_weight || '',
      limit_class: this.getParameterClass(this.limit_classes),
      limit_ship_country:
        this.limit_ship_country_arr.length > 0
          ? this.limit_ship_country_arr.join(',')
          : '',
      rule_list: JSON.stringify(
        this.formData.rule_list.map(item =>
          _.omit(item, 'charge_rule_province_str'),
        ),
      ),
      free_mail_method: this.is_free_mail ? this.formData.free_mail_method : '',
      free_mail_count: this.is_free_mail ? this.formData.free_mail_count : '',
      province:
        this.is_free_mail && provinces.length > 0 ? provinces.join(',') : '',
    };
    if (this.is_edit) {
      /* 有赞运费模板需二次确认 */
      if (this.formData.is_youzan) {
        this.seeModal
          .confirmP(
            '提示',
            '该运费模板正在和有赞模板同步，若提交修改，将解除与有赞的同步关系，确认操作？',
            '确定',
            '取消',
          )
          .then(() => {
            return this.dataService.express_updateItem(params).then(res => {
              res.data.tips && this.seeModal.confirm('注意', res.data.tips);
              this.Notification.success('更新运费模版成功！');
              const cur_url = '/goods/logistics';
              this.$location.path(cur_url);
              return res.data;
            });
          });
      } else {
        return this.dataService.express_updateItem(params).then(res => {
          res.data.tips && this.seeModal.confirm('注意', res.data.tips);
          this.Notification.success('更新运费模版成功！');
          const cur_url = '/goods/logistics';
          this.$location.path(cur_url);
          return res.data;
        });
      }
    } else
      return this.dataService.express_newItem(params).then(res => {
        this.Notification.success('新建运费模版成功！');
        // 由发布商品跳转而来
        if (
          this.page_from !== null &&
          this.page_from.includes('goods') &&
          this.page_from.includes('publish')
        ) {
          this.$window.close();
        }
        if (this.page_from) {
          this.$location.url(this.page_from);
        } else {
          const cur_url = '/goods/logistics';
          this.$location.path(cur_url);
        }
        return res.data;
      });
  }

  private getSelectedProvinces(): string[] {
    return this.formData.rule_list.reduce((acc, item) => {
      const newAcc = [...acc, ...item.charge_rule_province.split(',')];
      return newAcc;
    }, []);
  }

  private getExTypeList() {
    return this.dataService.express_getExTypeList().then(res => {
      this.ex_type_list = res.data;
      return this.ex_type_list;
    });
  }

  private getTransportList() {
    return this.dataService.order_getTransportList().then(res => {
      this.domestic_transport_list = res.data.filter(
        o => +o.transport_type === 1 || +o.transport_type === 3,
      );
      this.international_transport_list = res.data.filter(
        o =>
          +o.transport_type === 2 ||
          +o.transport_type === 3 ||
          o.transport_code === 'beihai',
      );
      return [this.domestic_transport_list, this.international_transport_list];
    });
  }

  private getClass2Tree() {
    return this.dataService.item_class2Tree().then(res => {
      this.class_tree = res.data;
      return this.class_tree;
    });
  }

  private getLocationList() {
    this.dataService.CommonData_getConfigLocation().then(res => {
      this.countryList = res.data;
    });
  }

  private getDates() {
    this.dates = [];
    for (let i = 7; i <= 21; i += 1) this.dates.push(i);
    return this.$q.when(this.dates);
  }

  private changePromise() {
    this.formData.promise_goods_time_e = undefined;
    this.formData.promise_goods_time_s =
      this.formData.promise_goods_type === 1 ? 1 : undefined;
  }

  private getParameterClass(classes) {
    const r = [];
    angular.forEach(classes, (v, k) => {
      v.is_checked === true && r.push(_.last(v.category.filter(cat => !!cat)));
    });
    return r.join(',');
  }

  private getProvinseList(): ng.IPromise<any> {
    return this.dataService
      .express_getProvinseList()
      .then(({ data }) => (this.provincesList = data));
  }

  private getItem() {
    return this.dataService
      .express_getItem({
        ex_id: this.logistic_id,
      })
      .then(res => {
        const item = angular.copy(res.data);
        this.is_free_mail = item.free_mail_method > 0;
        this.formData = {
          ex_id: this.logistic_id,
          ex_name: item.ex_name,
          ex_type: +item.ex_type,
          ex_desc: item.ex_desc,
          mail_type: item.mail_type,
          transport_code: item.transport_code,
          charge_rule_type: item.charge_rule_type,
          limit_price: +item.limit_price ? +item.limit_price : undefined,
          limit_weight: +item.limit_weight ? +item.limit_weight : undefined,
          promise_goods_type: +item.promise_goods_type,
          promise_goods_time_s: +item.promise_goods_time_s,
          promise_goods_time_e: +item.promise_goods_time_e,
          tax_type: +item.tax_type,
          tax_prepay: +item.tax_prepay,
          tax_rate: +item.tax_rate,
          is_need_idcard: +item.is_need_idcard,
          is_seego: +item.is_seego,
          is_youzan: +item.is_youzan,
          free_mail_method: item.free_mail_method,
          free_mail_count: +item.free_mail_count,
          province: item.free_mail_exclude_province
            .split(',')
            .reduce((acc, val) => {
              acc[val] = true;
              return acc;
            }, {}),
          rule_list: item.rule_list.map(item => {
            item.charge_rule_param_1 = Number(item.charge_rule_param_1);
            item.charge_rule_param_2 = Number(item.charge_rule_param_2);
            item.charge_rule_param_3 = Number(item.charge_rule_param_3);
            item.charge_rule_param_4 = Number(item.charge_rule_param_4);
            item.charge_rule_province = item.charge_rule_province;
            item.charge_rule_province_str = item.charge_rule_province
              .split(',')
              .map(
                id => this.provincesList.filter(p => p.id === id)[0].fullname,
              )
              .join(',');
            return item;
          }),
          backend_id: {
            id: item.backend_id,
            seller_name: item.seller_name,
          },
        };
        this.limit_ship_country_arr = item.limit_ship_country
          ? item.limit_ship_country.split(',')
          : [];
        const limit_class_arr = item.limit_class
          ? item.limit_class.split(',')
          : [];
        limit_class_arr.length &&
          angular.forEach(limit_class_arr, (value, index) => {
            this.limit_classes[index] = {
              is_checked: true,
              category: this.getLimitClass(value),
            };
          });
        this.privilege_id = +item.privilege_id;
        this.is_seego = angular.copy(+item.is_seego);
        this.formData.is_seego = this.is_seego;
      });
  }

  private getLimitClass(id) {
    let class_arr = [];
    angular.forEach(this.class_tree, (v1, i1) => {
      i1 === id
        ? (class_arr = [v1.class_id])
        : angular.forEach(v1.children, (v2, i2) => {
            i2 === id
              ? (class_arr = [v1.class_id, v2.class_id])
              : angular.forEach(v2.children, (v3, i3) => {
                  i3 === id &&
                    (class_arr = [v1.class_id, v2.class_id, v3.class_id]);
                });
          });
    });
    return class_arr;
  }

  private getKeyList() {
    return this.dataService
      .user_getAllKOL()
      .then(res => (this.list_key = res.data.list_key));
  }

  private getSellerKeyList() {
    return this.dataService.user_getC2CUser().then(res => {
      this.seller_list_key = res.data;
    });
  }

  private getConfigArea() {
    this.dataService.CommonData_getConfigArea().then(res => {
      this.provinces = res.data.provinceList;
    });
  }
}

export const goodsLogisticAction: ng.IComponentOptions = {
  template: require('./goods-logistic-action.template.html'),
  controller: goodsLogisticActionController,
};
