import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalCreateArticleChoiceItemsController {
  form_data: any
  cur_article: any
  list_item: any
  item_length: number
  //'show_edit'
  static $inject = ['$uibModalInstance', '$routeParams', 'list_article', 'kol_id', 'id', 'article_id', 'name', 'title', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    //private show_edit: string,
    private list_article: any,
    private kol_id: string,
    private id: string,
    private article_id: string,
    private name: string,
    private title: string,
    private dataService: IDataService
  ) {
    this.cur_article = '';
    this.form_data = {
      ids: '',
    }
    //show_edit = $routeParams['show_edit'] || '0' 
  }

  // 全选
  checkAll() {
    angular.forEach(this.list_item, function(item) {
      item.isChecked = true;
    })
  }
  checkReverse() {
    angular.forEach(this.list_item, function(item) {
      item.isChecked = !item.isChecked;
    })
  }

  changArticle() {
    this.list_item = [];
    this.item_length = 0;
    console.log(this.cur_article)
    if (this.cur_article == '') {
      return;
    }
    this.dataService.kol_mgr_itemList({
      page: 1,
      page_size: 50,
      kol_id: this.kol_id,
      block_pv_uv: 1,
      filter_info: JSON.stringify({
        to_article_id: this.article_id,
        keyword: '',
        begin_time: 0,
        end_time: 2147483647,
        article_id: this.cur_article.article_id,
      })
    }).then(res => {
      this.list_item = res.data.list;
      this.item_length = this.list_item.length;
    })
  }

  ok() {
    var ids = '';
    angular.forEach(this.list_item, function(item) {
      if (item.isChecked) {
        if (ids != '') {
          ids += ',';
        }
        ids += item.item_id;
      }
    })
    var param = {
      id: this.id,
      article_id: this.article_id,
      ids: ids,
    }
    this.$uibModalInstance.close(param);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

}


