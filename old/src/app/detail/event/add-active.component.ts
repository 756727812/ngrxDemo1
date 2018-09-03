import { IDataService } from '../../services/data-service/data-service.interface';

export const addActive: ng.IComponentOptions = {
  template: require('./add-active.template.html'),
  controller: addActiveController,
};

addActiveController.$inject = ['$scope', '$q', '$location', '$routeParams', 'dataService', 'Notification'];
export function addActiveController($scope, $q: ng.IQService, $location, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let adminID = '',
    toUpdateCouponType = $location.search().coupon_type || '',	//  判断是不是跟新优惠券
    toUpdateCoupon = {};
  $scope.class_list = [{}];
  $scope.brand_list = [{}];
  Object.assign($scope, {
    apply_date: {
      date: {
        startDate: null,
        endDate: null,
      },
    },
    release_date: {
      date: {
        startDate: null,
        endDate: null,
      },
    },
  });

  $scope.cancel = function () {
    history.go(-1);
  };
  $scope.addOneBrand = function (brand, action) {
    if (action == '-') {
      $.each($scope.brand_list, function (index, obj) {
        if (obj == brand) {
          $scope.brand_list.splice($.inArray(brand, $scope.brand_list), 1);
          return false;
        }
      });
      return;
    }
    $scope.brand_list.push({});
  };

  $scope.addOneClass = function (clz, action) {
    if (action == '-') {
      $.each($scope.class_list, function (index, obj) {
        if (obj.selectedClass1 == clz.selectedClass1 && obj.selectedSubClass1 == clz.selectedSubClass1) {
          $scope.class_list.splice($.inArray(clz, $scope.class_list), 1);
          return false;
        }
      });
      return;
    }
    if (action == '+' && !clz.selectedSubClass1) {
      Notification.warn('请选择类别');
      return;
    }
    $scope.class_list.push({});
  };

  $scope.submitForm = function ($valid) {
    if (!$valid) {
      Notification.warn('请检查信息是否填写完整');
      return false;
    }
    if ($scope.apply_date.date.endDate > $scope.release_date.date.startDate) {
      Notification.warn('报名时间不能晚于活动时间');
      return false;
    }

    if ($scope.checkClass1 && $scope.class_list) {
      for (let i = 0; i < $scope.class_list.length; i++) {
        if (!$scope.class_list[i].selectedSubClass1) {
          Notification.warn('请选择子类别');
          return;
        }
      }
    }

    let data = {
      set_id: $scope.set_id,
      event_name: $scope.event_name,
      active_start_time: $scope.release_date ? Date.parse($scope.release_date.date.startDate) / 1000 : '',
      active_end_time: $scope.release_date ? Date.parse($scope.release_date.date.endDate) / 1000 : '',
      signup_start_time: $scope.apply_date ? Date.parse($scope.apply_date.date.startDate) / 1000 : '',
      signup_end_time: $scope.apply_date ? Date.parse($scope.apply_date.date.endDate) / 1000 : '',
      limit_region: $scope.active_local ? $.map($scope.active_local, function (value, key) {
        if (value) return key;
      }).join(',') : '',
      limit_class: $scope.checkClass1 ? $.map($scope.class_list, function (value, key) {
        if (value.selectedClass1 && value.selectedSubClass1) return value.selectedClass1.class_id + '-' + value.selectedSubClass1.class_id;
      }).join(',') : null,
      limit_brand: $scope.checkBrand1 ? $.map($scope.brand_list, function (value, key) {
        if (value.selectedBrand1) return value.selectedBrand1.brand_id;
      }).join(',') : null,
    };
    dataService.backend_event_addEvent(data).then(res => {
      Notification.success('添加活动成功！');
      $location.url('/event/active-list');
    });
  };

  $q.all([getConfigLocation(), getEventSetList(), getBrandAndClass(toUpdateCouponType)]);

  function getConfigLocation() {
    dataService.CommonData_getConfigLocation().then(res => {
      $scope.countryList = res.data;
      $scope.active_local = {};
      for (let i in $scope.countryList) {
        $scope.active_local[$scope.countryList[i]] = false;
      }
    });
  }

  function getEventSetList() {
    dataService.backend_event_getEventSetList().then(res => $scope.sets = res.data.event_sets);
  }

  /**
   * 查询优惠券适用的品牌和品类
   * @param toUpdateCouponTypeArg  优惠券唯一标识
   */
  function getBrandAndClass(toUpdateCouponTypeArg) {
    dataService.couponmanager_getBrandAndClass().then(res => {
      $scope.brandList = res.data.brand;
      $scope.classList = res.data.firstclass.map(function (firstClassItem) {
        return Object.assign(firstClassItem, {
          // 增加'全部'选项
          subClass: [{
            class_id: '0',
            class_name: '全部',
            parent_id: firstClassItem.class_id,
          }].concat(res.data.class.filter(function (item) {
            return item.parent_id == firstClassItem.class_id;
          })),
        });
      });
      if (toUpdateCouponTypeArg) {
        //TO-DO 这一对要处理
        // getApplyInfo(toUpdateCouponTypeArg);
      }
    });
  }
}
