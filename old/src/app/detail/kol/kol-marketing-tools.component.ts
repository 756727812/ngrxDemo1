import './kol-marketing-tools.less';

type IKOLInfo = {
  seller_email: string;
};

export class KolMarketingToolsController implements ng.IComponentController {
  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService'];

  wechatId: string = this.$routeParams['wechat_id'];
  kolId: string = this.$routeParams['id'];
  kolInfo: IKOLInfo = {
    seller_email: '',
  };

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
  ) {}

  $onInit(): void {
    const promises: ng.IPromise<any>[] = [this.getKolInfo()];
    this.$q.all(promises);
  }

  private getKolInfo: () => ng.IPromise<IKOLInfo> = () =>
    this.dataService
      .kol_mgr_checkUserPri({ kol_id: this.kolId })
      .then(({ data }) => (this.kolInfo = data.kol_info));
}

export const KolMarketingTools: ng.IComponentOptions = {
  template: require('./kol-marketing-tools.template.html'),
  controller: KolMarketingToolsController,
};
