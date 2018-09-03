type IFormData = {
  fansGroupFlag: number;
  codeUrl: string;
  groupName: string;
};

export class LotteryGroupSettingController implements ng.IComponentController {
  static $inject: string[] = ['seeUpload', 'Notification', 'dataService'];

  formData: IFormData = {
    fansGroupFlag: 1,
    codeUrl: undefined,
    groupName: undefined,
  };

  constructor(
    private seeUpload: see.ISeeUploadService,
    private notification: see.INotificationService,
    private dataService: see.IDataService,
  ) {}

  $onInit(): void {
    this.getLotteryConfig();
  }

  uploadQRCode: (file: File) => ng.IPromise<string> = file =>
    this.seeUpload.uploadAuthImage(file)
      .then(res => this.formData.codeUrl = res.data)

  save: () => void = () => {
    if (!this.formData.codeUrl) {
      return 0;
    }
    this.setLotteryConfig();
  }

  private setLotteryConfig: () => ng.IPromise<any> = () =>
    this.dataService.groupon_activityLotteryConfig(this.formData)
      .then(() => this.notification.success())

  private getLotteryConfig: () => ng.IPromise<IFormData> = () =>
    this.dataService.groupon_activityLottery()
      .then(({ data }) => this.formData = data)

}

export const LotteryGroupSetting: ng.IComponentOptions = {
  template: require('./lottery-group-setting.template.html'),
  controller: LotteryGroupSettingController,
};
