import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateArticleAddItemsController {
  form_data: any
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'kol_id', 'id', 'article_id', 'name', 'title', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private kol_id: string,
    private id: string,
    private article_id: string,
    private name: string,
    private title: string,
    private dataService: IDataService
  ) {
    this.form_data = {
      ids: '',
    }

    //show_edit = $routeParams['show_edit'] || '0' 
  }

  ok() {
    var param = {
      id: this.id,
      article_id: this.article_id,
      ids: this.form_data.ids,
    }
    this.$uibModalInstance.close(param);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

}

