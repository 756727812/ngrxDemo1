import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateTemplateController {
  form_data: any
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'template_type', 'template_id', 'template_name', 'template_desc', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private template_type: string,
    private template_id: string,
    private template_name: string,
    private template_desc: string,
    private dataService: IDataService
  ) { }

  ok() {
    let param = {
      template_id: this.template_id,
      template_name: this.template_name,
      template_desc: this.template_desc,
    }
    this.$uibModalInstance.close(param);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

}

