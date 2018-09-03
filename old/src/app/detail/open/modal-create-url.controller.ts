import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalcreateUrlController {
  private choice_kol: any;
  errors: Array<any>;
  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'info', 'source_id', 'list_kol', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private info: any,
    private source_id: any,
    private list_kol: any,
    private dataService: IDataService,
  ) {
    console.log(this.list_kol);
    this.choice_kol = {
      kol_id: '0',
      name: '',
    };
  }

  ok: () => void = () => {
    this.errors = [];
    if (Number(this.choice_kol.kol_id) == 0 || String(this.choice_kol.kol_id) === 'undefined') {
      this.errors.push('请选择KOL');
    }
    if (this.errors.length > 0) {
      return;
    } else {
      const param = {
        source_info: JSON.stringify(this.info),
        kol_id: this.choice_kol.kol_id,
        source_id: this.source_id,
      };
      this.dataService.xiaoe_e_get_distribution_url(param).then(res => {
        const msg = '创建分销地址成功';
        this.$uibModalInstance.close({ msg });
      });
    }
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

