// (function () {
//   'use strict';

//   var account = angular.module('seego.account');

/**
 * 账号操作弹窗
 */
ModalInstanceCtrl.$inject = ['$uibModalInstance', 'modalWord', 'item'];
function ModalInstanceCtrl($uibModalInstance, modalWord, item) {
  let vm = this;

  vm.modalWord = wordFilter(modalWord);
  vm.ok = ok;
  vm.cancel = cancel;

  function wordFilter(modalWord) {
    modalWord.actmessage = modalWord.message.replace('<%%>', item.seller_email);
    return modalWord;
  }

  function ok() {
    $uibModalInstance.close();
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}

/**
 * 账号信息展示弹窗
 */
accountInfoModalInstanceCtrl.$inject = ['$q', 'Notification', '$log', '$uibModalInstance', 'dataService', 'user', 'DefaultTags'];
function accountInfoModalInstanceCtrl($q, Notification, $log, $uibModalInstance, dataService, user, DefaultTags) {
  let vm = this;

  vm.formData = {
    u_id: user.id,
    seller_id: user.seller_id,
    seller_ship_country: user.ship_country_data ? user.ship_country_data.location_id : '',
    seller_country: user.country_data ? user.country_data.location_id : '',
  };
  vm.defaultTags = DefaultTags;
  vm.ok = ok;
  vm.cancel = cancel;
  vm.verifyLength = verifyLength;
  vm.startEdit = startEdit;
  vm.saveEdit = saveEdit;
  vm.cancelEdit = cancelEdit;
  vm.is_edit = false;

  activate();

  function activate() {
    let promises = [getAccountDetail(), getConfigLocation()];
    return $q.all(promises).then(function () {
      $log.info('账号信息模态框激活');
    });
  }

  function verifyLength(minlen, maxlen) {
    let len = 0, val = vm.formData.custom_tag || '';
    for (let i = 0; i < val.length; i++) {
      if (val[i].match(/[^x00-xff]/ig) != null) //全角
        len += 2;
      else
        len += 1;
    }
    return len <= maxlen && len >= minlen;
  }

  function saveEdit() {
    console.log('saveEdit');
    let param = {
      id: user.id,
      seller_name: vm.userInfo.edit_seller_name,
      seller_mobile: vm.userInfo.edit_seller_mobile,
      alipay_account: vm.userInfo.edit_alipay_account,
      wx_account: vm.userInfo.edit_wx_account,
    };
    return dataService.user_saveAccountDetail(param).then(function (res) {
      vm.is_edit = false;
      vm.userInfo.seller_name = vm.userInfo.edit_seller_name;
      vm.userInfo.seller_mobile = vm.userInfo.edit_seller_mobile;
      vm.userInfo.alipay_account = vm.userInfo.edit_alipay_account;
      vm.userInfo.wx_account = vm.userInfo.edit_wx_account;

      Notification.success('用户信息保存成功');
    });
  }

  function cancelEdit() {
    vm.is_edit = false;
  }

  function startEdit() {
    vm.is_edit = true;
    vm.userInfo.edit_seller_name = vm.userInfo.seller_name;
    vm.userInfo.edit_seller_mobile = vm.userInfo.seller_mobile;
    vm.userInfo.edit_alipay_account = vm.userInfo.alipay_account;
    vm.userInfo.edit_wx_account = vm.userInfo.wx_account;
  }

  function getAccountDetail() {
    return dataService.user_getAccountDetail({ id: user.id }).then(function (res) {
      vm.userInfo = res.data;
      vm.formData.u_tag = res.data.u_tag;
      vm.formData.custom_tag = res.data.u_tag;
      vm.is_c2c = res.data.seller_privilege === '1' || res.data.seller_privilege === '30';
      if (!~DefaultTags.indexOf(vm.userInfo.u_tag)) vm.formData.u_tag = '其他';
      return vm.userInfo;
    });
  }

  function getConfigLocation() {
    return dataService.CommonData_getConfigLocation().then(function (res) {
      vm.country_list = res.data;
      return vm.country_list;
    });
  }

  function ok() {
    if (typeof vm.formData.custom_tag != 'undefined' && vm.formData.u_tag === '其他') {
      vm.formData.u_tag = vm.formData.custom_tag;
      delete vm.formData.custom_tag;
    }
    $uibModalInstance.close(vm.formData);
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}
// })();

export {
  ModalInstanceCtrl,
  accountInfoModalInstanceCtrl,
};
