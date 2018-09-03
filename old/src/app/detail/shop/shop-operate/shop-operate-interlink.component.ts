type IFormData = {
  kolId: number,
  bannerImgUrl: string,
  xiaochengxuPath: string,
};

export class ShopOperateInterlinkController implements ng.IComponentController {
  static $inject: string[] = [
    '$routeParams', '$cookies', 'dataService', 'Notification', 'seeUpload',
  ];

  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = this.sellerPrivilege === '7' || this.sellerPrivilege === '10'
  || this.sellerPrivilege === '25';
  formData: IFormData = {
    kolId: this.isAdmin ? (~~this.$routeParams['kolId'] || undefined) : undefined,
    bannerImgUrl: undefined,
    xiaochengxuPath: undefined,
  };

  constructor(
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
    private seeUpload: see.ISeeUploadService,
  ) {}

  $onInit(): void {
    this.getInterlinkConfig();
  }

  uploadBanner: (file: File) => ng.IPromise<any> = file =>
    this.seeUpload.uploadAuthImage(file)
      .then(res => this.formData.bannerImgUrl = res.data)

  uploadWeAppCode: (file: File) => ng.IPromise<any> = file =>
    this.seeUpload.uploadAuthImage(file)
      .then(res => this.formData.xiaochengxuPath = res.data)

  save: () => void = () => {
    if (!!this.formData.bannerImgUrl !== !!this.formData.xiaochengxuPath) {
      return;
    }
    this.saveInterlinkConfig(this.formData);
  }

  private saveInterlinkConfig: (formData: IFormData) => ng.IPromise<any> = formData =>
    this.dataService.xiaodianpu_configShopUrl(formData)
      .then(() => this.notification.success())

  private getInterlinkConfig: () => ng.IPromise<IFormData> = () =>
    this.dataService.xiaodianpu_configLastShopUrl({ kolId: this.formData.kolId })
      .then(({ data }) => this.formData = { ...this.formData, ...data })
}

export const shopOperateInterlink: ng.IComponentOptions = {
  template: require('./shop-operate-interlink.template.html'),
  controller: ShopOperateInterlinkController,
};
