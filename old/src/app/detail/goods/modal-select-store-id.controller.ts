import { IDataService } from '../../services/data-service/data-service.interface';

export class modalSelectStoreIdController {
  filter_info: {
    keyword: string,
  } = {
    keyword: '',
  };
  bind_allot_list: Array<any>;
  unbind_allot_list: Array<any>;
  storage_sku_id: string;

  static $inject: string[] = ['$uibModalInstance', '$q', 'backend_id', 'sku_id', 'dataService'];
  constructor(
    private $uibModalInstance: any,
    private $q: ng.IQService,
    private backend_id: string,
    private sku_id: string,
    private dataService: IDataService,
  ) {
    const promises = [this.getAllotByBackendId()];
    $q.all(promises);
  }


  getAllotByBackendId() {
    return this.dataService.storage_getAllotByBackendId({
      backend_id: this.backend_id,
      sku_id: this.sku_id,
      filter_info: this.filter_info.keyword ? JSON.stringify(this.filter_info) : undefined,
    }).then(res => {
      this.bind_allot_list = res.data.bind_allot_list;
      this.storage_sku_id = this.bind_allot_list.length ? this.bind_allot_list[0].storage_sku_id : null;
      this.unbind_allot_list = res.data.unbind_allot_list;
    });
  }

  setStorageSkuId(index) {
    if (this.unbind_allot_list[index].is_checked) {
      const id = this.unbind_allot_list[index].storage_sku_id;
      this.storage_sku_id = id;
    } else {
      this.storage_sku_id = null;
    }

  }

  ok() {
    const list_storage_allot_id = this.unbind_allot_list
      .filter(item => item.is_checked)
      .map(item => item.storage_allot_id)
      .concat(this.bind_allot_list.map(item => item.storage_allot_id))
      .join(',');
    this.$uibModalInstance.close(list_storage_allot_id);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

}

