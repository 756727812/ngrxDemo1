import * as _ from 'lodash';;
import * as moment from 'moment';
import { IDataService } from '../../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../../services/see-modal/see-modal.interface';
import { INotificationService } from '../../../services/notification/notification.interface';

export class ModalEventGroupAddGoodsController
  implements ng.IComponentController {
  static $inject: string[] = ['$q', 'dataService', 'seeModal', 'Notification'];

  close: Function;
  dismiss: Function;
  formData: {
    type?: number;
    name?: string;
  } = {
    type: 0,
  };
  items: {
    list: any[];
    count: number;
    page: number;
  } = {
    list: [],
    count: 0,
    page: 1,
  };
  resolve: {
    kolId: number;
    api: string;
  };
  hideList: boolean = false;
  loading: boolean = false;

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
    private Notification: INotificationService,
  ) {}

  $onInit() {
    this.$q.all([this.getKOLGoodsList()]);
  }

  ok: (item: any) => any = item =>
    this.close({
      $value: {
        id: item.id,
        itemImgurl: item.itemImgurl,
        itemName: item.itemName,
        distribution: _.isNil(item.distribution)
          ? item.isDistribution
          : item.distribution,
      },
    });

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  getKOLGoodsList: (page?: number) => ng.IPromise<any> = (page = 1) => {
    this.loading = true;
    const params = {
      ...this.formData,
      page,
      pageSize: 10,
      kolId: this.resolve.kolId,
    };
    return this.dataService[this.resolve.api](params).then(({ data }) => {
      this.loading = false;
      this.items = {
        page,
        list: data
          ? data.list.map(item => ({
              ...item,
              isDistribution: Object.hasOwnProperty.call(item, 'isDistribution')
                ? item.isDistribution
                : item.distribution === true ? 1 : 0,
              price:
                this.resolve.api === 'seckill_activityProducts'
                  ? parseFloat(`${item.price / 100}`).toFixed(2)
                  : item.price,
            }))
          : [],
        count: data ? data.count : 0,
      };
      if (this.items.count === 0 && !params.name && !params.type) {
        this.hideList = true;
      }
    });
  };
}

export const ModalEventGroupAddGoods: ng.IComponentOptions = {
  template: require('./modal-event-group-add-goods.template.html'),
  controller: ModalEventGroupAddGoodsController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
