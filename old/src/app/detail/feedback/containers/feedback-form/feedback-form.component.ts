import * as angular from 'angular';

import { IDataService } from '../../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../../services/see-modal/see-modal.interface';
import { IAssertService } from '../../../../services/assert-service/assert.service.interface';
export class FeedbackFormController {
  static $inject: string[] = [
    '$scope',
    '$compile',
    '$window',
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  formData = {
    feedbackFrom: 2,
    kolId: undefined,
    backendId: undefined,
    feedbackPhone: '',
    feedbackContent: '',
  };

  isDisableSubmit: boolean = false;
  timer: any = 0;
  lastFeedbackContent: string = '';
  constructor(
    private $scope: ng.IScope,
    private $compile: Function,
    private $window: ng.IWindowService,
    private assertService: IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
  ) {}

  $onInit() {
    this.checkCurrentStatus();
  }

  checkCurrentStatus(): void {
    this.dataService.shop_checkCurrentStatus().then(({ data }) => {
      this.formData.kolId = data.kol_id;
      this.formData.backendId = data.backend_id;
    });
  }

  onFeedbackContentChange(e): void {
    const value = e.target.value;
    if (value.length >= 500) {
      this.formData.feedbackContent = value.substr(0, 500);
    }
  }

  onSubmit: () => void = () => {
    if (
      this.isDisableSubmit &&
      this.lastFeedbackContent === this.formData.feedbackContent
    ) {
      this.Notification.warn('已经收到反馈了，不用重复提交！');
      return;
    }
    this.lastFeedbackContent = this.formData.feedbackContent;
    this.isDisableSubmit = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.isDisableSubmit = false;
    }, 2000);
    this.dataService.addFeedback(this.formData).then(() => {
      // this.formData.feedbackContent = '';
      // this.formData.feedbackPhone = '';
      this.Notification.success('提交成功！');
    });
  };
}

export const feedbackForm = {
  template: require('./feedback-form.template.html'),
  controller: FeedbackFormController,
};
