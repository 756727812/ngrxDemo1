import { IDataService } from '../../services/data-service/data-service.interface';

export const eventAddGoods: ng.IComponentOptions = {
  template: require('./event-add-goods.template.html'),
  controller: eventAddGoodsController,
};

eventAddGoodsController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
export function eventAddGoodsController($scope, $location, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.cond = {};
  Object.assign($scope.cond, $routeParams);
  $scope.cond.p = $routeParams.page || 1;
  $scope.brandItem = $scope.cond.brand_name;
  $scope.items = [];
  $scope.select_items = [];
  $scope.select_items_remark = {};

  //翻页了就会重置ctrl，当前机制保存不了翻页之前的商品
  $scope.select = function (isAll) {
    $.each($scope.items, function (index, item) {
      if (isAll && $.inArray(item, $scope.select_items) == -1) {
        $scope.select_items.push(item);
      } else if (!isAll) {
        $scope.select_items.splice($.inArray(item, $scope.select_items), 1);
      }
    });
  };

  $scope.getEvent = function () {
    dataService.backend_event_getEventData({
      id: $routeParams.event_id,
    }).then(res => $scope.event = res.data);
  };
  //支持翻页
  $scope.selectItem = function (item) {
    if ($.inArray(item, $scope.select_items) != -1) {
      $scope.select_items.splice($.inArray(item, $scope.select_items), 1);
      delete $scope.select_items_remark[item['item_id']];
    } else {
      $scope.select_items.push(item);
      $scope.select_items_remark[item['item_id']] = '';
    }
  };

  $scope.queryItems = function (cond) {
    cond = cond || $scope.cond;
    dataService.item_itemList(cond).then(res => $scope.items = $scope.items.concat(res.data.list));
  };

  $scope.nextPage = function () {
    $scope.cond.p++;
    $scope.queryItems();
  };
  $scope.$watch('brandItem', function (newValue) {
    if ($.isPlainObject(newValue) || newValue == '') {
      $scope.cond.brand_id = newValue.brand_id;
      $scope.cond.brand_name = newValue.brand_name;
    }
  });
  $scope.submitSearch = function () {
    if ($scope.select_items.length > 0 && !confirm('你还有未提交的商品，你确定放弃提交吗？')) {
      return;
    }
    $scope.cond.p = 1;
    //$scope.queryEventItems($scope.cond);
    $location.search($scope.cond);
  };

  $scope.getLimit = function (limit_region, limit_brand, limit_class) {
    let result = limit_region ? ['仅限' + limit_region] : [];
    if (limit_brand) {
      let brandList = limit_brand.split(',');
      $.each(brandList, function (j, data) {
        $.each($scope.brandList, function (i, item) {
          let index = $.inArray(item.brand_id, brandList);
          if (index != -1) {
            brandList[index] = item.brand_name;
          }
        });
      });
      result.push('仅限' + brandList.join(','));
    }
    if (limit_class) {
      let classList = $.map(limit_class.split(','), function (value, index) {
        return value.split('-')[1] == 0 && (value.split('-')[0] || value.split('-')[1]) || value.split('-')[1] || value.split('-')[0];
      });

      $.each(classList, function (j, data) {
        $.each($scope.classList, function (i, item) {
          let index = $.inArray(item.class_id, classList);
          if (index != -1) {
            classList[index] = item.class_name;
          }
        });
      });
      classList.length != 0 && result.push('仅限' + classList.join(','));
    }
    return result.join(' & ');
  };

  $scope.submit = function () {
    dataService.backend_event_signupEventItem({
      event_id: $routeParams.event_id,
      item_id_array: JSON.stringify($.map($scope.select_items, function (value, key) {
        return value.item_id;
      })),
      item_remark: JSON.stringify($scope.select_items_remark),
    }).then(res => {
      Notification.success('提交成功');
      $scope.select_items.length = 0;
    });
  };

  /**
   * 查询优惠券适用的品牌和品类
   */
  $scope.getBrandAndClass = function () {
    dataService.couponmanager_getBrandAndClass().then(res => {
      $scope.brandList = res.data.brand;
      $scope.classList = res.data.class.concat(res.data.firstclass);
    });
  };
  $scope.queryItems();
  $scope.getBrandAndClass();
  $scope.getEvent();
}
