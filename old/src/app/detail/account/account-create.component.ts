import * as angular from 'angular';
export const accountCreate = {
  template: require('./account-create.template.html'),
  controller: createAccountController,
};
createAccountController.$inject = ['$location', 'accountList', 'Notification', 'dataService'];
function createAccountController($location, accountList, Notification, dataService) {
  const $ctrl = this;
  let accessType = [4, 7, 10, 20, 21, 9, 23, 24, 25, 26, 40];

  let block_with_dd = (document.cookie.match('(^|; )block_with_dd=([^;]*)') || 0)[2];
  // 强制生效 12-09 到 12-15
  block_with_dd = 0;// 关闭DD

  if (block_with_dd == 1) {
    accessType = [7, 10, 20, 9, 24, 25];
  }

  $ctrl.create = create;

  $ctrl.$onInit = activate;

  function activate() {
    $ctrl.accountList = accountList.filter(function (o) {
      // console.log(o);
      return !!~accessType.indexOf(o.id);
    });
  }

  function create() {
    const param = {
      seller_name: $ctrl.formData.seller_name,
      seller_email: $ctrl.formData.seller_email,
      seller_pwd: $ctrl.formData.seller_pwd,
      seller_privilege: $ctrl.formData.seller_privilege,
      u_id: $ctrl.formData.u_id,
    };
    return dataService.user_createAccount(param).then(function (res) {
      Notification.success('注册成功！');
      $location.path('/account/list');
    });
  }

}

