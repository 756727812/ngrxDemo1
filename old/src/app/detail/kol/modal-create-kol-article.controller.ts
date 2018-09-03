import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateKOLArticleController {
  form_data: any
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'article_id', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private article_id: string,
    private dataService: IDataService
  ) {
    article_id && this.getArticleById()
    //show_edit = $routeParams['show_edit'] || '0' 
  }

  ok() {
    this.form_data.article_type = 0;
    this.form_data.start_time = Math.floor(+this.form_data.start_time / 1000)
    this.$uibModalInstance.close(this.form_data);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  private getArticleById() {
    this.dataService.kol_mgr_articleGet({
      article_id: this.article_id
    }).then(res => {
      let {
          kol_id,
        article_id,
        collection_id,
        floor_level,
        title,
        start_time,
        url,
        from_type,
        from_collection_id,
        act_order,
        act_gmv,
        } = res.data.article_info
      this.form_data = {
        kol_id,
        article_id,
        collection_id,
        floor_level,
        title,
        start_time: new Date(start_time * 1000),
        url,
        from_type,
        from_collection_id,
        act_order,
        act_gmv,
      }
    })
  }
}
