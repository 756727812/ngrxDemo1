import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateCollectionCouponController {
  form_data: any
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'id', 'title', 'name', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private id: string,
    private title: string,
    private name: string,
    private dataService: IDataService
  ) {
    id && this.getCollectionById()
    //show_edit = $routeParams['show_edit'] || '0' 
  }

  ok() {
    this.$uibModalInstance.close(this.form_data);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  private getCollectionById() {
    this.dataService.collection_collectionGet({
      id: this.id
    }).then(res => {
      let {
          id,
        coupon_type_1,
        coupon_type_2,
        coupon_type_3,
        coupon_type_4,
        } = res.data.collection_info
      this.form_data = {
        id,
        coupon_type_1,
        coupon_type_2,
        coupon_type_3,
        coupon_type_4,
      }
    })
  }
}


