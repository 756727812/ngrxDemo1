import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;
import './index-account.less';

indexAccountController.$inject = [
  '$window',
  '$scope',
  '$location',
  '$routeParams',
  '$cookies',
  'dataService',
  'Notification',
  'seeModal',
];
export function indexAccountController(
  $window,
  $scope,
  $location,
  $routeParams,
  $cookies,
  dataService: IDataService,
  Notification: INotificationService,
  seeModal,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let secret = '';
  $scope.GACode = '';
  $scope.hasShop = 0; //是否有小电铺
  $scope.isProShop = 0; //小电铺是否为专业版
  $scope.toApply = 0;
  $scope.isShowPop = 0;
  $scope.isReadonly = 0;
  $scope.isC2C =
    $cookies.get('seller_privilege') === '1' ||
    $cookies.get('seller_privilege') === '30';
  $scope.isPgc = $cookies.get('seller_privilege') === '8';
  $scope.platform_info = [
    {
      id: 2,
      name: '微博',
      placeholder: '微博昵称',
      class: 'fa-weibo',
    },
    {
      id: 3,
      name: '知乎',
      placeholder: '知乎昵称',
      class: 'fa-user',
    },
    {
      id: 4,
      name: '豆瓣',
      placeholder: '用户昵称',
      class: 'fa-user',
    },
    {
      id: 5,
      name: 'Instagram',
      placeholder: '用户名称',
      class: 'fa-instagram',
    },
    {
      id: 6,
      name: 'Facebook',
      placeholder: '用户名称',
      class: 'fa-facebook-official',
    },
    {
      id: 7,
      name: 'Twitter',
      placeholder: '用户名称',
      class: 'fa-twitter',
    },
    {
      id: 8,
      name: 'Pinterest',
      placeholder: '用户名称',
      class: 'fa-pinterest',
    },
  ];
  $scope.fans_range = [
    '少于5000',
    '5000~2w',
    '2w~5w',
    '5w~10w',
    '10w~20w',
    '20w~50w',
    '50w~75w',
    '75w~100w',
    '100w以上',
  ];
  $scope.login_info = {};
  $scope.auth_info = {};
  $scope.account_type = {};
  init();

  function init() {
    getAccountTypeList();
    getSellerDetail();
    getGAStatus();
    applyWithdrawalQuery();
  }

  $scope.changeName = function () {
    // console.log(123)
    dataService.seller_modifySellerInfo($scope.login_info).then(res => {
      getSellerDetail();
      Notification.success();
    });
  };
  function getAccountTypeList() {
    dataService.authv2_getAccountTypeList({}).then(
      res => {
        $scope.account_type = res.data;
      }
    )
  }
  function getSellerDetail() {
    dataService.seller_getSellerDetailv2(false).then(res => {
      $scope.login_info = res.data.login_info;
      $scope.account_info = res.data.account_info;
      if (!res.data.account_info.seller_type) {
        $scope.account_info.seller_type = 3;
      }
      $scope.xiaodianpu_info = res.data.xiaodianpu_info;
      $scope.hasShop = res.data.xiaodianpu_info.length;
      if ($scope.hasShop) {
        getAuthInfo();
      }
      angular.forEach($scope.platform_info, function (v1, k1) {
        angular.forEach(res.data.account_info.platform_info, function (v2, k2) {
          if (v1.id == v2.platform_type) {
            v1.is_set = true;
            v1.is_checked = true;
            // v1.name = v2.platform_name;
            v1.account_name = v2.account_name;
            v1.account_id = v2.account_id;
            v1.fans_count = v2.fans_count;
          }
        });
      });
    });
  }
  /**
   * 获取当前账号的谷歌验证状态
   */
  function getGAStatus() {
    dataService.seller_isGaSecretOpen().then(res => {
      $scope.isGaSecretOpen = res.data.isOpen;
      $scope.isGaSecretOpenOrigin = angular.copy(res.data.isOpen);
    });
  }

  /*
   *获取当前小电铺状态
   */
  function getAuthInfo() {
    dataService.shop_checkCurrentStatus({}).then(res => {
      const type = res.data.type;
      // if (type == 3) {
      $scope.isProShop = 1;
      dataService
        .xiaodianpu_getAuthResult({})
        .then(res => {
          $scope.auth_info = res.data;
        })
        .catch(err => {
          console.log(err);
          // $scope.auth_info.status = 1
        });
      // }
    });
  }
  // 提现信息
  function applyWithdrawalQuery() {
    return dataService
      .api_fms_withdrawal_apply_query()
      .then(res => {
        $scope.applyData = res.data;
        console.log($scope.applyData);
      })
      .catch(err => { });
  }

  $scope.withdrawalWarning = function () {
    seeModal.confirm('提醒', '请联系SEE管理员设置提现方式与账户', null, null, '知道了', '');
  };

  /**
   * 生成当前的secret，显示二维码
   */
  $scope.createGASecret = function () {
    $scope.isGaSecretOpen = true;
    dataService.seller_createGASecret().then(res => {
      secret = res.data.secret;
      $scope.showQR = true;
      $scope.qr = {
        v: 5,
        e: 'M',
        s: 200,
        data: res.data.qrcode,
      };
    }, err => ($scope.isGaSecretOpen = false));
  };

  /**
   * 开启两步验证
   */
  $scope.saveGASecret = function () {
    dataService
      .seller_saveGASecret({
        secret,
        code: $scope.GACode,
      })
      .then(res => {
        Notification.success('恭喜，两步验证开启成功！');
        $scope.isGaSecretOpenOrigin = true;
        $scope.isGaSecretOpen = true;
        $scope.showQR = false;
      });
  };

  // 数据接口对接还没完成
  $scope.submitAccountForm = function () {
    const formData = $scope.account_info;
    const extra_platform_info = _.filter(
      $scope.platform_info,
      'is_checked',
    ).map(o => {
      return {
        platform_type: o['id'],
        account_name: o['account_name'],
        account_id: o['account_id'],
        fans_count: o['fans_count'],
      };
    });
    formData.platform_info = _.concat(
      formData.platform_info[0],
      extra_platform_info,
    );
    // 提交表单
    dataService.authv2_addAndUpdateInfo(formData).then(res => {
      // console.log(res);
      Notification.success();
    });
  };

  // 数据接口对接还没完成
  $scope.submitWeixinInfo = function () {
    if (!_.isEmpty(this.userForm.$error)) {
      return;
    }

    seeModal.confirm('确认提示', '修改公众号信息会影响内容电商模块下文章数据的获取，确认修改公众号信息？', () => {
      const formData = $scope.account_info;
      const param = {
        wx_official_name: formData.wx_official_name,
        wx_official_account: formData.wx_official_account,
      };
      dataService.seller_saveWeixinInfo(param).then(res => {
        // console.log(res);
        Notification.success();
      });
    });
  };

  $scope.toApplyShop = function () {
    $scope.toApply = 1;
    $scope.isReadonly = 0;
  };
  $scope.toViewShop = function () {
    $scope.toApply = 1;
    $scope.isReadonly = 1;
  };
  // 修改认证
  $scope.editorApply = function () {
    $scope.isShowPop = !$scope.isShowPop;
  };
  $scope.getApplyStatus = function (type) {
    $scope.toApply = 0;
    getAuthInfo();
  };
}

export const indexAccount: ng.IComponentOptions = {
  template: require('./index-account.template.html'),
  controller: indexAccountController,
};
