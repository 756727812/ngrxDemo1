// (function () {
//   'use strict';

//   angular
//     .module('seego.fashion')
//     .controller('modalApplyCustomLibController', modalApplyCustomLibController);
import * as angular from 'angular';
import * as moment from 'moment';
import * as md5 from 'md5';;

modalApplyCustomLibController.$inject = ['$uibModalInstance', '$scope', 'catalogs', 'fashionService', 'dataService', 'seeModal', 'Notification'];
function modalApplyCustomLibController($uibModalInstance, $scope, catalogs, fashionService, dataService, seeModal, Notification) {
  const vm = this;
  vm.catalogs = catalogs.data;
  vm.itemHide = itemHide;
  vm.editorItem = editorItem;
  vm.iseditor = [];
  vm.formData = {};
  vm.activate = activate;
  vm.$onInit = activate;
  vm.materialList = [];
  vm.applyNewLib = function () {
    return fashionService.applyNewLib(catalogs.data, catalogs.uid, 'custom');
  };
  $scope.$on('addNewStatus', function (event, data) { //获取添加素材接口，成功后刷新列表
    data && activate();
  });
  function activate(formData?) {
    const params = {
      uid: catalogs.uid,
      platform: formData && formData.platform || '',
      status: formData && formData.status || '',
      desc: formData && formData.desc || '',
    };
    return dataService.crawler_get_new_required(params).then(function (res) {
      vm.materialList = res.data;
    });
  }
  function itemHide(id, is_hide, index) {
    seeModal.confirm('提示', '确认隐藏此网址？', function () {
      return dataService.crawler_itemHide({
        skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
        correlation_id: id,
        hide_status: +!is_hide,
      }).then(function (res) {
        Notification.success('隐藏成功！');
        activate;
      });
    });
  }
  function editorItem(list, v, type) { //0:描述,1:类型,2:是否隐藏
    const params = angular.extend(list, {
      skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
    });
    if (type == 0) {
      params.desc = v;
    } else if (type == 1) {
      params.platform = v;
    }
    if (type == 2) {
      const tips = !v ? '此网址隐藏后，素材库将不会显示该网址的内容，确认隐藏吗？' : '确认显示该网址？';
      seeModal.confirm('提示', tips, function () {
        params.is_hide = +!v;
        return dataService.crawler_add_new_required(params).then(function (res) {
          if (res.result == 1) {
            Notification.success('操作成功！');
            activate;
          }
        });
      });
    } else {
      return dataService.crawler_add_new_required(params).then(function (res) {
        if (res.result == 1) {
          Notification.success('编辑成功！');
          activate;
          vm.iseditor = [];
        }
      });
    }
  }

  vm.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
export {
  modalApplyCustomLibController,
};
// })();
