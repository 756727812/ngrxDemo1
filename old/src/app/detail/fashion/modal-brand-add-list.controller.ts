import { IDataService } from '../../services/data-service/data-service.interface';
export class modalBrandAddListController {
  form_data: any;

  static $inject: string[] = ['$q', '$uibModalInstance', 'kol_brand_id', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private kol_brand_id: string,
    private dataService: IDataService,
  ) {
    const promises = [];
    kol_brand_id && promises.push(this.materialBrandGet());
    $q.all(promises);
  }

  ok: () => void = () => this.$uibModalInstance.close(this.form_data);

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

  private materialBrandGet: () => ng.IPromise<any> = () =>
    this.dataService.data_api_materialBrandGet({
      kol_brand_id: this.kol_brand_id,
    }).then(res => {
      const {
        rank,
        kol_brand_banner,
        kol_brand_name,
        kol_brand_link,
        kol_brand_note,
      } = res.data.kol_brand_info;
      this.form_data = {
        kol_brand_id: this.kol_brand_id,
        rank,
        kol_brand_banner,
        kol_brand_name,
        kol_brand_link,
        kol_brand_note,
      };
      return this.form_data;
    })
}
