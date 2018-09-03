import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalSuccessSyncCouponController {

  static $inject = ['$window', '$uibModalInstance', '$routeParams', 'from_params', 'num_kol', 'num_item', 'dataService']
  constructor(
    private $window: any,
    private $uibModalInstance: any,
    private $routeParams: any,
    private from_params: any,
    private num_kol: string,
    private num_item: string,

    private dataService: IDataService
  ) {

  }

  ok() {
    this.$uibModalInstance.close({});

    // this.$window.location.reload();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')

    this.$window.location.reload();
  }

}


