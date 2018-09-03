import './banner-form.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';

import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as moment from 'moment';
import { isEmpty } from 'lodash';
import { Controller as HrefPickerCtrl } from './href-picker.component';

export class BannerFormController {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
    '$element',
    '$scope',
  ];

  form: ng.IFormController;
  hackInitRangeDateTxt: boolean = false;
  onAddBannerForm: Function;
  formSubmitted: boolean;
  data: any;
  hrefItem: {
    article_id: string;
    title: string;
    h5_url: string;
    xcx_url: string;
  };
  rangeDate: {
    startDate: moment.Moment; // Moment
    endDate: moment.Moment; // Moment
  };
  uploaderDirty: boolean = false;
  kolId: string;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private $element: any,
    private $scope: any,
  ) {}

  $onInit() {
    this.rangeDate = { startDate: null, endDate: null };
    this.initData();
    this.$scope.$watch(
      () => this.data,
      (newVal, oldVal) => {
        // 如果外部数据重 load，则数据对象改变，重新初始化相关数据
        if (newVal !== oldVal && newVal) {
          this.initData();
        }
      },
    );
    if (this.onAddBannerForm) {
      this.onAddBannerForm(this);
    }
  }

  initData() {
    const data = this.data;
    if (data) {
      const {
        start_time,
        end_time,
        title,
        xcx_url,
        h5_url,
        redirect_article_id,
      } = data;
      if (start_time && end_time) {
        const startDate = moment(start_time);
        const endDate = moment(end_time);
        Object.assign(this.rangeDate, { startDate, endDate });
        if (this.hackInitRangeDateTxt) {
          // rangedatepicker 的 display 值就是显示不出来，但是在「活动 banner」中又可以，囧~
          const dateText = `${startDate.format(
            'YYYY/MM/DD',
          )} - ${endDate.format('YYYY/MM/DD')}`;
          this.$element.find('input[name="show_time"]').val(dateText);
        }
      }
      if (title) {
        this.hrefItem = {
          title,
          xcx_url,
          h5_url,
          article_id: redirect_article_id,
        };
      } else {
        this.hrefItem = null;
      }
    }
  }

  onUploadFail() {}

  openHrefPicker() {
    HrefPickerCtrl.open(this.kolId).result.then(item => {
      /*
       article_id:100
       kol_id:33
       title:"test11111"
       url_h5:"http://url_h5.com"
       url_xcx:"http://url_xcx.com"
       weixin_auth_info_id:10
       */
      if (item) {
        this.form.$setDirty();
        this.hrefItem = item;
      }
    });
  }

  hasError() {
    return !isEmpty(this.form.$error);
  }

  hasEverSaved() {
    return this.data && this.data.banner_id;
  }

  getSubmitParams() {
    if (this.hasError()) {
      return null;
    }
    const { startDate, endDate } = this.rangeDate;
    if (!startDate || !endDate) {
      return null;
    }
    const { banner_imgurl, banner_id } = this.data;
    const params = {
      banner_id,
      banner_imgurl,
      kol_id: this.kolId,
      start_time: ~~(
        startDate
          .startOf('day')
          .toDate()
          .getTime() / 1000
      ),
      end_time: ~~(
        endDate
          .endOf('day')
          .toDate()
          .getTime() / 1000
      ),
    };
    if (this.hrefItem) {
      const { xcx_url, h5_url, article_id } = this.hrefItem;
      // article_id 没有则后台传过来'0'，尴尬~
      const isNoneRedirectArticle = !article_id || article_id === '0';
      Object.assign(params, {
        xcx_url: isNoneRedirectArticle ? null : xcx_url,
        h5_url: isNoneRedirectArticle ? null : h5_url,
        redirect_article_id: article_id,
      });
    }
    return {
      ...this.data,
      ...params,
    };
  }

  shouldShowBannerStatus() {
    return (
      this.formSubmitted &&
      this.hasEverSaved() &&
      this.rangeDate.startDate &&
      this.rangeDate.endDate
    );
  }

  getBannerStatusText() {
    const { startDate, endDate } = this.rangeDate;
    const now = moment();
    return now.isSameOrBefore(endDate, 'day') &&
    now.isSameOrAfter(startDate, 'day')
      ? '显示'
      : '隐藏';
  }

  isDirty() {
    return this.form.$dirty || this.uploaderDirty;
  }
}

export const shopOperateBannerForm: ng.IComponentOptions = {
  template: require('./banner-form.template.html'),
  controller: BannerFormController,
  bindings: {
    data: '=',
    formSubmitted: '<',
    onAddBannerForm: '<',
    hackInitRangeDateTxt: '<',
    recommendedImgHeight: '@',
    kolId: '<',
  },
};
