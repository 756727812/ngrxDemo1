/**
 * 商品规则管理列表
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as moment from 'moment';

goodsInBatchListController.$inject = ['$scope', '$uibModal', '$routeParams', 'Notification', 'dataService', 'seeUpload', 'seeModal'];
export function goodsInBatchListController($scope, $uibModal, $routeParams, Notification: INotificationService, dataService, seeUpload, seeModal: ISeeModalService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const page = $routeParams.page || 1;
  init();
  function init() {

    $scope.flag = false;
    $scope.formDate = {
      date_picker: {
        startDate: null,
        endDate: null,
      },
    };

    getRuleList();
  }

  function getRuleList() {
    return dataService.rule_getRuleList({ p: page }).then(res => {
      $scope.rules = res.data.list;
      $scope.total_items = res.data.count;
    });
  }
  $scope.checkDetail = function (_rule) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-goods-in-batch-detail.template.html'),
      controller: 'ModalGoodsRuleDetailShowCtrl',
      size: 'lg',
      resolve: {
        rule() {
          return _rule;
        },
      },
    });
    modalInstance.result.then(function () {
      //
    },                        function () {
      //
    });
  };
  $scope.toggleRuleStatus = function (_rule) {
    if (_rule.start_time < (new Date().getTime()) / 1000 && _rule.is_active == 0) {
      Notification.warn('启用时间必须早于预约的执行时间');
      return;
    }
    const t = _rule.is_active == 1 ? '暂停' : '启用';
    seeModal.confirmP('规则设置', `你确定要${t}该商品规则吗？`).then(() => {
      const _params = {
        rule_id: _rule.rule_id,
        is_active: Math.abs(_rule.is_active - 1),
      };
      dataService.rule_toggleRuleStatus(_params).then(res => {
        Notification.success(`该商品规则执行${t}操作成功！`);
        getRuleList();
      });
    });
  };

  // 初始化数据
  $scope.batchEdit = function () {
    $scope.flag = !$scope.flag;

    // $scope.successMessage = '';
    $scope.importFile = '';
    $scope.exportType = 1;
    $scope.formModify = {
      action_type: '1',
      begin: '',
      end: '',
      seller_email_list: '',
    };
  };

  // 初始化导出数据
  $scope.initExport = function () {
    $scope.formModify.seller_email_list = '';

    $scope.exportType = 1;
    $scope.formDate = {
      date_picker: {
        startDate: null,
        endDate: null,
      },
    };
  };

  $scope.initImport = function () {
    // $scope.successMessage = '';
    $scope.importFile = '';
  };

  // 初始化提交表单数据
  $scope.initFormData = function () {
    $scope.formModify.action_type = Number($scope.formModify.action_type);

    if ($scope.exportType == 1) {
      $scope.formModify.begin = '';
    } else if ($scope.formDate.date_picker.startDate) {
      $scope.formModify.begin = $scope.formDate.date_picker.startDate.unix();
    } else {
      $scope.formModify.begin = moment().unix();
    }

    if ($scope.exportType == 1) {
      $scope.formModify.end = '';
    } else if ($scope.formDate.date_picker.endDate) {
      $scope.formModify.end = $scope.formDate.date_picker.endDate.unix();
    } else {
      $scope.formModify.end = moment().unix();
    }
  };

  // 导出数据
  $scope.exportData = function () {
    dataService.batchModifyItemInfo({
      data: $scope.formModify,
      action_type: $scope.formModify.action_type,
    }).then(function (res) {
      // 数据下载操作
      const blob = new Blob([res], {
        type: 'application/vnd.ms-excel;charset=utf-8',
      });
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.download = '商品信息-' + moment().format('YYYY-MM-DD') + '.xls';
      a.href = URL.createObjectURL(blob);
      a.click();
    });
  };

  // 导入数据
  $scope.importData = function () {
    if ($scope.importFile) {
      const filePromise = seeUpload.uploadBatchFile({
        file: $scope.importFile,
        action_type: $scope.formModify.action_type,
      }).then(function (res) {
        Notification.success(res.msg, false);
      },      function (res) {
        Notification.dataError(res.msg);
      });
    } else {
      Notification.dataError('请导入文件');
    }
  };

  // 表单提交
  $scope.submitModifyForm = function () {
    $scope.initFormData();
    // console.log($scope.formModify);
    if ($scope.formModify.action_type == 1) {
      $scope.exportData();
    } else {
      $scope.importData();
    }
  };

  $scope.deleteRule = function (_rule) {
    seeModal.confirmP('删除规则', '你确定要删除该商品规则吗？').then(() =>
      dataService.rule_deleteRule({
        rule_id: _rule.rule_id,
      }).then(res => {
        Notification.success('该商品规则删除操作成功！');
        getRuleList();
      }),
    );
  };
}

export const goodsInBatchList: ng.IComponentOptions = {
  template: require('./goods-in-batch-list.template.html'),
  controller: goodsInBatchListController,
};
