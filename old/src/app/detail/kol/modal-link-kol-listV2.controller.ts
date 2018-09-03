import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalLinkKolListController {
  mall_list: any;
  article_id: any;

  static $inject: string[] = [
    '$q',
    '$uibModalInstance',
    'dataService',
    'params',
    '$location',
  ];
  constructor(
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private dataService: IDataService,
    private params: any,
    private $location: ng.ILocationService,
  ) {
    console.log(params);
  }

  ok: () => void = () =>
    this.$uibModalInstance.close({
      kol_id: this.params.kol_id,
      article_id: this.article_id,
    });
  goToV2() {
    const cur_url =
      '/kol-v2/kol-cooperation-management/' + Number(this.params.kol_id);
    this.$location.url(cur_url + '?wechat_id=' + this.params.wechat_id);
    this.$uibModalInstance.dismiss('cancel');
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}
