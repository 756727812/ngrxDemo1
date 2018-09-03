import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalAddVirtualOrderController {
  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'info', 'is_edit', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private info: any,
    private is_edit: number,
    private dataService: IDataService,
  ) {

  }

  ok: () => void = () => {
    const msg = '创建分销地址成功';
    this.$uibModalInstance.close({ info: this.info });

  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

