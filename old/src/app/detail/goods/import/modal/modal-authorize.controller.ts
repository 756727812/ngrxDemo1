import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';

export class modalAuthorizeController {
  comment: any = '';
  authorize_url: string;
  platform: string;

  static $inject: string[] = [
    '$scope',
    '$q',
    'Notification',
    '$uibModalInstance',
    'dataService',
  ];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private Notification: INotificationService,
    private $uibModalInstance: any,
    private dataService: IDataService,
  ) {
    this.authorize_url = '';
    this.platform = 'youzan';
  }
  select: (item) => any = item => {
    this.platform = item;
  };
  ok: () => void = () => {
    switch (this.platform) {
      case 'youzan':
        const client_id = 'b5db21e87b2afad5d5';
        // const client_secret = 'fb0affc602f8993af33e29ad2febfa7'
        const redirect_uri = `${
          window.location.origin
        }/api/ng/youzan/authorization`;

        this.authorize_url = `https://open.youzan.com/oauth/authorize?client_id=${client_id}&response_type=code&state=teststate&redirect_uri=${redirect_uri}`;
        break;

      default:
        this.authorize_url = '';
        break;
    }
    window.location.href = this.authorize_url;
  };

  cancel: () => void = () => this.$uibModalInstance.close();
}
