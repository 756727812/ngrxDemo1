import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class modalEditKOLItemPriceController {
  form_data: any

  static $inject = ['$uibModalInstance', 'id', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private id: string,
    private dataService: IDataService
  ) {
    this.getItemInfoById()
  }

  ok() {
    this.$uibModalInstance.close(this.form_data);
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  private getItemInfoById() {
    this.dataService.kol_mgr_itemInfo({
      id: this.id
    }).then(res => {
      let {
          ori_price,
        kol_price
        } = res.data.item_info
      this.form_data = {
        id: this.id,
        ori_price,
        kol_price
      }
    })
  }
}

