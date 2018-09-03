import './activity-banner.less';

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as moment from 'moment';
import { values, some } from 'lodash';
import { BannerFormController } from './banner-form.component';

let idCounter = 1;

interface BannerFormMap {
  [key: string]: BannerFormController;
}

export class ActivityBannerController {
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

  ready: boolean;
  formDataList = [];
  bannerFormMap: BannerFormMap; // 映射 <formData._id||banner_id, bannerForm>
  dirty: boolean = false;
  kolId: string; // binding

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
  ) {
    let promises: ng.IPromise<any>[];
    promises = [];
    this.$q.all(promises);
  }

  $onInit() {
    this.ready = false;
    this.initPrivateData();
    this.fetchBannerList().then(() => {
      this.ready = true;
    });
    this.$scope.$watch(
      () =>
        !!this.bannerFormMap &&
        values(this.bannerFormMap).length > 0 &&
        (some(values(this.bannerFormMap), item => item.isDirty()) ||
          some(this.formDataList, item => item._id)), // 如果是新增还未保存的
      newValue => (this.dirty = newValue),
    );
  }

  initPrivateData() {
    this.dirty = false;
    this.formDataList = [];
    if (this.bannerFormMap) {
      Object.keys(this.bannerFormMap).forEach(
        k => delete this.bannerFormMap[k],
      );
    } else {
      this.bannerFormMap = {};
    }
  }

  fetchBannerList() {
    return this.dataService
      .shop_operate_getActBanner({ kol_id: this.kolId }) //
      .then(({ data }) => {
        if (data) {
          this.formDataList = data;
        }
      });
  }

  genDefaultBanner(obj: any) {
    const result = Object.assign(
      {
        _id: `tmp_banner_id_${idCounter}`,
      },
      obj,
    );
    idCounter += 1;
    return result;
  }

  uploadCb(resp: any) {
    if (resp.result === 1 && resp.data) {
      const obj = this.genDefaultBanner({
        banner_imgurl: resp.data,
      });
      this.formDataList.push(obj);
    }
    this.$element.find('.upload-input-trigger').val('');
  }

  shouldPreventAppend() {
    return this.formDataList.length >= 6;
  }

  onAppendClick() {
    if (this.shouldPreventAppend()) {
      this.Notification.warn('小电铺当前最多可配置6个活动banner');
      return;
    }
  }

  reset() {
    this.initPrivateData();
    this.fetchBannerList();
  }

  submit() {
    const bannerFormList = this.formDataList.map(formData => {
      const bannerFormId = this.identifyFormData(formData);
      return this.bannerFormMap[bannerFormId];
    });
    if (some(bannerFormList, bannerForm => bannerForm.hasError())) {
      // TODO scroll up
      return;
    }
    const paramsList = bannerFormList.map(bannerForm => {
      const params = bannerForm.getSubmitParams();
      delete params._id;
      return params;
    });
    this.dataService
      .shop_operate_addAndUpdateActBanner({
        kol_id: this.kolId,
        banner_info: JSON.stringify(paramsList),
      })
      .then(() => {
        this.reset();
        this.Notification.success('保存成功');
      });
  }

  onAddBannerForm = bannerForm => {
    const bannerFormId = this.identifyFormData(bannerForm.data);
    this.bannerFormMap[bannerFormId] = bannerForm;
  }; // tslint:disable-line:semicolon

  identifyFormData(formData: any) {
    // 初始化已有的banner 只能用 banner_id 标识
    // 新建还没保存的则用 _id
    return formData.banner_id || formData._id;
  }

  remove(index: number) {
    const doDel = () => {
      const removedFormData = this.formDataList[index];
      this.formDataList.splice(index, 1);
      const bannerFormId = this.identifyFormData(removedFormData);
      delete this.bannerFormMap[bannerFormId];
    };
    this.seeModal.confirm('确认提示', `确认删除该 Banner？`, () => {
      const formData = this.formDataList[index];
      if (!formData.banner_id) {
        doDel();
      } else {
        this.dataService
          .shop_operate_delActBanner({
            kol_id: this.kolId,
            banner_id: formData.banner_id,
          })
          .then(() => {
            doDel();
          });
      }
    });
  }

  move(index: number, step: number) {
    const targetIndex = index + step;
    const formDataList = this.formDataList;
    const len = formDataList.length;
    if (targetIndex >= len || targetIndex < 0) {
      return;
    }
    const srcFormData = formDataList[index];
    const targetFormData = formDataList[targetIndex];
    if (!srcFormData.banner_id || !targetFormData.banner_id) {
      // 当前移动的是新增还未保存，则直接移动
      this.formDataList[index] = targetFormData;
      this.formDataList[targetIndex] = srcFormData;
    } else {
      const bannerIdList = formDataList.map(formData => formData.banner_id);
      bannerIdList[index] = targetFormData.banner_id;
      bannerIdList[targetIndex] = srcFormData.banner_id;

      this.dataService
        .shop_operate_sortActBanner({
          kol_id: this.kolId,
          banner_id_list: JSON.stringify(bannerIdList.filter(v => !!v)),
        })
        .then(() => {
          this.formDataList[index] = targetFormData;
          this.formDataList[targetIndex] = srcFormData;
        });
    }
  }
}

export const shopOperateActivityBanner: ng.IComponentOptions = {
  template: require('./activity-banner.template.html'),
  controller: ActivityBannerController,
  bindings: {
    data: '<',
    dirty: '=',
    kolId: '<',
  },
};
