import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

modifyKolInfoController.$inject = ['$scope', 'dataService', '$location', '$routeParams', 'Notification'];
export function modifyKolInfoController($scope, dataService: IDataService, $location, $routeParams, Notification: INotificationService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  $scope.is_term_checked = true;
  $scope.show_term_checked = true;
  $scope.platform_info = [
    {
      id: 1,
      name: '微信',
      class: 'fa-wechat',
      is_checked: true,
    },
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

  $scope.fans_range = ['少于5000', '5000~2w', '2w~5w', '5w~10w', '10w~20w', '20w~50w', '50w~75w', '75w~100w', '100w以上'];

  const init = function () {
    dataService.seller_getSellerDetail(false).then(function (res) {
      if (res.data.seller_info.seller_mobile == '0') {
        res.data.seller_info.seller_mobile = '';
      }
      if (res.data.seller_info.seller_mobile != '') {
        $scope.show_term_checked = false;
      }
      $scope.formData = {
        seller_info: res.data.seller_info,
        seller_id: $routeParams.id,
        seller_addr: res.data.seller_info.seller_addr,
        seller_idcard_front_imgurl: res.data.seller_info.seller_idcard_front_imgurl,
        seller_idcard_back_imgurl: res.data.seller_info.seller_idcard_back_imgurl,
        seller_country: res.data.seller_info.country_data ? res.data.seller_info.country_data.location_id : '',
      };

      angular.forEach($scope.platform_info, function (v1, k1) {
        angular.forEach(res.data.seller_info.kol_platform, function (v2, k2) {
          if (v1.id == v2.platform_type) {
            console.log('equ');
            v1.is_set = true;
            v1.is_checked = true;
            v1.name = v2.platform_name;
            v1.account_name = v2.account_name;
            v1.account_id = v2.account_id;
            v1.fans_count = v2.fans_count;
          }
        });
      });

      $scope.$watch('formData.seller_idcard_front_imgurl', function () {
        if ($scope.formData.seller_idcard_front_imgurl) {
          const url = $scope.formData.seller_idcard_front_imgurl;
          if (url && url.search(/http:|https:/) !== 0) {
            $scope.seller_idcard_front_imgurl_show = '//image.seecsee.com' + url;
          } else {
            $scope.seller_idcard_front_imgurl_show = url;
          }
        }

      },            true);
      $scope.$watch('formData.seller_idcard_back_imgurl', function () {
        if ($scope.formData.seller_idcard_back_imgurl) {
          const url = $scope.formData.seller_idcard_back_imgurl;
          if (url && url.search(/http:|https:/) !== 0) {
            $scope.seller_idcard_back_imgurl_show = '//image.seecsee.com' + url;
          } else {
            $scope.seller_idcard_back_imgurl_show = url;
          }
        }
      },            true);
    });
    dataService.CommonData_getConfigLocation().then(res => $scope.countryList = res.data);
  };
  init();



  $scope.submitForm = function (userForm) {
    if (!$scope.is_term_checked) {
      Notification.warn('请同意遵守《See购服务商日常交易行为规范》');
      return;
    }

    //必填提示不生效，不知道是不是table的问题，先直接检查
    if ($scope.formData.seller_info.seller_second_email == '') {
      Notification.warn('第二邮箱必填，请检查');
      return;
    }
    if ($scope.formData.seller_info.seller_name == '') {
      Notification.warn('联系人姓名必填，请检查');
      return;
    }
    if ($scope.formData.seller_info.seller_mobile == '') {
      Notification.warn('手机号必填，请检查');
      return;
    }

    const seller_info = $scope.formData.seller_info;

    seller_info.platform_info = _.filter($scope.platform_info, 'is_checked').map(o => {
      return {
        platform_type: o['id'],
        account_name: o['account_name'],
        account_id: o['account_id'],
        fans_count: o['fans_count'],
      };
    });

    //提交表单
    dataService.user_updateKolData({
      seller_info: JSON.stringify(seller_info),
    }).then(res => {
      Notification.success('修改信息成功');
      $location.path('/personalInfo/account');
    });
  };
}

export const modifyKolInfo: ng.IComponentOptions = {
  template: require('./modify-kol-info.template.html'),
  controller: modifyKolInfoController,
};
