import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;
// import './verificaiton-list.less'


export class verificationListController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  data: any;
  formData: {
    authType: number,
    identityCardFrontImgurl: string,
    identityCardBackImgurl: string,
    licenseImgUrl: string,
    subjectName?: string,
    legalPersonName?: string,
    identityNo?: string,
    licenseNo?: string,
  } = {
    authType: 1,
    identityCardFrontImgurl: '',
    identityCardBackImgurl: '',
    licenseImgUrl: '',
  };
  applyType: any;
  onLog: any;
  isReadonly: any;
  applyStatus: any;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any) {
  }

  $onInit() {
    this.getData();
  }

  getData() {
    if (this.applyStatus != 1) {
      return this.dataService.xiaodianpu_getDetailAuthInfo({}).then(res => {
        this.formData = res.data;
      });
    }

  }

  onUploadSuccess = (url, index) => {
    const imgType = ['identityCardFrontImgurl', 'identityCardBackImgurl', 'licenseImgUrl'];
    this.formData[imgType[index]] = url;
  }

  newBaseApply() {
    console.log(123);
    this.dataService.xiaodianpu_applyAuth(this.formData).then(res => {
      this.Notification.success('提交认证成功');
      this.backTo();
    });
  }
  backTo() {
    this.onLog && this.onLog('0');
  }
  changeType(index) {
    const that = this;
    if (this.formData.authType != index) {
      this.seeModal.confirm('提示', '确认放弃当前小电铺认证?', function () {
        that.formData = {
          ...that.formData,
          subjectName: '',
          legalPersonName: '',
          identityNo: '',
          identityCardFrontImgurl: '',
          identityCardBackImgurl: '',
          licenseImgUrl: '',
          licenseNo: '',
        };
        that.formData.authType = index;
      });
    }
  }
}

export const verificationList: ng.IComponentOptions = {
  template: require('./verification-list.template.html'),
  controller: verificationListController,
  bindings: {
    applyType: '<',
    onLog: '<',
    isReadonly: '<',
    applyStatus: '<',
  },
};

