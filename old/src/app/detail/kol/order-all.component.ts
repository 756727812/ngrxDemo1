import * as angular from 'angular'

orderAllController.$inject = ['$scope', '$routeParams', '$location', '$filter', '$timeout', 'dataService'];
export function orderAllController($scope, $routeParams, $location, $filter, $timeout, dataService) {
  const $ctrl = this;

  $ctrl.list_seller_email = [];
  $ctrl.list_ship_country = [];
  $ctrl.list_order_type = [];

  $ctrl.no_dd = $routeParams.no_dd || 0;

  $scope.searchForm = {
    kol_select: $routeParams.kol_select,
    ship_country: $routeParams.ship_country,
    order_type: $routeParams.order_type,
    datePicker: {
      startDate: null,
      endDate: null
    }
  };

  $scope.locationFilter = function(_type) {
    $location.search({
      area: _type
    })
  };
  $scope.locationMark = function(_type) {
    $location.search({
      is_mark_star: _type
    })
  };

  function init() {
    getKolOrderFilter();
    const page = $routeParams.page || 1;
    const status = $routeParams.is_mark_star;
    $scope.orderText = (function(_) {
      return _ == 1 && '星标订单' || _ == 0 && '所有订单'
    }($routeParams.is_mark_star));
    const params = { page, page_size: 20 };
    if ($routeParams.filter_info) {
      params['filter_info'] = $routeParams.filter_info;
      $scope.searchForm.filter = JSON.parse(params['filter_info']);
      $scope.searchForm.datePicker.startDate = JSON.parse(params['filter_info']).buy_time_s || '';
      $scope.searchForm.datePicker.endDate = JSON.parse(params['filter_info']).buy_time_e || '';
    }
    dataService.kol_getKolOrderList(params).then(res => {
      angular.forEach(res.data.list, function(order) {
        if (order.order_list[0].length > 0) {
          order.order_list[0].comments = order.order_list[0].comments.replace(/\s+/g, '')
        }
      })
      //$scope.searchForm.filter["ship_country"]="美国";
      $scope.Order = res.data.list;
      $scope.total_items = res.data.count
      $scope.$emit('orderCount', res.data.count)
      $timeout(function() {
        (<any>(<any>$.fn)).editable.defaults.mode = 'inline';
        (<any>$('.editable')).editable();
      })
    })
  }

  function getKolOrderFilter() {
    //dd时间段内，因为不可见某些数据，对这个特殊处理。
    let param = { no_dd: 0 };
    if ($routeParams.no_dd == '1') {
      param = { no_dd: 1 };
    }
    dataService.kol_getKolOrderFilter(param).then(function(res) {
      //删除账号过滤
      $ctrl.list_seller_email = res.data.seller_email;
      delete (res.data.seller_email)
      delete ($ctrl.list_seller_email[0])

      $ctrl.list_ship_country = res.data.ship_country;
      delete (res.data.ship_country)
      delete ($ctrl.list_ship_country[0])

      $ctrl.list_order_type = res.data.class_type;
      delete (res.data.class_type)
      delete ($ctrl.list_order_type[0])
      delete ($ctrl.list_order_type[4])

      $scope.OrderFilter = res.data
    })
  }
  //订单搜索功能
  $scope.submitSearchOrder = function() {
    const param = {};
    const filter = $scope.searchForm.filter || {};
    filter.seller_email = '';
    filter.ship_country = '';
    filter.class_type = '';
    angular.forEach($ctrl.list_seller_email, function(data) {
      angular.forEach($scope.searchForm.kol_select, function(data_set) {
        if (data_set == data.value) {
          if (filter.seller_email != '') {
            filter.seller_email += ',';
          }
          filter.seller_email += data.key;
        }
      });
    });

    angular.forEach($scope.searchForm.ship_country, function(data) {
      if (filter.ship_country != '') {
        filter.ship_country += ',';
      }
      filter.ship_country += data;
    });

    angular.forEach($ctrl.list_order_type, function(data) {
      angular.forEach($scope.searchForm.order_type, function(data_set) {
        if (data_set == data.value) {
          if (filter.class_type != '') {
            filter.class_type += ',';
          }
          filter.class_type += data.key;
        }
      });
    });

    const page = $routeParams.page || 1;
    if ($scope.searchForm.datePicker.startDate) {
      filter.buy_time_s = $scope.searchForm.datePicker.startDate ? Date.parse($scope.searchForm.datePicker.startDate._d) : '';
      filter.buy_time_e = $scope.searchForm.datePicker.endDate ? Date.parse($scope.searchForm.datePicker.endDate._d) : '';
    }
    if (!angular.equals({}, filter)) {
      param['filter_info'] = JSON.stringify(filter);
    }
    param['kol_select'] = $scope.searchForm.kol_select;
    param['ship_country'] = $scope.searchForm.ship_country;
    param['order_type'] = $scope.searchForm.order_type;
    // param.location = $scope.location;
    param['page'] = 1;
    param['page_size'] = 20;
    param['no_dd'] = $routeParams.no_dd;
    //delete param.datePicker;
    $location.search(param);

  }

  // 商家搜索
  $scope.adminSearchData = {};
  $scope.submitSearchSellerOrder = function() {
    $location.search({
      seller_email: $scope.adminSearchData.seller_email,
    })

  };

  //星标
  $scope.markStar = function(id, type) {
    const param = {
      mid_order_id: id,
      is_mark_star: type
    };
    dataService.orderv2_setMarkStar(param).then(res => init())
  }

  // (function () {
  if ($routeParams.keyword || $routeParams.startDate || $routeParams.endDate) {
    $scope.searchForm.searchKeyword = $routeParams.keyword;
    $scope.searchForm.datePicker.startDate = $routeParams.startDate;
    $scope.searchForm.datePicker.endDate = $routeParams.endDate;
    // basicSearch();
  } else if ($routeParams.seller_email) {
    $scope.adminSearchData.seller_email = $routeParams.seller_email;
    // $scope.submitSearchSellerOrder();
    if ($scope.adminSearchData.seller_email) {
      const page = $routeParams.page || 1;
      const param = {
        seller_email: $scope.adminSearchData.seller_email,
        type: 0,
        p: page
      }
      dataService.orderv2_searchSellerOrder(param).then(function(res) {
        $scope.Order = res.data.list;
        $scope.total_items = res.data.count
        $scope.$emit('orderCount', res.data.count)
      })
    }
  } else {
    $ctrl.$onInit = init();
  }
  // } ())

  //导出数据
  $scope.exportOrderData = function() {
    const param = {};
    let url = '/api/kol/exportKolOrderList';
    if ($routeParams.filter_info) {
      url = url + "?filter_info=" + $routeParams.filter_info;
    }
    window.open(url);
  };
  $scope.gologistics = function(order_id) {
    $location.path('/order/detail/' + order_id + '/1');
  };
}

export const orderAll: ng.IComponentOptions = {
  template: require('./order-all.template.html'),
  controller: orderAllController
}


