type IFormData = {
  kolId: number,
  videoImgUrl: string,
  videoOriUrl: string,
};

export class ShopOperateVideoController implements ng.IComponentController {
  static $inject: string[] = [
    '$routeParams', '$cookies', 'dataService', 'Notification', 'seeModal', 'seeUpload',
  ];

  sellerPrivilege: string = this.$cookies.get('seller_privilege');
  isAdmin = this.sellerPrivilege === '7' || this.sellerPrivilege === '10'
              || this.sellerPrivilege === '25';
  wechatId: string = this.isAdmin ? (this.$routeParams['wechat_id'] || undefined) : undefined;
  formData: IFormData = {
    kolId: this.isAdmin ? (~~this.$routeParams['kolId'] || undefined) : undefined,
    videoImgUrl: undefined,
    videoOriUrl: undefined,
  };

  constructor(
    private $routeParams: ng.route.IRouteParamsService,
    private $cookies: ng.cookies.ICookiesService,
    private dataService: see.IDataService,
    private notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private seeUpload: see.ISeeUploadService,
  ) {}

  $onInit(): void {
    this.getVideoConfig();
  }

  uploadBanner: (file: File) => ng.IPromise<any> = file =>
    this.seeUpload.readImageData(file).then(data => {
      if (data.width === 700 && data.height === 300) {
        return this.seeUpload.uploadAuthImage(file)
          .then(res => this.formData.videoImgUrl = res.data);
      }
      return this.notification.warn('视频缩略图尺寸要求700X300');
    })

  save: () => void = () => {
    if (!!this.formData.videoImgUrl !== !!this.formData.videoImgUrl) {
      return;
    }
    this.saveVideoConfig(this.formData);
  }

  private saveVideoConfig: (formData: IFormData) => ng.IPromise<any> = formData =>
    this.dataService.xiaodianpu_configVideo(formData)
      .then(() => this.notification.success())

  private getVideoConfig: () => ng.IPromise<IFormData> = () =>
    this.dataService.xiaodianpu_configLastVideo({ kolId: this.formData.kolId })
      .then(({ data }) => this.formData = { ...this.formData, ...data })
}

export const ShopOperateVideo: ng.IComponentOptions = {
  template: require('./shop-operate-video.template.html'),
  controller: ShopOperateVideoController,
};
