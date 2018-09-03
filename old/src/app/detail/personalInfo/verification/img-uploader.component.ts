import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;


export class ImgUploaderController {

  static $inject: string[] = ['$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  pending: boolean;
  lastSuccess: boolean;
  onSuccess: Function;
  onFail: Function;
  imgSrc: string;
  upIndex: any;
  isReadonly: any;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
  ) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
    this.pending = false;
  }

  uploadCb(resp) {
    if (resp.result === 1) {
      this.onSuccess && this.onSuccess(resp.data, this.upIndex);
    } else {
      this.onFail && this.onFail(resp.data);
    }
    this.pending = false;
  }

  onChangeFile = () => {
    this.pending = true;
  }

  canUpload() {
    return !this.pending;
  }
}

export const verificationImgUploader: ng.IComponentOptions = {
  template: require('./img-uploader.template.html'),
  controller: ImgUploaderController,
  bindings: {
    onSuccess: '<',
    onFail: '<',
    imgSrc: '<',
    upIndex: '<',
    isReadonly: '<',
  },
};

