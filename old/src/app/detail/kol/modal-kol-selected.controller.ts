import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalKOLSelectedController {
  mall_list: any;
  article_id: any;

  static $inject: string[] = ['$q', '$uibModalInstance', 'dataService', 'params'];
  constructor(
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private params: any,
  ) {
    console.log(params);
    this.getKeyListMallArticle();
    // kol_id && promises.push(this.getKolById())
  }

  // 获取列表
  getKeyListMallArticle: () => void = () => {
    this.dataService.kol_mgr_getKeyListMallArticle({
      kol_id: this.params.kol_id,
      article_type: this.params.article_type,
    }).then(res => {
      console.log(res);
      this.article_id = res.data.default_mall;
      this.mall_list = res.data.list;
    });
  }

  ok: () => void = () => this.$uibModalInstance.close({
    kol_id: this.params.kol_id,
    article_id: this.article_id,
  })

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}

