import { IDataService } from '../../services/data-service/data-service.interface';

export class storeItemController {
  goods: any;
  id: string;

  static $inject: string[] = ['$q', 'dataService'];

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
  ) { }

  $onChanges() {
    if (this.id) {
      const promises = [this.getGoodsInfo()];
      this.$q.all(promises);
    }
  }

  private getGoodsInfo() {
    return this.dataService.storage_spuGet({
      storage_spu_id: this.id,
      all: 0,
    }).then(res => {
      this.goods = res.data.spu_info;
    });
  }
}

export const storeItem: ng.IComponentOptions = {
  template: require('./store-item.template.html'),
  controller: storeItemController,
  bindings: {
    id: '=',
  },
};
