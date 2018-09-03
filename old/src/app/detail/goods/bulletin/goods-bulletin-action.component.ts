import * as moment from 'moment';

type IShoppingNotesItem = {
  id?: number,
  name?: string,
  xdpIds?: number[],
  location: number,
  endTime?: Date,
  startTime?: Date,
};

export class goodsBulletinActionController implements ng.IComponentController {

  static $inject: string[] = [
    '$q', '$location', '$routeParams', 'dataService', 'seeUpload', 'Notification', '$uibModal',
  ];

  type: string;
  id: number = ~~this.$routeParams['id'];
  item: IShoppingNotesItem;
  formData: IShoppingNotesItem = {
    xdpIds: [],
    location: 1,
  };
  isSubmitting: boolean = false;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
    private seeUpload: see.ISeeUploadService,
    private notification: see.INotificationService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onInit(): void {
    const promises: ng.IPromise<any>[] = [];
    if (this.type === 'edit') {
      promises.push(this.getShoppingNotesDetail());
    }
    this.$q.all(promises);
  }

  verifyStartEndTime(): boolean {
    if (!this.formData.startTime || !this.formData.endTime) {
      return true;
    }
    return this.formData.startTime.getTime() < this.formData.endTime.getTime();
  }

  beforeRenderStartTime($view: any, $dates: any[], $leftDate: any, $upDate: any, $rightDate: any) {
    if (this.formData.endTime) {
      const activeDate = moment(this.formData.endTime);
      $dates
        .filter(date => date.localDateValue() >= activeDate.valueOf())
        .forEach(date => date.selectable = false);
    }
  }

  beforeRenderEndTime($view: any, $dates: any[], $leftDate: any, $upDate: any, $rightDate: any) {
    if (this.formData.startTime) {
      const activeDate = moment(this.formData.startTime).subtract(1, $view).add(1, 'minute');
      $dates
        .filter(date => date.localDateValue() <= activeDate.valueOf())
        .forEach(date => date.selectable = false);
    }
  }

  openAddXDPList() {
    this.$uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalGoodsShoppingNotesAddXDP',
      resolve: {
        selectedShopList: () => this.formData.xdpIds,
        from: () => 'bulletin',
      },
    }).result.then(shopIDList => {
      this.formData.xdpIds = shopIDList;
    }).catch(e => e);
  }

  getFormIsValid(): boolean {
    if (!this.verifyStartEndTime()) {
      return false;
    }
    return true;
  }

  save(): ng.IPromise<any> {
    if (!this.getFormIsValid()) {
      return;
    }
    const params = {
      ...this.formData,
      startTime: this.formData.startTime
        ? moment(this.formData.startTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      endTime: this.formData.endTime
        ? moment(this.formData.endTime).format('YYYY-MM-DD HH:mm:ss')
        : undefined,
    };
    const func = this.type === 'add' ? this.addShoppingNotes : this.editShoppingNotes;
    this.isSubmitting = true;
    return func.call(this, params).then(() => {
      this.notification.success(`${this.type === 'add' ? '创建' : '更新'}商详公告成功！`);
      this.$location.path('/goods/bulletin');
    }).finally(() => {
      this.isSubmitting = false;
    });
  }

  private addShoppingNotes(params): ng.IPromise<any> {
    return this.dataService.productNotice_add(params);
  }

  private editShoppingNotes(params): ng.IPromise<any> {
    return this.dataService.productNotice_update(params);
  }

  private getShoppingNotesDetail(): ng.IPromise<IShoppingNotesItem> {
    return this.dataService.productNotice_get({ noticeId: this.id })
      .then(({ data }) => {
        this.formData = {
          ...data,
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
        };
        return this.item = data;
      });
  }
}

export const goodsBulletinAction: ng.IComponentOptions = {
  template: require('./goods-bulletin-action.template.html'),
  controller: goodsBulletinActionController,
  bindings: {
    type: '@',
  },
};
