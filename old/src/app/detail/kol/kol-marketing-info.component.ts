export class kolMarketingInfoController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService'];

  kol: Object;
  wechatId: string;

  constructor(
    private $q: ng.IQService,
    private dataService: see.IDataService,
  ) {}

  $onInit(): void {
    this.$q.all([
      this.getXDPInfo(),
    ]);
  }

  private getXDPInfo(): any {
    // this.kol = {"couponActivityCount": 0,
    // "grouponActivityCount": 0,
    // "seckillActivityCount": 0,
    // "xdpIcon": "string"}
    this.dataService.xiaodianpu_promotionActivityProfile({ kolId: +this.wechatId })
      .then(res => this.kol = res.data);
  }
}

export const kolMarketingInfo: ng.IComponentOptions = {
  template: require('./kol-marketing-info.template.html'),
  controller: kolMarketingInfoController,
  bindings: {
    wechatId: '<',
  },
};
