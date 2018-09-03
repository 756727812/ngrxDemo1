import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalgoodsChangeStockController {

  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private dataService: IDataService,
  ) {

  }

  ok: () => void = () => {
    this.$uibModalInstance.close({});
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

