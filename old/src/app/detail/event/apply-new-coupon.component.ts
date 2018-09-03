import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular';
import * as moment from 'moment';

export const applyNewCoupon: ng.IComponentOptions = {
  template: require('./apply-new-coupon.template.html'),
  controller: applyNewCouponController
}

applyNewCouponController.$inject = ['$scope', '$location', '$cookies', 'dataService', 'Notification', 'seeModal'];
export function applyNewCouponController($scope, $location, $cookies, dataService: IDataService, Notification, seeModal) {
  const $ctrl = this;
  let adminID = '', countBrand = 0, countClass = 0, totalCount = 0, toUpdateCouponType = $location.search().coupon_type || '', toUpdateCoupon = {};
  $ctrl.is_c2c = $cookies.get('seller_privilege') === '1' || $cookies.get('seller_privilege') === '30';
  Object.assign($ctrl, {
    brandList: [],// 品牌列表
    classList: [],// 品类列表
    kolSellerList: [],//kol账号
    datePicker: {
      date: {
        startDate: null,//$ctrl.is_c2c ? moment('2016-12-21 00:00:00') : null,
        endDate: null,//$ctrl.is_c2c ? moment('2016-12-23 23:59:59') : null
      }
    },
    type: '3',
    selectedDaijinquan: null,
    coupon_price_start: null,
    coupon_price_end: null,
    limit_money: null,
    limit_per: 1,
    show_error: false,
    allow_limit_per: true,
    checkKolSeller: false,
    selectedKol: null,
    checkBrand1: false,
    checkClass1: false,
    NO2Class: false,
    NO3Class: false,
    NO2Brand: false,
    NO3Brand: false,
    selectedBrand2: null,
    selectedBrand3: null,
    selectedClass2: null,
    selectedClass3: null,
    radio_check: {
      limit_user_num: -1,
    },
    showErr: null,
    allFullCutList: [
      {
        limit_money: 100,
        coupon_price_start: 10
      }
    ]
  });
  $scope.$watch('$ctrl.checkBrand1', function(newValue) {
    if (newValue) {
      countBrand++;
      totalCount = countBrand + countClass;
      //$("#checkboxForClass").attr('disabled', 'false');
    } else {
      countBrand = 0;
      $ctrl.NO2Brand = false;
      $ctrl.NO3Brand = false;

      totalCount = countBrand + countClass;
      $("#checkboxForClass").removeAttr('disabled');
    }

  });
  $scope.$watch('$ctrl.checkClass1', function(newValue) {
    if (newValue) {
      countClass++;
      totalCount = countBrand + countClass;
      //$("#checkboxForBrand").attr('disabled', 'false');
    } else {
      countClass = 0;
      $ctrl.NO2Class = false;
      $ctrl.NO3Class = false;
      totalCount = countBrand + countClass;
      $("#checkboxForBrand").removeAttr('disabled');
    }
  });
  Object.assign($ctrl, {
    changeType() {
      $ctrl.coupon_price_start = null;
      $ctrl.coupon_price_end = null;
      $ctrl.limit_money = null;
    },
    addOneClass() {
      if (totalCount >= 3) {
        totalCount = 3;
        Notification.warn('品类与品牌限制条件最多三个!');
        return;
      }
      countClass++;
      totalCount++;
      if (totalCount == 3 || totalCount == 2) {
        if (!$ctrl.NO2Class) {
          $ctrl.NO2Class = true;
        }
        else if ($ctrl.NO2Class && totalCount == 3) {
          $ctrl.NO3Class = true;
        }
      }
      if (countClass === 3 && !$ctrl.checkBrand1 && $ctrl.checkClass1) {
        $("#checkboxForBrand").attr('disabled', 'true');
      }
    },
    addOneBrand() {
      if (totalCount >= 3) {
        totalCount = 3;
        Notification.warn('品类与品牌限制条件最多三个!');
        return;
      }
      countBrand++;
      totalCount++;
      if (totalCount == 3 || totalCount == 2) {
        if (!$ctrl.NO2Brand) {
          $ctrl.NO2Brand = true;
        }
        else if ($ctrl.NO2Brand && totalCount == 3) {
          $ctrl.NO3Brand = true;
        }
      }
      if (countBrand === 3 && $ctrl.checkBrand1 && !$ctrl.checkClass1) {
        $("#checkboxForClass").attr('disabled', 'true');
      }
    },
    deleteOneClass(flag) {
      flag == 2 ? $ctrl.NO2Class = false : $ctrl.NO3Class = false;
      countClass--;
      totalCount--;

      if (totalCount < 3) {
        $("#checkboxForClass").removeAttr('disabled');
        $("#checkboxForBrand").removeAttr('disabled');
      }
    },
    deleteOneBrand(flag) {
      flag == 2 ? $ctrl.NO2Brand = false : $ctrl.NO3Brand = false;
      countBrand--;
      totalCount--;

      if (totalCount < 3) {
        $("#checkboxForClass").removeAttr('disabled');
        $("#checkboxForBrand").removeAttr('disabled');
      }
    },
    submitApply() {
      if (!$ctrl.activity_desc) {
        $ctrl.showErr = '请填写优惠券用途!';
        $ctrl.hasErr = '1';
        return -1;
      }
      else if (!$ctrl.type) {
        $ctrl.showErr = '请选择优惠券类型!';
        $ctrl.hasErr = '2';
        return -1;
      }
      if (!$ctrl.is_c2c) {
        if ($ctrl.type == 1 && (!$ctrl.coupon_price_start || ($ctrl.selectedDaijinquan == 2 && !$ctrl.coupon_price_end))) {
          $ctrl.showErr = '请填写代金券金额!';
          return -1;
        }
        if ($ctrl.type == 2 && (!$ctrl.limit_money || !$ctrl.coupon_price_start)) {
          $ctrl.showErr = '请填写满减券金额!';
          return -1;
        }
        if ($ctrl.type == 3 && (!$ctrl.allFullCutList[0].limit_money || !$ctrl.allFullCutList[0].coupon_price_start)) {
          $ctrl.showErr = '请填写满减券金额!';
          console.warn(!$ctrl.allFullCutList[0].limit_money || !$ctrl.allFullCutList[0].coupon_price_start);
          console.warn(!$ctrl.allFullCutList[0].limit_money);
          console.warn(!$ctrl.allFullCutList[0].coupon_price_start);
          return -1;
        }
        if ($ctrl.type == 3 && (!$ctrl.coupon_title)) {
          $ctrl.showErr = '请填写优惠券描述!';
          return -1;
        }
        if ($ctrl.type != 3 && !$ctrl.radio_check.limit_user_num) {
          $ctrl.showErr = '请选择优惠券数量!';
          return -1;
        }
      }
      if (!$ctrl.datePicker.date.startDate || !$ctrl.datePicker.date.endDate) {
        $ctrl.showErr = '请选择优惠券有效日期!';
        return -1;
      }
      else {
        $ctrl.showErr = null;
        $ctrl.is_loading = true;
        const param = {
          type: $ctrl.type,
          activity_desc: $ctrl.activity_desc,
          backend_u_id: adminID,
          limit_per: $ctrl.allow_limit_per ? $ctrl.limit_per : '',
          limit_user_num: $ctrl.type == 3 ? -2 : $ctrl.radio_check.limit_user_num == '-3' ? $ctrl.limit_user_num_equal_minus3 : $ctrl.radio_check.limit_user_num,
          coupon_price_start: $ctrl.coupon_price_start,
          coupon_price_end: $ctrl.type == 2 ? $ctrl.coupon_price_start : $ctrl.selectedDaijinquan == 1 ? $ctrl.coupon_price_start : $ctrl.coupon_price_end,
          begin_time: Date.parse($ctrl.datePicker.date.startDate) / 1000,
          end_time: Date.parse($ctrl.datePicker.date.endDate) / 1000,
          limit_money: $ctrl.type == 1 ? 0 : $ctrl.limit_money,
          limit_backend: $ctrl.selectedKol ? $ctrl.selectedKol.id : 0,
          limit_brand: $ctrl.selectedBrand1 ? $ctrl.selectedBrand1.brand_id : '',
          limit_class: $ctrl.selectedSubClass1 ? $ctrl.selectedSubClass1.parent_id + '-' + $ctrl.selectedSubClass1.class_id : $ctrl.selectedClass1 ? $ctrl.selectedClass1.class_id + '-0' : '',
          limit_param: JSON.stringify($ctrl.allFullCutList),
          coupon_title: $ctrl.coupon_title
        };

        if (!$ctrl.checkKolSeller) {
          param.limit_backend = 0;
        }

        if ($ctrl.NO2Brand && $ctrl.selectedBrand2) {
          param.limit_brand += (',' + $ctrl.selectedBrand2.brand_id);
        }
        if ($ctrl.NO3Brand && $ctrl.selectedBrand3) {
          param.limit_brand += (',' + $ctrl.selectedBrand3.brand_id);
        }
        if ($ctrl.NO2Class && $ctrl.selectedClass2) {
          param.limit_class += (',' + ($ctrl.selectedSubClass2 ? $ctrl.selectedSubClass2.parent_id + '-' + $ctrl.selectedSubClass2.class_id : $ctrl.selectedClass2 ? $ctrl.selectedClass2.class_id + '-0' : ''));
        }
        if ($ctrl.NO3Class && $ctrl.selectedClass3) {
          param.limit_class += (',' + ($ctrl.selectedSubClass3 ? $ctrl.selectedSubClass3.parent_id + '-' + $ctrl.selectedSubClass3.class_id : $ctrl.selectedClass3 ? $ctrl.selectedClass3.class_id + '-0' : ''));
        }

        if (!$ctrl.checkBrand1) {
          param.limit_brand = '';
        }
        if (!$ctrl.checkClass1) {
          param.limit_class = '';
        }

        if ($ctrl.is_c2c) {
          param['filter_items'] = $ctrl.filter_items;
          return dataService.couponmanager_newApplyWithSeller(param).then(function(res) {
            Notification.success('优惠券申请成功！');
            return getSellerCoupon();
          }).finally(function() {
            $ctrl.is_loading = false;
          });
        }
        else {
          dataService.couponmanager_newApply(param)
            .then(res => $location.path("/event/couponv1"))
            .finally(() => $ctrl.is_loading = false)
        }
      }
    },
    addOneAllFullCut() {
      $ctrl.allFullCutList.push({
        limit_money: '',
        coupon_price_start: ''
      });
    },
    delOneAllFullCut(index) {
      $ctrl.allFullCutList.splice(index, 1);
    },
    $onInit: activate,
  });
  function activate() {
    getAdminUserID();
    !$ctrl.is_c2c && getBrandAndClass(toUpdateCouponType);
    !$ctrl.is_c2c && getKolSellerList();
    $ctrl.is_c2c && getSellerCoupon()
  }

  function getSellerCoupon() {
    return dataService.couponmanager_getApplyListWithSeller().then(function(res) {
      $ctrl.seller_coupon_count = res.data.list.length;
      $ctrl.working_coupon_count = res.data.list.filter(function(o) {
        return o.status === '1';
      }).length;
      $ctrl.seller_coupon_count === 4 && seeModal.confirm('注意', '不能申请超过4张券哦~');
    });
  }

  function getAdminUserID() {
    dataService.seller_getSellerDetail().then(res => adminID = res.data.user_info.u_id)
  }

  function getBrandOrClassObjById(type, ListItem, isParent?) {
    isParent = typeof isParent !== 'undefined' ? isParent : true;
    if (type === 1 && angular.isString(ListItem)) {
      return $ctrl.brandList.filter(function(item) {
        return item.brand_id == ListItem;
      })[0];
    }
    else if (type === 2 && angular.isArray(ListItem)) {
      const parentClass = $ctrl.classList.filter(function(item) {
        return item.class_id == ListItem[0];
      })[0];
      if (isParent) {
        return parentClass;
      }
      else {
        return parentClass.subClass.filter(function(item) {
          return item.class_id == ListItem[1];
        })[0];
      }
    }
    else {
      return -1;
    }
  }

  /**
   * 根据返回的参数的id查找品牌/品类对象填充
   * @param type 1:品牌  2:品类
   * @param id 要查找的id
   * @returns {*}
   */
  function getSelectKol(ListItem) {
    return $ctrl.kolSellerList.filter(function(item) {
      if (item.id == ListItem) {
        return item;
      }
    })[0]
  }

  /**
   * 根据优惠券coupon_type查询优惠券信息,并填充表单
   * @param couponType
   */
  function getApplyInfo(couponType) {
    dataService.couponmanager_getApplyInfo({ coupon_type: couponType }).then(res => {
      toUpdateCoupon = res.data;
      if (toUpdateCoupon['limit_backend'] > 0) {
        $ctrl.selectedKol = getSelectKol(toUpdateCoupon['limit_backend']);
        $ctrl.checkKolSeller = true
      }
      const brandArr = toUpdateCoupon['limit_brand'] ? toUpdateCoupon['limit_brand'].split(',') : '';
      const classArr = toUpdateCoupon['limit_class'] ? toUpdateCoupon['limit_class'].split(',').map(function(item) {
        return item.split('-')
      }) : '';
      if (brandArr) {
        $ctrl.checkBrand1 = true;
        $ctrl.selectedBrand1 = getBrandOrClassObjById(1, brandArr[0]);
        if (brandArr.length >= 2) {
          $ctrl.NO2Brand = true;
          $ctrl.selectedBrand2 = getBrandOrClassObjById(1, brandArr[1]);
        }
        if (brandArr.length === 3) {
          $ctrl.NO3Brand = true;
          $ctrl.selectedBrand3 = getBrandOrClassObjById(1, brandArr[2]);
        }
      }
      if (classArr) {
        $ctrl.checkClass1 = true;
        $ctrl.selectedClass1 = getBrandOrClassObjById(2, classArr[0]);
        $ctrl.selectedSubClass1 = getBrandOrClassObjById(2, classArr[0], false);
        if (classArr.length >= 2) {
          $ctrl.NO2Class = true;
          $ctrl.selectedClass2 = getBrandOrClassObjById(2, classArr[1]);
          $ctrl.selectedSubClass2 = getBrandOrClassObjById(2, classArr[1], false);
        }
        if (classArr.length === 3) {
          $ctrl.NO3Class = true;
          $ctrl.selectedClass3 = getBrandOrClassObjById(2, classArr[2]);
          $ctrl.selectedSubClass3 = getBrandOrClassObjById(2, classArr[2], false);
        }
      }
      Object.assign($ctrl, {
        activity_desc: toUpdateCoupon['activity_desc'],
        type: toUpdateCoupon['type'],
        coupon_price_start: Number(toUpdateCoupon['coupon_price_start']),
        coupon_price_end: Number(toUpdateCoupon['coupon_price_end']),
        selectedDaijinquan: toUpdateCoupon['coupon_price_start'] === toUpdateCoupon['coupon_price_end'] ? 1 : 2,
        limit_money: +toUpdateCoupon['limit_money'],
        radio_check: {
          limit_user_num: +toUpdateCoupon['limit_user_num'] > 0 ? -3 : +toUpdateCoupon['limit_user_num'],
        },
        limit_user_num_equal_minus3: +toUpdateCoupon['limit_user_num'] > 0 ? +toUpdateCoupon['limit_user_num'] : '',
        limit_per: +toUpdateCoupon['limit_per'],
        allow_limit_per: toUpdateCoupon['limit_per'] > 0,
        datePicker: {
          date: {
            startDate: moment.unix(toUpdateCoupon['begin_time']),
            endDate: moment.unix(toUpdateCoupon['end_time'])
          }
        }
      });
    })
  }

  function getBrandAndClass(toUpdateCouponTypeArg) {
    dataService.couponmanager_getBrandAndClass().then(res => {
      if (!res.data.brand) {
        return;
      }
      $ctrl.brandList = res.data.brand;
      $ctrl.classList = res.data.firstclass.map(function(firstClassItem) {
        return Object.assign(firstClassItem, {
          subClass: [{
            class_id: '0',
            class_name: '全部',
            parent_id: firstClassItem.class_id
          }].concat(res.data.class.filter(function(item) {
            return item.parent_id == firstClassItem.class_id;
          }))
        });
      });
      if (toUpdateCouponTypeArg) {
        getApplyInfo(toUpdateCouponTypeArg);
      }
    });
  }

  /**
   * 获取kol账号列表
   */
  function getKolSellerList() {
    dataService.kol_mgr_configSellerList().then(res => $ctrl.kolSellerList = res.data.list_seller)
  }

}
