import { ISeeModalService } from './see-modal.interface';

export class seeModal implements ISeeModalService {

  static $inject: string[] = ['$uibModal'];

  constructor(private $uibModal: ng.ui.bootstrap.IModalService) {
  }

  confirm = (title, body, ok, cancel, text_ok = '确定', text_cancel: (string | boolean) = '取消') => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./confirm.template.html'),
      controller: 'modalConfirmController',
      controllerAs: 'vm',
      size: 'md',
      backdrop: 'static',
      resolve: {
        title: () => title,
        body: () => body,
        text_ok: () => text_ok,
        text_cancel: () => text_cancel,
      },
    });
    return modalInstance.result.then(() => {
      return ok && ok();
    },                               () => {
      return cancel && cancel();
    });
  }

  needReasonP = (title) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./reason.template.html'),
      controller: 'modalReasonController',
      controllerAs: 'vm',
      size: 'md',
      backdrop: 'static',
      resolve: {
        title: () => title,
      },
    });
    return modalInstance.result;
  }


  // wanring = (title, body) => {
  //   let modalInstance = this.$uibModal.open({
  //     animation: true,
  //     template: require('./warning.template.html'),
  //     controller: 'modalConfirmController',
  //     controllerAs: 'vm',
  //     size: 'md',
  //     resolve: {
  //       title: () => title,
  //       body: () => body,
  //   })
  // }

  /**
   * 确认框的Promise实现
   */
  confirmP = (title, body, confirm_text = '确定', cancel_text: (string | boolean) = '取消', backdrop = true) =>
    this.$uibModal.open({
      animation: true,
      template: require('./confirm.template.html'),
      controller: 'modalConfirmController',
      controllerAs: 'vm',
      size: 'md',
      backdrop,
      resolve: {
        title: () => title,
        body: () => body,
        text_ok: () => confirm_text,
        text_cancel: () => cancel_text,
      },
    }).result


  /**
   *   提示框
   */
  alert = (title = '提示', body, ok, ok_text = '确定') => {
    return this.confirm(title, body, ok, null, ok_text, false);
  }

  /**
   *   提示框 Promise
   */
  alertP = (title = '提示', body, ok_text = '确定', backdrop = true) => {
    return this.confirmP(title, body, ok_text, false, backdrop);
  }
}
