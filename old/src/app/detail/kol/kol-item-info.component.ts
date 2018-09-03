import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular';

class kolItemInfoController {
  id: number
  kol: any

  static $inject = ['dataService']
  constructor(
    private dataService: IDataService
  ) {
    this.getKolById()
  }

  private getKolById() {
    return this.dataService.kol_mgr_kolGet({
      kol_id: this.id
    }).then(res => {
      this.kol = res.data.kol_info
      return this.kol
    })
  }
}

export const kolItemInfo: ng.IComponentOptions = {
  template: require('./kol-item-info.template.html'),
  controller: kolItemInfoController,
  bindings: {
    id: '<'
  }
}
