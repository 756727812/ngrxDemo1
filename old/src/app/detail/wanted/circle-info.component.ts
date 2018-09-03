/**
 * 我的圈子
 */

import * as angular from 'angular';
export const circleInfo = {
  controller: circleInfoController,
  template: require('./circle-info.template.html')
}

circleInfoController.$inject = ['$scope', '$location', '$routeParams', '$cookies', '$timeout', 'Notification', 'seeModal', 'dataService'];
function circleInfoController($scope, $location, $routeParams, $cookies, $timeout, Notification, seeModal, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const
    cir_id = $scope.cir_id = $routeParams.cir_id,
    page = $routeParams.page || 1;

  $scope.hash = $location.hash() || 'kejian';

  $scope.$on('transfer.cirDetail', function(e, data) {
    $scope.circle = data;
  });

  $scope.jumpToRegCircle = function() {
    $location.path('/wanted/myCircle/registerCircle');
  };

  /**
   * 隐藏可见心愿
   */
  $scope.delThemeFromCircle = function(t_id) {
    seeModal.confirm('隐藏', '你确定隐藏该心愿吗？', function() {
      return dataService.circle_delCircleThemeRelation({
        cir_id,
        t_id,
      }).then(function() {
        return getThemeData();
      })
    })
  };

  /**
   * 删除合集
   */
  $scope.delCollectionFromCircle = function(collection_id) {
    seeModal.confirm('删除合集', '你确定删除吗？', function() {
      return dataService.circle_delCollection({
        collection_id
      }).then(function(res) {
        return getCircleCollection()
      })
    })
  };

  // 设置小合集显示/隐藏
  $scope.setMiniColPublic = function(id, type) {
    const params = {
      mcol_id: id,
      value: type
    };
    dataService.collection_setMiniColPublic(params).then(res => {
      Notification.success()
      return init()
    })
  };

  // 删除小合集
  $scope.delMiniCollection = function(_id) {
    seeModal.confirm('删除小合集', '你确定删除吗?', function() {
      dataService.collection_setMiniColPublic({
        mcol_id: _id,
        value: 0
      }).then(res => {
        Notification.success()
        return getMiniCollectionList()
      })
    })
  }

  // 我的心愿
  $scope.searchData = {
    'from': $routeParams.from,
    to: $routeParams.to,
    cy_id: $routeParams.cy_id,
    keyword: $routeParams.keyword,
  };
  // 搜索我的心愿
  $scope.searchTheme = function() {
    $location.search(angular.extend({}, $location.search(), $scope.searchData));
  };

  // 圈子信息（编辑)
  $scope.formData = {};

  $scope.editCircle = function() {
    return dataService.circle_saveCircle($scope.formData).then(function(res) {
      Notification.success('修改成功！')
      return getCircleDetail();
    });
  };
  $scope.uploadBanner = function(data) {
    if (data.result == 1) {
      $scope.formData.cir_banner = data.data;
      $scope.formData.banner = data.data;
    }
  };
  $scope.uploadLogo = function(data) {
    if (data.result == 1) {
      $scope.formData.cir_logo = data.data;
      $scope.formData.logo = data.data;
    }
  };

  const init = function() {
    checkCircleBindAccount(cir_id);
    if (!$location.hash() && $cookies.get('seller_privilege') == '21') {
      $location.hash('topic')
    }
    checkSellerCircle($routeParams.cir_id);
    getCircleOwner($routeParams.cir_id);
    switch ($scope.hash) {
      case 'kejian':
        getThemeData();
        break;
      case 'smallCollection':
        getMiniCollectionList(page);
        break;
      case 'collection':
        getCircleCollection();
        break;
      case 'myTheme':
        getMyTheme();
        break;
      case 'sale':
        getCircleSaleCondition(cir_id);
        break;
      case 'circle':
        getCircleDetail();
        break;
      case 'topicSale':
        getTopicSaleListWeekly(page);
        break;
      case 'billHistory':
        getSettleHistoryBills(page);
        break;
      default:
        return;
    }
    if ($scope.hash === 'topicSale' || $scope.hash === 'billHistory') getBillStatData();
  };

  function checkSellerCircle(cir_id) {
    dataService.circle_checkSellerCircle({
      cir_id
    }).then(res => { }, err => $location.path('/wanted/myCircle'))
  }

  function getCircleOwner(cir_id) {
    dataService.circle_getCircleOwner({
      cir_id
    }).then(res => $scope.cir_owner = res.data)
  }

  /**
   * 可见心愿列表
   */
  function getThemeData() {
    dataService.circle_getThemeBycircle({
      cir_id,
      p: page
    }).then(res => $scope.themeList = res.data);
    dataService.circle_getCircleThemeCount({
      cir_id
    }).then(res => $scope.total_items = res.data);
  }

  function getMiniCollectionList(_page: number = 1) {
    dataService.collection_miniCollectionByCirid({
      p: _page,
      cir_id: $routeParams.cir_id
    }).then(res => {
      $scope.miniCollectionList = res.data.data;
      $scope.total_items = res.data.total_page;
    })
  }

  function getCircleCollection() {
    dataService.wanted_getCircleCollection({ cir_id }).then(res => $scope.collectionList = res.data)
  }

  /**
   * 获取我的心愿
   */
  function getMyTheme() {
    const page = $routeParams.page || 1;
    const params = [];
    params['p'] = page;
    params['keyword'] = $routeParams.keyword;
    params['from'] = $routeParams.from;
    params['to'] = $routeParams.to;
    params['cy_id'] = $routeParams.cy_id;

    if ($routeParams.cir_id) {
      params['cir_id'] = $routeParams.cir_id;
      dataService.wanted_getCircleOwnerTheme(params).then(res => {
        $scope.themeList = res.data.themes;
        $scope.s_id = res.data.seller_id;
        $scope.host = res.data.http_host;
        $scope.total_items = res.data.count;
      })
    } else {
      dataService.wanted_getSellerTheme(params).then(res => {
        $scope.themeList = res.data.themes;
        $scope.s_id = res.data.seller_id;
        $scope.host = res.data.http_host;
        $scope.total_items = res.data.count;
      })
    }

    dataService.wanted_getAllCategory().then(res => $scope.categoryList = res.data)
  }

  function getCircleSaleCondition(cir_id) {
    dataService.circle_getCircleSaleCondition({ cir_id }).then(function(res) {
      console.log(res);
      $scope.orderList = res.data;
    });
  }

  /**
   * 圈子信息
   */
  function getCircleDetail() {
    dataService.wanted_getCircleDetail({ cir_id }).then(res => {
      $scope.formData = res.data;

      $scope.$emit('transfer.cirDetail', {
        'cir_id': $scope.formData.cir_id,
        'cir_name': $scope.formData.cir_name
      });
    });
  }

  /**
   * 本周专题销售情况
   */
  function getTopicSaleListWeekly(p) {
    dataService.pgc_settle_getBillTopicList({
      cir_id,
      p
    }).then(res => {
      $scope.topicList = res.data.list;
      $scope.total_items = res.data.count;
    })
  }

  /**
   * 结算历史账单
   */
  function getSettleHistoryBills(p) {
    dataService.pgc_settle_getHistoryBillList({
      cir_id,
      p
    }).then(res => {
      $scope.billList = res.data.list;
      $scope.total_items = res.data.count;
    })
  }

  /**
   * 获取本周结算金额统计
   */
  function getBillStatData() {
    dataService.pgc_settle_getBillStatData({
      cir_id
    }).then(res => angular.extend($scope, res.data))
  }

  function checkCircleBindAccount(cir_id) {
    dataService.pgc_settle_checkCircleBindAccount({
      cir_id
    }).then(res => $scope.isBinded = res.data.is_bind === 1)
  }

  init();
}



