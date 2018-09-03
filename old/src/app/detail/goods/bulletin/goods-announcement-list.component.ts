import * as _ from 'lodash';;

export class goodsAnnouncementListController {
  private page: string;

  total_items: number;
  list_notice: any[];
  list_c2c: any[];
  list_country: any[];

  static $inject: string[] = [
    '$q', '$routeParams', 'seeModal', 'dataService', 'Notification',
    '$uibModal',
  ];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) { }

  $onInit() {
    this.total_items = 0;
    this.page = this.$routeParams['page'] || '1';

    this.dataService.CommonData_getConfigLocation().then(res => {
      this.list_country = res.data;

      const promises = [this.getC2cList(), this.getNoticeList()];
      this.$q.all(promises);
    });

  }

  private getC2cList() {
    return this.dataService.user_getAllSeller().then(res => {
      this.list_c2c = res.data.list;
      _.forEach(this.list_c2c, (v, i) => {
        v.seller_name = v.seller_name + '(' + v.seller_email + ')';
      });
      return this.list_c2c;
    });
  }

  private getNoticeList() {
    return this.dataService.item_notice_getList({}).then(res => {
      this.list_notice = res.data.list;
      this.total_items = res.data.count;

      _.forEach(this.list_notice, (notice, i) => {
        if (notice.limit_location === '') {
          notice.limit_location = '所有';
        }
      });
      return this.list_notice;
    });
  }

  addNotice() {
    const notice_info = {
      title: '',
      content: '',
      limit_location: '',
      limit_device: '0',
      limit_class: '',
      id: '0',
      end_time: 0,
      create_time: 0,
      is_public: '1',
      limit_seller_id: '',
      arr_seller_id: [],
    };
    this.editNotice(notice_info);
  }
  editNotice(notice_info) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('../modal-goods-announcement.html'),
      controller: 'modalAnnouncementController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        cur_notice_info: () => notice_info,
        list_c2c: () => this.list_c2c,
        list_country: () => this.list_country,
      },
    });
    return modalInstance.result.then(params => {
      if (notice_info.id === '0') {
        this.Notification.success('创建成功');
      } else {
        this.Notification.success('编辑成功');
      }
      return this.getNoticeList();
    });
  }

  noticeOnline(id, online) {
    let tips = '该公告为下线中，你确认要上线？';
    if (Number(online) === 0) {
      tips = '该公告为上线中，你确认要强制下线？';
    }
    this.seeModal.confirm('确认提示', tips, () => {
      const params = {
        id,
        online,
      };
      return this.dataService.item_notice_noticeOnline(params).then(res => {
        if (Number(online) === 0) {
          this.Notification.success('下线成功');
        } else {
          this.Notification.success('上线成功');
        }
        return this.getNoticeList();
      });
    });
  }

}

export const goodsAnnouncementList: ng.IComponentOptions = {
  template: require('./goods-announcement-list.template.html'),
  controller: goodsAnnouncementListController,
};
