/**
 * 优惠券管理主页
 */
import { IDataService } from '../../services/data-service/data-service.interface';

export const couponList: ng.IComponentOptions = {
  template: require('./coupon-list.template.html'),
  controller: couponListController,
};

couponListController.$inject = ['$scope', '$q', '$routeParams', 'seeModal', 'dataService', '$uibModal', 'Notification'];
export function couponListController($scope, $q: ng.IQService, $routeParams, seeModal, dataService: IDataService, $uibModal, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let adminID = '',
    currentPage = $routeParams.page || 1,
    brandList = [],	// 品牌列表
    classList = [];	// 品类列表

  activate();

  function activate() {
    $q.all([getAdminUserID(), getApplyList(currentPage), getBrandAndClass()]);
  }

  Object.assign($scope, {
    type: '3',
    searchKeyword: null,
    datePicker: {
      date: {
        startDate: null,
        endDate: null,
      },
    },
    // table数据源
    couponList: [],
    bigTotalItems: 0,
    bigCurrentPage: currentPage,
  });

  Object.assign($scope, {
    // 点击通过审核按钮
    acceptApply(coupon_type) {
      seeModal.confirmP('通过审核', '确定通过审核？').then(() =>
        dataService.couponmanager_acceptApply({
          coupon_type,
          admin_u_id: adminID,
        }).then(res => {
          Notification.success();
          return getApplyList(currentPage);
        }));
    },
    // 点击拒绝按钮
    rejectApply(coupon_type, title = '拒绝通过该申请', desc = '填写拒绝理由') {
      let modalInstance = $uibModal.open({
        animation: true,
        template: require('./modal-reject-apply-coupon.html'),
        controller: 'modalRejectApplyCouponController',
        controllerAs: 'vm',
        size: 'lg',
        backdrop: 'static',
        resolve: {
          title: () => title,
          desc: () => desc,
        },
      });

      modalInstance.result.then(desc =>
        dataService.couponmanager_rejectApply({
          admin_u_id: adminID,
          coupon_type,
          desc: desc || '',
        }).then(res => {
          Notification.success();
          return getApplyList(currentPage);
        }),
      );
    },

    // 点击手动发放优惠券按钮
    sendCouponToUser(coupon_type, limit_user_num) {

      let modalInstance = $uibModal.open({
        animation: true,
        template: require('./modal-send-coupon-to-user.html'),
        controller: 'modalSendCouponToUserController',
        size: 'md',
        backdrop: 'static',
        resolve: {
          limit_user_num() {
            return limit_user_num;
          },
        },
      });

      modalInstance.result.then(function (_param) {
        let
          params = {
            coupon_type,
          },
          _list = JSON.stringify(_param.mobile_list.split('\n'));
        if (_param.type === 1) {
          Object.assign(params, { mobile_list: _list });
          dataService.couponmanager_sendCouponToUser(params).then(res => {
            Notification.success();
            return getApplyList(currentPage);
          });
        } else if (_param.type === 2) {
          Object.assign(params, { u_ids: _list });
          dataService.couponmanager_sendCouponByUid(params).then(res => {
            Notification.success();
            return getApplyList(currentPage);
          });
        }
      },                        function () {
        //
      });
    },
    // 搜索优惠券列表
    submitSearch() {
      let param = {
        p: $routeParams.page || 1,
        start_time: $scope.datePicker.date.startDate ? Date.parse($scope.datePicker.date.startDate) / 1000 : '',
        end_time: $scope.datePicker.date.startDate ? Date.parse($scope.datePicker.date.endDate) / 1000 : '',
        u_name: $scope.searchKeyword || '',
      };
      dataService.couponmanager_search(param).then(res => {
        $scope.couponList = res.data.list;
        $scope.total_items = res.data.count;
      });
    },
  });

  // 获取优惠券申请列表
  function getApplyList(page) {
    dataService.couponmanager_getApplyList({ p: page }).then(res => {
      $scope.couponList = res.data.list;
      $scope.bigTotalItems = res.data.count;
      $scope.total_items = res.data.count;
    });
  }

  // 获取品牌和品类
  function getBrandAndClass() {
    dataService.couponmanager_getBrandAndClass().then(res => {
      brandList = res.data.brand;
      classList = res.data.firstclass.map(function (firstClassItem) {
        return Object.assign(firstClassItem, {
          subClass: res.data.class.filter(function (item) {
            return item.parent_id == firstClassItem.class_id;
          }),
        });
      });
    });
  }

  // 获取当前操作管理员的用户ID
  function getAdminUserID() {
    dataService.seller_getSellerDetail().then(res => adminID = res.data.user_info.u_id);
  }

}
