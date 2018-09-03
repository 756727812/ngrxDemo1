import * as _ from 'lodash';;

export const priceAdjust = {
  controller: priceAdjustController,
  controllerAs: 'vm',
  template: require('./price-adjust.template.html')
}

priceAdjustController.$inject = ['$scope', '$q', '$location', '$routeParams', '$uibModal', 'dataService', 'Notification'];
function priceAdjustController($scope, $q, $location, $routeParams, $uibModal, dataService, Notification) {
  const vm = this;
  const adjust_map = {};

  const init = function() {
    vm.markedAdjust = {};
    vm.title = "商品调价审核";
    vm.markAllChildAdjust = false;

    const params = {};
    const statusMap = {
      'approved': 1,
      'rejected': 2
    };

    params['status'] = statusMap[$location.hash()] != undefined ? statusMap[$location.hash()] : 0;
    vm.status_type = params['status'];
    params['p'] = $routeParams['page'];

    dataService.price_adjust_priceAdjustList(params).then(function(res) {
      vm.priceAdjustList = res.data.list;
      vm.total_items = res.data.count;
      vm.priceAdjustList.forEach(function(v) {
        adjust_map[v.id] = v;
      });
      //      console.log(adjust_map);
    });
  }

  init();

  vm.markAllChange = function() {
    vm.priceAdjustList.forEach(function(v) {
      vm.markedAdjust[v.id] = vm.markAll
    });
  }

  vm.markAllChildAdjustChange = function(e) {
    vm.priceAdjustList.forEach(function(v) {
      if (!vm.markAllChildAdjust) {
        v.sms_inform = '0';
        vm.markAllSmsInform = false;
      }
      v.auto_adjust = vm.markAllChildAdjust ? '1' : '0';
    });
  }

  vm.autoAdjustChange = function(adj) {
    adj.sms_inform = '0';
  }

  vm.markAllSmsInformChange = function(e) {
    vm.priceAdjustList.forEach(function(v) {
      v.sms_inform = vm.markAllSmsInform ? '1' : '0';
    });
  }

  vm.approveApply = function(adjust_id) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-price-adjust-approve.template.html'),
      controller: 'modalPriceAdjustController',
      backdrop: 'static',
      size: 'md'
    });
    return modalInstance.result
      .then(() => {
        const apply_adjusts = [adjust_map[adjust_id]];
        return checkAdjustPrice(apply_adjusts);
      })
      .then((apply_adjusts) => {
        const params = {};
        params['apply_adjusts'] = JSON.stringify(apply_adjusts);
        params['adjust_ids'] = adjust_id;
        return dataService.price_adjust_approveApply(params);
      })
      .then(function(res) {
        init();
      }).catch((err) => {
        if (_.isString(err)) {
          Notification.warn(err)
        }
      })
  }

  vm.approveApplyBatch = function() {
    if (getMarkedAdjustIds().length == 0) {
      Notification.warn("请选择要操作的商品.");
      return;
    }

    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-price-adjust-approve.template.html'),
      controller: 'modalPriceAdjustController',
      backdrop: 'static',
      size: 'md'
    });
    return modalInstance.result
      .then(() => {
        const apply_adjusts = getMarkedAdjustIds().map(function(v) {
          return adjust_map[v];
        });
        return checkAdjustPrice(apply_adjusts);
      })
      .then((apply_adjusts) => {
        const params = {
          'apply_adjusts': JSON.stringify(apply_adjusts)
        };
        return dataService.price_adjust_approveApply(params);
      })
      .then(function(res) {
        init();
      })
      .catch((err) => {
        Notification.warn(err);
      });
  }

  vm.rejectApplyBatch = function() {
    if (getMarkedAdjustIds().length == 0) {
      Notification.warn("请选择要操作的商品.");
      return;
    }
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-price-adjust-reject.template.html'),
      controller: 'modalPriceAdjustController',
      backdrop: 'static',
      size: 'md'
    });
    return modalInstance.result
      .then(params => {
        //    console.log(params);
        params['adjust_ids'] = getMarkedAdjustIds().join(',');
        return dataService.price_adjust_rejectApply(params);
      })
      .then(function(res) {
        init();
      })
  }

  vm.rejectApply = function(adjust_id) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-price-adjust-reject.template.html'),
      controller: 'modalPriceAdjustController',
      backdrop: 'static',
      size: 'md'
    });
    return modalInstance.result
      .then(params => {
        // console.log(params);
        params['adjust_ids'] = adjust_id;
        return dataService.price_adjust_rejectApply(params);
      })
      .then(function(res) {
        init();
      })
  }

  function getMarkedAdjustIds() {
    const result = [];
    for (const adjust_id in vm.markedAdjust) {
      if (vm.markedAdjust[adjust_id]) {
        result.push(adjust_id);
      }
    }
    return result;
  }

  function checkAdjustPrice(apply_adjusts) {
    return $q((resolve, reject) => {
      apply_adjusts.forEach(function(s, k, a) {
        s.adjust_detail.forEach(function(v, k, a) {
          console.log(v);
          if (v['supply_price'] === '' || v['sku_price'] === '' || v['sku_ori_price'] === '' || v['cost_price'] === ''
            || String(v['supply_price']) === 'null' || String(v['sku_price']) === 'null' || String(v['sku_ori_price']) === 'null' || String(v['cost_price']) === 'null') {
            reject("请检查必填项");
          }
          if (v['cost_price'] <= 0) {
            reject("默认供货价不能为0");
          }
          if (!(v['sku_ori_price'] >= v['sku_price'] && v['sku_price'] >= v['supply_price'])) {
            reject("价格不达标：市场价≥售价≥成本价.");
          }
        })
      });
      resolve(apply_adjusts);
    })
  }
}
