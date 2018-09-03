import './list.less';
import { modalEditTemplateController } from '../../../xiaochengxu/modal-edit-template.controller';
import { pick } from 'lodash';

export class Controller {
  static $inject: string[] = [
    '$routeParams',
    'dataService',
    'Notification',
    'seeModal',
  ];

  pageData = {
    page: 1,
    pageSize: 20,
    list: [],
    count: 0,
  };

  constructor(
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
  ) {}

  $onInit() {
    this.pageData.page = this.$routeParams.page || '1';
    this.weixin_getTemplateList();
  }

  editTemplate(id) {
    this.popEditTemplate(id);
  }

  popEditTemplate(id) {
    const modalInstance = modalEditTemplateController.open(id);
    return modalInstance.result.then(params => {
      const param = pick(params.template_info, [
        'id',
        'template_id',
        'user_version',
        'user_desc',
        'type',
      ]);
      if (~~id === 0) {
        this.dataService.weixin_addTemplateInfo(param).then(res => {
          this.Notification.success('添加模板成功');
          this.weixin_getTemplateList();
        });
      } else {
        this.dataService.weixin_setTemplateInfo(param).then(res => {
          this.Notification.success('模板设置成功');
          this.weixin_getTemplateList();
        });
      }
    });
  }

  private weixin_getTemplateList() {
    return this.dataService.weixin_getTemplateList({
      page: this.pageData.page,
      page_size: this.pageData.pageSize,
    }).then(res => {
      this.pageData.count = ~~res.data.count;
      this.pageData.list = res.data.list;
      return;
    });
  }
}

export const xcxCodeTplList: ng.IComponentOptions = {
  template: require('./list.template.html'),
  controller: Controller,
};
