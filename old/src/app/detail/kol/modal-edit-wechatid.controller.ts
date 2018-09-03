import * as angular from 'angular';
import { merge, isEmpty } from 'lodash';
import Injector from '../../utils/injector';

const guaranteeWechatAccount: () => Promise<{
  wx_official_account;
  wx_official_name;
}> = () => {
  return new Promise(resolve => {
    Injector.getDataService()
      .seller_getSellerDetail(false)
      .then(({ data }) => {
        // wx_official_name; // 名称
        // wx_official_account; // 公众号微信号
        const { wx_official_name, wx_official_account } = data.seller_info;
        if (!isEmpty(wx_official_account) && !isEmpty(wx_official_account)) {
          resolve({ wx_official_name, wx_official_account });
        } else {
          modalEditWechatIdController
            .open(wx_official_account, wx_official_name)
            .result.then(result => resolve(result))
            .catch(() => {});
        }
      });
  });
};
export class modalEditWechatIdController {
  static $inject = ['$routeParams', 'dataService'];

  static open(wechat_id?: string, wechat_name?: string) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      component: 'modalEditWechatId',
      backdrop: 'static',
      size: 'md',
      resolve: {
        wechat_id: () => wechat_id,
        wechat_name: () => wechat_name,
      },
    });
  }

  static guaranteeWechatAccount = guaranteeWechatAccount;

  formData: any;
  resolve: any;
  dismiss: Function;
  close: Function;

  constructor(
    private $routeParams: any,
    private dataService: see.IDataService,
  ) {}

  $onInit() {
    this.formData = {
      wechat_id: this.resolve.wechat_id,
      wechat_name: this.resolve.wechat_name,
    };
  }

  ok() {
    const param = {
      wx_official_name: this.formData.wechat_name,
      wx_official_account: this.formData.wechat_id,
    };

    this.dataService.seller_saveWeixinInfo(param).then(res => {
      this.close({ $value: merge({}, param, this.formData) });
    });
  }

  cancel() {
    this.dismiss();
  }
}

export const modalEditWechatId: ng.IComponentOptions = {
  template: require('./modal-edit-wechatid.html'),
  controller: modalEditWechatIdController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
