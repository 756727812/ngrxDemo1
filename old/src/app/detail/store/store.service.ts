import { IDataService } from '../../services/data-service/data-service.interface';

export interface IStoreService {
  getConfig: () => ng.IPromise<any>;
}
export class storeService implements IStoreService {
  static $inject: string[] = ['dataService'];
  constructor(private dataService: IDataService) {
  }
  getConfig: () => ng.IPromise<any> = () =>
    this.dataService.storage_configGet().then(res => res.data.config_store)
}
