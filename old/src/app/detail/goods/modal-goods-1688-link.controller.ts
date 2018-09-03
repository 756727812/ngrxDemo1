import { IDataService } from 'app/services/data-service/data-service.interface';

export class modalgoods1688LinkController {
  choice_brand: any;
  errors: Array<any>;
  category: {
    one: string,
    two: string,
    three: string,
  };
  isInvestor: boolean = ~~this.$cookies.get('seller_privilege') === 26;
  private choice_c2c: any;
  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'cur_id', 'list_c2c', 'list_class', 'list_brand', 'dataService', '$cookies', 'Notification'];
  constructor(
    private $scope: ng.IScope,
    private $q: ng.IQService,
    private $uibModalInstance: ng.ui.bootstrap.IModalInstanceService,
    private cur_id: any,
    private list_c2c: any,
    private list_class: any,
    private list_brand: any,
    private dataService: IDataService,
    private $cookies: ng.cookies.ICookiesService,
    private Notification: see.INotificationService,
  ) {
    //console.log(this.list_class);
    this.choice_c2c = {
      seller_id: '0',
      seller_email: '',
      seller_name: '',
    };
    this.choice_brand = {
      brand_id: '0',
      brand_name: '',
    };
    this.category = {
      one: undefined,
      two: undefined,
      three: undefined,
    };
  }

  ok: () => void = () => {
    this.errors = [];
    if (Number(this.choice_c2c.seller_id) == 0 || String(this.choice_c2c.seller_id) === 'undefined') {
      this.errors.push('请选择商户');
    }
    if (Number(this.choice_brand.brand_id) == 0 || String(this.choice_brand.brand_id) === 'undefined') {
      this.errors.push('请选择品牌');
    }
    if (this.category.three === '') {
      this.errors.push('请选择品类');
    }
    //console.log(this.choice_c2c.seller_id,this.choice_brand.brand_id,this.category.three)

    if (this.errors.length > 0) {
      return;
    } else {
      if (this.isInvestor) {
        this.Notification.warn('抱歉，您尚无相关权限');
        return;
      }
      const param = {
        id: this.cur_id,
        sellerId: this.choice_c2c.seller_id,
        classId: this.category.three,
        brandId: this.choice_brand.brand_id,
      };
      this.dataService.api_1688_cloudprod_mother_link(param).then(res => {
        let msg = '关联母商品成功';
        if (res.msg !== '') {
          msg = res.msg;
        }
        this.$uibModalInstance.close({ msg });
      });
    }
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

