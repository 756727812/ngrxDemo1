// angular
//   .module('seego.order')
//   .factory('orderService', orderService)
//   .filter('action', action)
import * as angular from 'angular';
import * as _ from 'lodash';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';

export const order = {
  orderService,
  action,
};

function action() {
  return actionFilter;

  ////////////////

  function actionFilter(value) {
    return (
      (value == 1 && '重新派发订单') ||
      (value == 2 && '改为待备货') ||
      (value == 3 && '改为待官网发货') ||
      (value == 4 && '改为待买手发货') ||
      (value == 5 && '延长收货时间') ||
      (value == 6 && '改为退款中') ||
      (value == 7 && '改为订单已完成') ||
      (value == 8 && '改为退款完成')
    );
  }
}

orderService.$inject = ['$uibModal', 'Notification', 'seeModal', 'dataService'];
function orderService(
  $uibModal,
  Notification: INotificationService,
  seeModal: ISeeModalService,
  dataService: IDataService,
) {
  const version = +new Date();
  const service = {
    // 小订单操作
    changeDispatchPriceModal,
    modifySpec,
    startReturnGoods,
    openConfirmRecvPopUp,
    openFinishRefundPopUp,
    openFinishPayPopUp,
    modifyPrice,
    refund,
    // 中订单
    auditRefund,
    getOperateOrderCount,
    contactUser,
    payTax,
    buyerShip,
    cancelDispatch,
    completeOldOrder,
    completeOrder,
    finishTax,
    dispatchOrder,
    dispatchOldOrder,
    splitOrder,
    inlandShip,
    officialShip,
    OLD_sendGoods,
    oldOrderSendGoods,
    transferHopperShip,
    domesticPieceSecondaryDelivery,
  };

  return service;

  /******************************************************************************************************************
   * 小订单操作
   ******************************************************************************************************************/

  /**
   * 修改已派发订单的派发金额
   * @order_id: 小订单的订单id
   * @total_fee: 当前订单的派发金额
   * @cb: 回调函数处理返回后的数据
   */
  function changeDispatchPriceModal(order_id, total_fee, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-change-dispatch-price.html?v=' + version,
      template: require('./modal-change-dispatch-price.html'),
      controller: 'modalChangeDispatchPriceController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        total_fee() {
          return total_fee;
        },
      },
    });
    return modalInstance.result.then(function(param) {
      const _params = angular.extend({ order_id }, param);
      return dataService.orderv2_modifyDispatchPrice(_params).then(res => {
        Notification.success();
        cb && cb(res);
      });
    });
  }

  /**
   * 修改订单商品规格
   * @param order_id 订单id
   * @param item_id 订单商品id
   * @param attr_value 订单商品的sku规格，字符串形式
   * @param total_fee 小订单商品的实付金额
   * @param item_type 是否是新sku的商品 '1': 是  ‘0’：不是
   * @param cb 回调函数处理返回后的数据
   */
  function modifySpec(
    order_id,
    item_id,
    attr_value,
    total_fee,
    sku_id,
    item_type,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1 &&
      Number(order_info.summary_info.ex_warehouse_status) == 2
    ) {
      return Notification.warn('囤货订单为出库中的状态不能修改规格');
    }
    dataService.orderv2_getOrderItemSkus({ item_id }).then(res => {
      let skus;
      if (+item_type === 1) {
        skus = res.data;
      } else {
        // 处理后端sku数据
        skus = res.data.item_attr_key.map(function(v) {
          return {
            attr_key_id: v.attr_key_id,
            attr_name: v.attr_name,
            spec: [],
          };
        });
        angular.forEach(res.data.key_value_relate, function(val, key) {
          angular.forEach(skus, function(_v, _i) {
            if (key == _v.attr_key_id) {
              angular.forEach(val, function(j) {
                skus[_i].spec.push({
                  value_id: j,
                });
              });
            }
          });
        });
        angular.forEach(skus, function(val, index) {
          angular.forEach(val.spec, function(_v, _i) {
            angular.forEach(res.data.item_attr_value, function(_j) {
              if (_j.value_id == _v.value_id) {
                skus[index].spec[_i].attr_value = _j.attr_value;
              }
            });
          });
        });
      }

      const modalInstance = $uibModal.open({
        animation: true,
        // templateUrl: 'detail/orderNew/modal-modify-spec.html?v=' + version,
        template: require('./modal-modify-spec.html'),
        controller: 'modalModifySpecController',
        size: 'md',
        backdrop: 'static',
        resolve: {
          item_type: () => item_type,
          item_id() {
            return item_id;
          },
          skus() {
            return skus;
          },
          attr_value() {
            return attr_value;
          },
          total_fee() {
            return total_fee;
          },
          sku_id() {
            return sku_id;
          },
        },
      });
      modalInstance.result.then(function(param) {
        const _params = angular.extend({ order_id }, param);
        dataService.orderv2_modifyOrderItemSku(_params).then(res => {
          Notification.success();
          cb && cb(res);
        });
      });
    });
  }

  /**
   * 发起退货
   */
  function startReturnGoods(order_id, total_fee, is_withdraw) {
    if (is_withdraw === 1) {
      return seeModal
        .confirmP(
          '发起退货',
          '该订单已申请提现/已提现，请确认是否需要发起退货？你已提现的订单款项可能需要退回See',
        )
        .then(() => openReturnGoodsModal(order_id, total_fee));
    } else {
      return openReturnGoodsModal(order_id, total_fee);
    }
  }
  function openReturnGoodsModal(order_id, total_fee) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: `detail/orderNew/modal-apply-return-goods.html?v=${version}`,
      template: require('./modal-apply-return-goods.html'),
      controller: 'modalApplyReturnGoodsController',
      controllerAs: 'vm',
      size: 'md',
      backdrop: 'static',
    });
    return modalInstance.result.then(delta_fee =>
      dataService
        .orderv2_processSelledOrder({
          action_style: 'returnGood',
          order_id,
          delta_fee,
        })
        .then(res => Notification.success('退货成功！')),
    );
  }

  /**
   * 退货过程中确认收货
   */
  function openConfirmRecvPopUp(order_id, cb) {
    seeModal.confirmP('确认收货', '你确定要确认收货吗？').then(() =>
      dataService
        .orderv2_processSelledOrder({
          order_id,
          action_style: 'confirmReturn',
        })
        .then(res => {
          Notification.success('确认收货成功!');
          cb && cb();
        }),
    );
  }

  /**
   * 完成退款
   */
  function openFinishRefundPopUp(order_id, cb, in_warehouse, order_info) {
    seeModal.confirm(
      '提示',
      '注意：点击该按钮不会发起自动转账，仅会流转订单状态至”退款成功“，请确认你已在微信支付平台为用户完成退款，再点击该按钮，以避免用户在未收到退款的情况下发现订单已变为退款成功，而产生客诉。确认发起该操作？',
      function() {
        dataService
          .orderv2_processSelledOrder({
            order_id,
            action_style: 'finishRefund',
          })
          .then(res => {
            Notification.success('退款已完成!');
            cb && cb();
          });
      },
    );
  }

  /**
   * 客服完成退款给用户
   */
  function openFinishPayPopUp(order_id, cb) {
    seeModal.confirm(
      '提示',
      '注意：点击该按钮不会发起自动转账，仅会流转订单状态至”退款成功“，请确认你已在微信支付平台为用户完成退款，再点击该按钮，以避免用户在未收到退款的情况下发现订单已变为退款成功，而产生客诉。确认发起该操作？',
      function() {
        dataService
          .orderv2_processSelledOrder({
            order_id,
            action_style: 'finishReturn',
          })
          .then(res => {
            Notification.success('确认退款成功!');
            cb && cb();
          });
      },
    );
  }

  /**
   * 修改实付金额
   */
  function modifyPrice(mid_order_id, total_fee, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-modify-price.html?v=' + version,
      template: require('./modal-modify-price.html'),
      controller: 'modalModifyPriceController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        total_fee() {
          return total_fee;
        },
      },
    });

    return modalInstance.result.then(curr_total_fee =>
      dataService
        .orderv2_modifyMiddleOrderPrice({
          mid_order_id,
          curr_total_fee,
        })
        .then(res => {
          Notification.success('修改实付金额！');
          cb && cb();
        }),
    );
  }

  /**
   * 发起退款
   */
  function refund(order_id, cb, order_info) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-refund.html?v=' + version,
      template: require('./modal-refund.html'),
      controller: 'modalRefundController',
      size: 'md',
      backdrop: 'static',
    });

    modalInstance.result.then(function(refundReson) {
      const param = {
        action_style: 'refundOrder',
        order_id,
        refund_reason: refundReson,
      };
      dataService.orderv2_processSelledOrder(param).then(res => {
        Notification.success('退款成功！');
        cb && cb();
      });
    });
  }

  /******************************************************************************************************************
   * 中订单操作
   ******************************************************************************************************************/

  /**
   * 售后订单审核退款申请
   */
  function auditRefund(
    mid_order_id,
    refund_time,
    refund_desc,
    cb,
    in_warehouse,
    order_info,
  ) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-audit-refund.html?v=' + version,
      template: require('./modal-audit-refund.html'),
      controller: 'modalAuditRefundController',
      size: 'sm',
      backdrop: 'static',
      resolve: {
        order_info() {
          return order_info;
        },
        refund_time() {
          return refund_time;
        },
        refund_desc() {
          return refund_desc;
        },
        mid_order_id() {
          return mid_order_id;
        },
      },
    });
    return modalInstance.result.then(
      param => {
        const _params = angular.extend({ order_id: mid_order_id }, param);
        return dataService.orderv2_processRefundMsg(_params).then(res => {
          Notification.success(res.msg);
          cb && cb(res);
        });
      },
      () => {},
    );
  }

  /**
   * 获取待操作订单数
   */
  function getOperateOrderCount(cb) {
    return dataService
      .orderv2_getOperateOrderCount()
      .then(res => cb && cb(res));
  }

  /**
   * 联系用户，客户端推送聊天
   */
  function contactUser(order_id, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-contact-user.html?v=${version}',
      template: require('./modal-contact-user.html'),
      controller: 'modalCatactUserController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        kol_brand_id: () => 0,
      },
    });
    return modalInstance.result.then(params =>
      dataService
        .orderv2_contactUser({
          order_id,
          is_send_order: params.is_send_order,
        })
        .then(res => {
          Notification.success('聊天推送已发送，请注意查看手机！');
          cb && cb(res);
        }),
    );
  }

  /**
   * 缴纳关税操作
   * @mid_order_id: 对应的中订单订单号
   */
  function payTax(mid_order_id, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-pay-tax.html?v=' + version,
      template: require('./modal-pay-tax.html'),
      controller: 'modalPayTaxController',
      size: 'md',
      backdrop: 'static',
    });

    modalInstance.result.then(function(params) {
      angular.extend(params, {
        order_id: mid_order_id,
      });
      dataService.orderv2_notifyTax(params).then(res => {
        Notification.success('填写缴纳关税信息成功！');
        cb && cb(res);
      });
    });
  }

  /**
   * 买手发货 ， 囤货前端未处理内容
   */
  function buyerShip(
    mid_order_id,
    item_location,
    ship_method,
    action,
    logistics_type,
    logistics_conf_id,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }

    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-buyer-ship.html?v=' + version,
      template: require('./modal-buyer-ship.html'),
      controller: 'modalBuyerShipController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        item_location() {
          return item_location;
        },
        ship_method() {
          return ship_method;
        },
        action() {
          return action;
        },
        logistics_type() {
          return logistics_type;
        },
        logistics_conf_id() {
          return logistics_conf_id;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_sendGoodsv2(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb(res);
      });
    });
  }

  /**
   * 撤销派发
   */
  function cancelDispatch(order_id, cb) {
    seeModal.confirm('撤销派发', '你确定要回收派发出去的订单吗？', function() {
      dataService
        .orderv2_cancelDispatch({ mid_order_id: order_id })
        .then(res => {
          Notification.success('取消派发订单成功！');
          cb && cb(res);
        });
    });
  }

  /**
   * 完成老订单下单
   */
  function completeOldOrder(mid_order_id, cb) {
    const modalInstance1 = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-complete-old-order.html?v=' + version,
      template: require('./modal-complete-old-order.html'),
      controller: 'modalCompleteOldOrderController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
      },
    });
    modalInstance1.result.then(function(params) {
      dataService.orderv2_finishBuy(params).then(res => {
        Notification.success('下单操作已完成！');
        cb && cb(res);
      });
    });
  }

  /**
   * 完成备货（下单)
   */
  function completeOrder(
    mid_order_id,
    ship_country,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }

    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-complete-order.html?v=' + version,
      template: require('./modal-complete-order.html'),
      controller: 'modalCompleteOrderController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        ship_country() {
          return ship_country;
        },
      },
    });
    modalInstance.result.then(function(params) {
      dataService.orderv2_finishBuyv2(params).then(res => {
        Notification.success('下单操作已完成！');
        cb && cb(res);
      });
    });
  }

  /**
   * 完成缴税
   */
  function finishTax(order_id, cb) {
    return seeModal.confirmP('完成缴税', '你确定完成缴税吗？').then(() =>
      dataService.orderv2_finishTax({ order_id }).then(res => {
        Notification.success('该订单已经完成缴税');
        cb && cb();
      }),
    );
  }

  /**
   * 派发订单
   */
  function dispatchOrder(mid_order_id, total_fee, cb) {
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-dispatch-order.html?v=' + version,
      template: require('./modal-dispatch-order.html'),
      controller: 'modalDispatchOrderController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        total_fee() {
          return total_fee;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_dispatchOrderv2(param).then(res => {
        Notification.success('派发订单成功！');
        cb && cb();
      });
    });
  }
  /**
   * 包裹拆单
   */
  function splitOrder(mid_order_id, cb, in_warehouse, order_info) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn('外仓库囤货订单禁止禁止拆分包裹');
    }

    seeModal.confirmP('包裹拆分', '你确定进行拆分吗?').then(() =>
      dataService
        .orderv2_splitMidOrder({ mid_order_ids: mid_order_id })
        .then(res => {
          if (res.result) {
            Notification.success('包裹拆分成功');
            cb && cb();
          }
        }),
    );
  }
  /**
   * 派发老订单
   */
  function dispatchOldOrder(mid_order_id, total_fee, cb) {
    const modalInstance1 = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-dispatch-old-order.html?v=' + version,
      template: require('./modal-dispatch-old-order.html'),
      controller: 'modalDispatchOldOrderController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        total_fee() {
          return total_fee;
        },
      },
    });

    modalInstance1.result.then(function(param) {
      dataService.orderv2_dispatchOrderv2(param).then(res => {
        Notification.success('派发订单成功！');
        cb && cb();
      });
    });
  }

  /**
   * 国内发货
   */
  function inlandShip(
    mid_order_id,
    status,
    old_action,
    f_action,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-inland-ship.html?v=' + version,
      template: require('./modal-inland-ship.html'),
      controller: 'modalInlandShipController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        logistics_type() {
          return 0;
        },
      },
    });

    modalInstance.result.then(function(param) {
      const _param = angular.copy(param);
      switch (status) {
        case '20002': // 已发货订单
          _param.action = 'end';
          break;
        default:
          // 待发货订单
          _param.action = 'inland_ship';
      }
      _param.action =
        old_action == 'native_ship_buy' ? 'native_ship_origin' : _param.action;
      _param.order_id = mid_order_id;
      if (old_action == 'native_ship_buy') {
        _param.logistics_conf_id = '21';
      } else if (old_action == 'native_ship') {
        _param.logistics_conf_id = f_action == 'offline_buy' ? '20' : '8';
      } else if (old_action == 'official_to_storage_unseego_together') {
        _param.logistics_conf_id = '13';
      }

      dataService.orderv2_sendGoodsv2(_param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }

  /**
   * 官网发货
   */
  function officialShip(
    mid_order_id,
    item_location,
    ship_method,
    logistics_type,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-official-ship.html?v=' + version,
      template: require('./modal-official-ship.html'),
      controller: 'modalOfficialShipController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        item_location() {
          return item_location;
        },
        ship_method() {
          return ship_method;
        },
        logistics_type() {
          return logistics_type;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_sendGoodsv2(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }

  /**
   * 兼容线上对新订单旧物流的发货
   */
  function OLD_sendGoods(
    mid_order_id,
    item_location,
    ship_method,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-old-send-goods.html?v=' + version,
      template: require('./modal-old-send-goods.html'),
      controller: 'modalOldSendGoodsController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        item_location() {
          return item_location;
        },
        ship_method() {
          return ship_method;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_sendGoods(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }

  /**
   * 老订单发货
   */
  function oldOrderSendGoods(
    mid_order_id,
    item_location,
    ship_method,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-old-order-send-goods.html?v=' + version,
      template: require('./modal-old-order-send-goods.html'),
      controller: 'modalOldOrderSendGoodsController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        item_location() {
          return item_location;
        },
        ship_method() {
          return ship_method;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_sendGoods(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }

  /**
   * 转运仓发货
   */
  function transferHopperShip(
    mid_order_id,
    action,
    f_action,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-transfer-hopper-ship.html?v=' + version,
      template: require('./modal-transfer-hopper-ship.html'),
      controller: 'modalTransferHopperShipController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        action() {
          return action;
        },
        f_action() {
          return f_action;
        },
        mid_order_id() {
          return mid_order_id;
        },
      },
    });

    modalInstance.result.then(function(param) {
      dataService.orderv2_sendGoodsv2(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }

  /**
   * 国内拼邮中转发货
   */
  function domesticPieceSecondaryDelivery(
    mid_order_id,
    logistics_conf_id,
    cb,
    in_warehouse,
    order_info,
  ) {
    if (
      Number(in_warehouse) == 1 &&
      Number(order_info.summary_info.outside_warehouse) == 1
    ) {
      return Notification.warn(
        '囤货订单将根据仓库发货情况进行自动流转发货，暂不支持人工操作',
      );
    }
    const modalInstance = $uibModal.open({
      animation: true,
      // templateUrl: 'detail/orderNew/modal-inland-ship.html?v=' + version,
      template: require('./modal-inland-ship.html'),
      controller: 'modalInlandShipController',
      size: 'md',
      backdrop: 'static',
      resolve: {
        mid_order_id() {
          return mid_order_id;
        },
        logistics_type() {
          return 1;
        },
      },
    });

    modalInstance.result.then(function(param) {
      let _logistics_conf_id;
      if (logistics_conf_id === '43') {
        _logistics_conf_id = '39';
      } else if (logistics_conf_id === '44') {
        _logistics_conf_id = '42';
      }
      _.assignIn(param, {
        order_id: mid_order_id,
        action: '',
        logistics_conf_id: _logistics_conf_id,
      });

      dataService.orderv2_sendGoodsv2(param).then(res => {
        Notification.success('发货成功，订单已转为已发货状态！');
        cb && cb();
      });
    });
  }
}
