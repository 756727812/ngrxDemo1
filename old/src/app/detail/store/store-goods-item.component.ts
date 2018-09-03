import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';
import * as _ from 'lodash';;

export class storeGoodsItemController {
  private id: string = this.$routeParams['id'];
  is_edit: boolean = this.id !== 'new';
  sku_detail: {
    color_list: Array<any>,
    size_list: Array<any>,
  } = {
    color_list: [],
    size_list: [],
  };
  sku_list: Array<any> = [];
  form_data: any = {};
  errors: string[] = [];

  static $inject: string[] = ['$scope', '$q', '$routeParams', '$location', 'dataService', 'seeUpload', 'Notification'];
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private seeUpload: ISeeUploadService,
    private Notification: INotificationService,
  ) {
    const $ctrl = this;
    const promises = this.is_edit ? [this.getSpu()] : [];

    $q.all(promises);

    !this.is_edit && this.$scope.$watch('$ctrl.sku_detail', (cur: any, prev: any) => {
      this.sku_list.length = 0;
      cur.color_list.length > 0 && cur.size_list.length > 0 &&
        _.forEach(cur.color_list, (v1, k1) => {
          _.forEach(cur.size_list, v2 => {
            v1.value && v1.value.trim() && v2.value && v2.value.trim() &&
              this.sku_list.push({
                storage_sku_id: 0,
                sku_imgurl: v1.sku_imgurl,
                color_value: v1.value.trim(),
                color_id: v1.id,
                size_value: v2.value.trim(),
                size_id: v2.id,
                is_public: 1,
              });
          });
        });
    },                                  true);
  }

  colorListAddOne() {
    if (this.sku_detail.color_list.length === 0 || _.last(this.sku_detail.color_list).value) {
      this.sku_detail.color_list.push({
        id: 0,
        value: '',
        sku_imgurl: '',
      });
    }
  }

  checkUniqueColor(index, value) {
    if (_.findIndex(this.sku_detail.color_list, ['value', value]) !== _.findLastIndex(this.sku_detail.color_list, ['value', value])) {
      this.Notification.warn(`颜色${value}已存在，请勿重复输入！`);
      this.sku_detail.color_list[index].value = '';
    }
  }

  sizeListAddOne() {
    if (this.sku_detail.size_list.length === 0 || _.last(this.sku_detail.size_list).value) {
      this.sku_detail.size_list.push({
        id: 0,
        value: '',
      });
    }
  }

  checkUniqueSize(index, value) {
    if (_.findIndex(this.sku_detail.size_list, ['value', value]) !== _.findLastIndex(this.sku_detail.size_list, ['value', value])) {
      this.Notification.warn(`尺码${value}已存在，请勿重复输入！`);
      this.sku_detail.size_list[index].value = '';
    }
  }

  uploadBanner(file) {
    file && this.seeUpload.uploadImage(file, data => {
      this.form_data.banner = data;
    });
  }

  uploadSkuImg(file, index) {
    file && this.seeUpload.uploadImage(file, data => {
      this.sku_detail.color_list[index].sku_imgurl = data;
    });
  }

  save() {
    this.errors.length = 0;
    this.sku_detail.color_list.length === 0 && this.errors.push('请至少输入一条颜色记录！');
    this.sku_detail.size_list.length === 0 && this.errors.push('请至少输入一条尺码/尺寸记录！');
    if (this.errors.length > 0) return -1;
    const params: any = _.assign({}, this.form_data, {
      list_color: this.sku_detail.color_list.map(o => o.value),
      list_size: this.sku_detail.size_list.map(o => o.value),
      sku_detail: this.sku_list,
      storage_spu_id: this.is_edit ? this.id : undefined,
    });
    _.forEach(params.sku_detail, v => {
      delete v.$$hashKey;
    });
    this.is_edit ?
      this.dataService.storage_spuSet({
        spu_info: JSON.stringify(params),
      }).then(res => {
        this.Notification.success('更新库存商品成功！');
        this.$location.path('/store/goods-list');
      }) :
      this.dataService.storage_spuAdd({
        spu_info: JSON.stringify(params),
      }).then(res => {
        this.Notification.success('创建库存商品成功！');
        this.$location.path('/store/goods-list');
      });
  }

  private getSpu() {
    return this.dataService.storage_spuGet({
      storage_spu_id: this.id,
      all: 1,
    }).then(res => {
      const data: any = res.data.spu_info;
      _.assign(this.form_data, {
        spu_name: data.spu_name,
        banner: data.banner,
        size_name: data.size_name,
        notes: data.notes,
      });
      this.getSkuDetail(data.sku_detail, data.list_color, data.list_size);
    });
  }

  private getSkuDetail(sku_detail, list_color, list_size) {
    // this.sku_list = sku_detail
    _.forEach(list_color, vc => {
      const ic = _.findIndex(sku_detail, ['color_value', vc]);
      const sku_detail_c = sku_detail[ic];
      this.sku_detail.color_list.push({
        id: sku_detail_c.color_id,
        value: vc,
        sku_imgurl: sku_detail_c.sku_imgurl,
      });
    });
    _.forEach(list_size, vs => {
      const is = _.findIndex(sku_detail, ['size_value', vs]);
      const sku_detail_s = sku_detail[is];
      this.sku_detail.size_list.push({
        id: sku_detail_s.size_id,
        value: vs,
      });
    });
    this.$scope.$watch('$ctrl.sku_detail', (cur: any, prev: any) => {
      this.sku_list.length = 0;
      cur.color_list.length > 0 && cur.size_list.length > 0 &&
        _.forEach(cur.color_list, v1 => {
          _.forEach(cur.size_list, v2 => {
            if (v1.value && v1.value.trim() && v2.value && v2.value.trim()) {
              const index = _.findIndex(sku_detail, { color_id: v1.id, size_id: v2.id });
              const sku_detail_item = sku_detail[index];
              this.sku_list.push({
                storage_sku_id: index > -1 ? sku_detail_item.storage_sku_id : 0,
                sku_imgurl: v1.sku_imgurl,
                color_value: v1.value.trim(),
                color_id: v1.id,
                size_value: v2.value.trim(),
                size_id: v2.id,
                is_public: 1,
              });
            }
          });
        });
    },                 true);
  }
}

export const storeGoodsItem: ng.IComponentOptions = {
  template: require('./store-goods-item.template.html'),
  controller: storeGoodsItemController,
};
