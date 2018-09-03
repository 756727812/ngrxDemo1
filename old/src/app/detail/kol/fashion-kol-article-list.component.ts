import { IDataService } from '../../services/data-service/data-service.interface';
const version = +new Date();

export class fashionKolArticleListController {
  private page = this.$routeParams['page'] || '1';

  kol_id: string = this.$routeParams['id'];
  article_id: string = this.$routeParams['article_id'];
  total_items: number;
  article: any;
  log_list: Array<any>;
  article_list: Array<any>;

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
  ) {
    const promises = [this.getArticleLogList(), this.getArticleInfo(), this.getArticleList()];
    $q.all(promises);
  }

  changeArticle(id) {
    const cur_url = `/kol/kol-cooperation-management/${this.kol_id}/${id}`;
    this.$location.path(cur_url);
  }

  private getArticleInfo() {
    return this.dataService.kol_mgr_articleGet({
      article_id: this.article_id,
    }).then(res => {
      this.article = res.data.article_info;
      return this.article;
    });
  }

  private getArticleLogList() {
    return this.dataService.kol_mgr_articleDailyDetail({
      page: this.page,
      page_size: 20,
      article_id: this.article_id,
    }).then(res => {
      this.total_items = res.data.count;
      this.log_list = res.data.list;
      return this.log_list;
    });
  }

  private getArticleList() {
    return this.dataService.kol_mgr_articleList({
      page_size: 999,
      kol_id: this.kol_id,
    }).then(res => {
      this.article_list = res.data.list;
      return this.article_list;
    });
  }
}

export const fashionKolArticleList: ng.IComponentOptions = {
  template: require('./fashion-kol-article-list.template.html'),
  controller: fashionKolArticleListController,
};
