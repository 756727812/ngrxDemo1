import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalImportGoodsController {
  cur_platform: string;
  formData: {
    platform: number,
    spu_ids: string,
    refresh: number,
    category: any,
    c2c_user: any,
    item_brand: any,
    url_get: string,
  };
  spu_ids: string;
  class_tree: Array<any>;
  category: Array<any>;
  brandList: Array<any>;
  c2c_list: Array<any>;

  check_param: any;
  tips_class: string;
  tips_brand: string;
  tips_url_get: string;
  tips_c2c: string;
  is_error: number;
  url_get: string;

  static $inject: string[] = ['$q', '$uibModalInstance', 'platforms', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private platforms: any,
    private dataService: IDataService,
  ) {
    this.check_param = 1;
    //console.log(platforms);
    this.url_get = '';
    this.tips_class = this.tips_c2c = this.tips_brand = this.tips_url_get = '';
    this.getConfigAdd();
    this.cur_platform = '10002';
  }

  ok() {
    this.is_error = 0;
    this.tips_c2c = this.tips_brand = this.tips_class = this.tips_url_get = '';
    if (this.cur_platform == '10001') {
      this.formData.spu_ids = this.spu_ids.split('\n').join(',');
      this.formData.refresh = 0;
      this.$uibModalInstance.close(this.formData);
    } else {
      this.formData.category = this.category;

      if (!this.formData.category || !this.formData.category.three || Number(this.formData.category.three) <= 0) {
        this.tips_class = '请选择品类'; this.is_error = 1;
      }
      if (!this.formData.c2c_user || Number(this.formData.c2c_user.id) <= 0) {
        this.tips_c2c = '请选择品牌'; this.is_error = 1;
      }
      if (!this.formData.item_brand || Number(this.formData.item_brand.brand_id) <= 0) {
        this.tips_brand = '请选择品牌'; this.is_error = 1;
      }
      if (!this.formData.url_get || this.formData.url_get === '') {
        this.tips_url_get = '请输入商品链接'; this.is_error = 1;
      }

      //        console.log(this.tips_class,this.tips_brand,this.tips_c2c)

      if (this.is_error) {
        return;
      }
      this.addItemWithPython(
        this.cur_platform,
        this.formData.category.three,
        this.formData.c2c_user.id,
        this.formData.c2c_user.seller_id,
        this.formData.url_get,
        this.formData.item_brand.brand_name,
      );
    }
  }

  addItemWithPython(platform, class_id, backend_id, seller_id, url_get, brand_name) {
    const parms = {
      check_param: this.check_param,
      class_id,
      backend_id,
      seller_id,
      url_get,
      platform,
      brand_name,
    };
    // console.log(parms)
    this.dataService.thired_api_addItemWithPython(parms).then(res => {
      this.formData.refresh = 1;
      this.$uibModalInstance.close(this.formData);
    });
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }


  getConfigAdd() {
    return this.dataService.thired_api_getConfigAdd({ id: 1 }).then(res => {
      this.brandList = res.data.list_brand;
      this.c2c_list = res.data.list_c2c;
      this.class_tree = res.data.list_class;
      const id = 0;
      angular.forEach(res.data, function (v1, i1) {
        if (i1 === id) {
          this.category.one = v1.class_id;
        }
        else {
          angular.forEach(v1.children, function (v2, i2) {
            if (i2 === id) {
              this.category.one = v1.class_id;
              this.category.two = v2.class_id;
            }
            else {
              angular.forEach(v2.children, function (v3, i3) {
                if (i3 === id) {
                  this.category.one = v1.class_id;
                  this.category.two = v2.class_id;
                  this.category.three = v3.class_id;
                }
              });
            }
          });
        }
      });

    });
  }



}



