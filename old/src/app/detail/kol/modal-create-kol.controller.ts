import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalCreateKOLController {
  form_data: any;
  config_category: Array<any>;
  seller_list: Array<any>;
  kolOpStatusOptions = [];

  static $inject: string[] = ['$q', '$uibModalInstance', 'kol_id', 'wechat_id', 'wechat_name', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private kol_id: string,
    private wechat_id: string,
    private wechat_name: string,
    private dataService: IDataService,
  ) {
    this.form_data = {
      kol_name: this.wechat_name,
      weixin_id: this.wechat_id,
      operate_status: '3',
      rank:'3',
    };
    const promises = [this.getConfigCategory(), this.getConfigSellerList()];
    kol_id && promises.push(this.getKolById());

    this.dataService.kol_mgr_getKolOperateStatus().then(resp => {
      this.kolOpStatusOptions = resp.data || []
    })

    $q.all(promises);
  }

  ok: () => void = () => this.$uibModalInstance.close(this.form_data);

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

  private getKolById: () => ng.IPromise<any> = () =>
    this.dataService.kol_mgr_kolGet({
      kol_id: this.kol_id,
    }).then(res => {
      const {
          platform_id,
        kol_name,
        weixin_id,
        seller_email,
        rank,
        is_delegate,
        fans_count,
        category,
        kol_u_id,
        operate_status,
        } = res.data.kol_info;
      this.form_data = {
        kol_id: this.kol_id,
        platform_id,
        kol_name,
        weixin_id,
        seller_email,
        rank,
        is_delegate,
        kol_u_id,
        fans_count: +fans_count,
        category: +category,
        operate_status,
      };
      this.form_data.kol_u_id = Number(this.form_data.kol_u_id);
      return this.form_data;
    })

  private getConfigCategory: () => ng.IPromise<Array<any>> = () =>
    this.dataService.kol_mgr_configCategory().then(res => {
      this.config_category = res.data;
      return this.config_category;
    })

  private getConfigSellerList: () => ng.IPromise<Array<any>> = () =>
    this.dataService.kol_mgr_configSellerList().then(res => {
      this.seller_list = res.data.list_seller;
      return this.seller_list;
    })

}

