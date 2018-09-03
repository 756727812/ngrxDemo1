import * as _ from 'lodash';;

import { IDataService } from '../../../services/data-service/data-service.interface';
import { INotificationService } from '../../../services/notification/notification.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';

export class Controller {

  private page: string;
  form: ng.IFormController;
  formData: any;
  close: Function;
  resolve: {
    type: string,// 'add' / 'edit'
    item?: string,
    kolId?: string,
  };

  static $inject: string[] = ['$q', '$routeParams', '$location', 'seeModal', 'dataService', 'Notification', '$uibModal'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: ISeeModalService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $uibModal: any,
  ) {

  }

  $onInit() {
    this.formData = {
      categoryName: _.result(this.resolve, 'item.categoryName'),
    };
  }

  getKolId() {
    return this.resolve.kolId;
  }

  isTypeAdd() {
    return this.resolve.type === 'add';
  }

  submit() {
    if (this.hasError()) {
      return;
    }
    const commonParams = {
      kolId: this.getKolId(),
    };
    if (this.isTypeAdd()) {
      const params = {
        ...commonParams,
        groupType: 2,
        categoryName: this.formData.categoryName,
      };
      this.dataService.goods_group_addGroup(params).then(() => {
        this.Notification.success('保存成功');
        this.close({ $value: { success: true } });
      });
    } else {
      const params = {
        ...commonParams,
        categoryId: _.result(this.resolve, 'item.categoryId'),
        categoryName: this.formData.categoryName,
      };
      this.dataService.goods_group_updateGroup(params).then(() => {
        this.Notification.success('保存成功');
        this.close({ $value: { success: true } });
      });
    }
  }

  hasError() {
    return !_.isEmpty(this.form.$error);
  }

}
export const goodsGroupModalAddManualGroup: ng.IComponentOptions = {
  template: require('./modal-add-manual-group.template.html'),
  controller: Controller,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
