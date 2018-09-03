import * as angular from 'angular';

export const kolMallBannerList = {
  controller: KolMallBannerListController,
  controllerAs: 'vm',
  template: require('./kol-mall-banner-list.template.html')
}

KolMallBannerListController.$inject = ['$scope', '$q', '$location', '$routeParams', '$uibModal', 'dataService', 'Notification', 'seeModal'];
function KolMallBannerListController($scope, $q, $location, $routeParams, $uibModal, dataService, Notification, seeModal) {
  const vm = this;
  const adjust_map = {};
  vm.statusList = [
    { st_id: 0, st_name: '所有' },
    { st_id: 1, st_name: '未开始' },
    { st_id: 2, st_name: '进行中' },
    { st_id: 3, st_name: '已结束' },
    { st_id: 4, st_name: '已下线' },
  ];

  vm.kol_id = $routeParams.kol_id || 0
  vm.wechat_id = $routeParams.wechat_id || ''

  vm.article_info = [];
  vm.searchBanner = searchBanner;
  vm.addBanner = addBanner;
  vm.editBanner = editBanner;
  vm.deleteBanner = deleteBanner;
  vm.setBannerStatus = setBannerStatus;
  vm.searchData = {};

  const init = function() {
    vm.searchData.status = $routeParams.status;
    vm.searchData.keyword = $routeParams.keyword;
    getBannerList({
      article_id: $routeParams.article_id || 17,
      status: $routeParams.status || 0,
      page: $routeParams.page || 1,
      page_size: 20,
      filter_info: JSON.stringify({
        keyword: $routeParams.keyword || ''
      })
    });

    dataService.kol_mgr_articleGet({
      article_id: $routeParams.article_id
    }).then(res => {
      vm.article_info = res.data.article_info
    })
  }

  init();

  function getBannerList(_params) {
    dataService.kol_act_bannerList(_params).then(res => {
      vm.bannerList = res.data.list;
      vm.total_items = res.data.count;
    })
  }

  function searchBanner() {
    $location.search(Object.assign($routeParams, vm.searchData));
  }

  function addBanner() {
    console.log($uibModal);
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-kol-mall-add-banner.template.html'),
      controller: 'modalKolMallAddBannerController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        article_id: () => $routeParams.article_id
      }
    })
    return modalInstance.result.then(params => {
      const _params = {
        banner_info: JSON.stringify(params)
      };

      dataService.kol_act_bannerAdd(_params).then(res => {
        if (res.result == 1) {
          Notification.success('添加成功');
          init();
        } else {
          Notification.Error(res.msg);
        }
      });
    })
  }

  function editBanner(banner_id) {
    console.log($uibModal);
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-kol-mall-edit-banner.template.html'),
      controller: 'modalKolMallEditBannerController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        banner_id: () => banner_id,
        article_id: () => $routeParams.article_id
      }
    })
    return modalInstance.result.then(params => {
      const _params = {
        banner_info: JSON.stringify(params)
      };
      console.log(_params);
      dataService.kol_act_bannerSet(_params).then(res => {
        if (res.result == 1) {
          Notification.success('编辑成功');
          init();
        } else {
          Notification.Error(res.msg);
        }
      });
    })
  }

  function deleteBanner(banner_id) {
    const title = "确定要删除Banner吗？";
    seeModal.confirm('删除Banner', title, function() {
      return dataService.kol_act_bannerDelete({ banner_id }).then(res => {
        if (res.result == 1) {
          Notification.success('删除成功');
          init();
        } else {
          Notification.Error(res.msg);
        }
      });
    })

  }

  function setBannerStatus(banner_id, status) {
    const op = status == 0 ? "下线" : "上线";
    const title = "确定要" + op + "吗？";
    seeModal.confirm('Banner', title, function() {
      const params = {
        banner_info: JSON.stringify({
          banner_id,
          article_id: $routeParams.article_id,
          is_public: status
        })
      };
      dataService.kol_act_bannerSet(params).then(res => {
        if (res.result == 1) {
          Notification.success('编辑成功');
          init();
        } else {
          Notification.Error(res.msg);
        }
      });
    })
  }
}
