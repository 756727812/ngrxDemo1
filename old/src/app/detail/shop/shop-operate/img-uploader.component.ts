import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;


export class ImgUploaderController {

  static $inject: string[] = [
    '$scope',
    '$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal'];

  pending: boolean;
  lastSuccess: boolean;
  onSuccess: Function;
  onFail: Function;
  imgSrc: string;
  previewSrc: string;
  ngModelCtrl: ng.INgModelController;
  dirty: boolean = false;

  constructor(
    private $scope: ng.IScope,
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

  getPreviewImg() {
    // 之前插件通过外部传 imgSrc 表示预览图片
    // 如果没有传则通过 ng-model 的值
    return this.previewSrc || this.imgSrc;
  }

  $onInit() {
    this.pending = false;
    if (this.ngModelCtrl) {
      if (this.ngModelCtrl.$modelValue) {
        this.previewSrc = this.ngModelCtrl.$modelValue;
      }
      this.$scope.$watch(
        () => this.ngModelCtrl.$modelValue,
        (newValue, oldValue, scope) => {
          this.previewSrc = newValue;
        });
    }
  }

  uploadCb(resp) {
    if (resp.result === 1) {
      this.onSuccess && this.onSuccess(resp.data);
      this.ngModelCtrl && this.ngModelCtrl.$setViewValue(resp.data);
    } else {
      this.onFail && this.onFail(resp.data);
    }
    this.pending = false;
  }

  onBeforeUpload = () => {
    this.pending = true;
    this.dirty = true;
  }

  canUpload() {
    return !this.pending;
  }
}

export const shopOperateImgUploader: ng.IComponentOptions = {
  template: require('./img-uploader.template.html'),
  controller: ImgUploaderController,
  require: {
    ngModelCtrl: '?ngModel',
  },
  bindings: {
    onSuccess: '<',
    onFail: '<',
    imgSrc: '<',
    dirty: '=',
  },
};

