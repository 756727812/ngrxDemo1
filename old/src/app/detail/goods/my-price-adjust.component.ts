import * as angular from 'angular';

export const myPriceAdjust = {
  controller: myPriceAdjustController,
  controllerAs: 'vm',
  template: require('./my-price-adjust.template.html')
}

myPriceAdjustController.$inject = ['$scope', '$location', '$routeParams', '$uibModal', 'dataService', 'applicationService', '$cookies'];
function myPriceAdjustController($scope, $location, $routeParams, $uibModal, dataService, applicationService, $cookies) {
  const vm = this;
  vm.title = "我的调价申请";
  vm.markedAdjust = {};
  const statusMap = {
    'approved': 1,
    'rejected': 2
  };
  const params = {};
  params['status'] = statusMap[$location.hash()] != undefined ? statusMap[$location.hash()] : 0;
  vm.status_type = params['status'];

  const init = function() {
    dataService.checkShopStatus({ url: $location.path(), status: 'check_update' });

    const params = {};
    const statusMap = {
      'approved': 1,
      'rejected': 2
    };

    params['status'] = statusMap[$location.hash()] != undefined ? statusMap[$location.hash()] : 0;
    params['p'] = $routeParams['page'];

    dataService.price_adjust_myPriceAdjustList(params).then(function(res) {
      vm.status_type = params['status'];
      vm.priceAdjustList = res.data.list;
      vm.total_items = res.data.count;
      if (!$cookies.get('leadPriceAdjust')) {
        showCover()
      }
    });
  }
  const showCover = function() {
    setTimeout(() => {
      const elCover = document.getElementById("lead-cover"),
        elLPriceTab = document.getElementById("lead_price_tab"),
        elLPriceApply = document.getElementById("lead_price_apply")
      applicationService.coverGuide(
        elCover, elLPriceTab,
        '商品成本价调整后的审核状态</br>在这里进行查看', function() {
          $(".lead-cover,.lead-info").removeAttr('style').hide()
          applicationService.coverGuide(
            elCover, elLPriceApply,
            '商品调整后的价格在这里展示', function() {
              $(".lead-cover,.lead-info").removeAttr('style').hide()
              const expireDate = new Date()
              expireDate.setDate(expireDate.getDate() + 60)
              $cookies.put('leadPriceAdjust', 1, { 'expires': expireDate })
            })
        }
      )
      $(".lead-cover").css({
        'width': '210px',
        'height': '40px'
      })
      $(".lead-info").css({
        'top': '160px'
      })
    }, 500)
  }
  init();
}
