import * as angular from 'angular';

export const themeClassified = {
  controller: themeClassifiedController,
  template: require('./theme-classified.template.html')
}

themeClassifiedController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'ngDialog', '$timeout', 'Notification', 'seeModal'];
function themeClassifiedController($scope, $routeParams, $location, dataService, ngDialog, $timeout, Notification, seeModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const version = +new Date();
  let curType, currentPage = $routeParams.page;
  angular.extend($scope, {
    tabs: [{
      type: 4,
      title: 'iOS用户',
      count: 0
    }, {
      type: 1,
      title: '购买用户',
      count: 0
    }, {
      type: 2,
      title: '多天多次发心愿用户',
      count: 0
    }, {
      type: 3,
      title: '一天内多次发心愿用户',
      count: 0
    },

    {
      type: 5,
      title: 'Android用户',
      count: 0
    }
    ],

    /**
     * 获取列表数据
     * @param _type 分类类型
     */
    filterByType(_type) {
      curType = _type;
      $scope.currentPage = 1;
      getClassifiedTheme(_type, 1)
    },
    pageChanged() {
      getClassifiedTheme(curType, $scope.currentPage)
    },
    //匹配答案弹框
    matchImgPop(t_id, t_imgurl, s_id, host) {
      const page = $routeParams.page || 1;
      $scope.dialog = ngDialog.open({
        template: 'detail/wanted/matchImg.popup.html?v=' + version,
        className: 'ngdialog-theme-default ngdialog-theme-sendGoods'
      });
      const temp = "t_imgurl=" + t_imgurl + "&page=" + page + "&s_id=" + s_id + "&t_id=" + t_id + "&host=" + host;
      $location.url("/wanted/themeClassified?" + temp);
    },
    /**
     * 从发现流中全局隐藏指定心愿
     * @param id 心愿ID
     */
    hideMe(t_id) {
      seeModal.confirmP('隐藏', '你确定执行此操作？')
        .then(res => $scope.filterByType(curType))
    }
  })

  function getClassifiedTheme(_type, _page) {
    /** 获取分类计数 - deprecated */
    // dataService.wanted_getUserThemeLayerCount().then(res => {
    //   $scope.tabs[0].count = res.data.user_layer_4;
    //   $scope.tabs[1].count = res.data.user_layer_1;
    //   $scope.tabs[2].count = res.data.user_layer_2;
    //   $scope.tabs[3].count = res.data.user_layer_3;
    //   $scope.tabs[4].count = res.data.user_layer_5;
    // })

    const params = {
      cat: _type,
      p: _page
    }
    dataService.wanted_getUserThemeLayer(params).then(res => {
      $scope.themeList = res.data.themes;
      $scope.s_id = res.data.seller_id;
      $scope.host = res.data.http_host;
      $scope.totalItems = res.data.count;
    })
  }
}

