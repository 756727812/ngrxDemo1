import { debug } from 'util';
import { find } from 'lodash';

const GROUPON_DO_NOT_SHIP_MSG = '该订单正在拼团中，尚不支持发货，“拼团成功”时可发货';

export class orderTableController {

  type: number;
  isC2C: boolean = this.$cookies.get('seller_privilege') === '1';
  orderData: {
    count: number,
    list: any[],
    items_per_page?: number,
  };
  is_show_dispatch_th: boolean;
  onUpdate: Function;

  static $inject: string[] = [
    '$q', '$cookies', 'Notification', 'dataService', 'orderService', 'seeModal', '$uibModal',
  ];
  constructor(
    private $q: ng.IQService,
    private $cookies: ng.cookies.ICookiesService,
    private notification: see.INotificationService,
    private dataService: see.IDataService,
    private orderService: any,
    private seeModal: see.ISeeModalService,
    private $uibModal: ng.ui.bootstrap.IModalService,
  ) {}

  $onChanges(bindings) {
    if (!this.orderData) return;
    this.is_show_dispatch_th = [0, 2, 10, 5, 6, 7, 11].includes(+this.type);
    if ([0, 7, 11].includes(+this.type) && this.orderData.list.length > 0) {
      const orderIDList = this.orderData.list
        .filter(order => Number(order.order_list[0].status) === 20005)
        .reduce(
          (acc, val, index, arr) => {
            acc.push(val.order_list[0].order_id);
            return acc;
          },
          [],
        );
      if (orderIDList.length > 0) {
        this.getReturningOrderLogisticStatus(orderIDList)
          .then(littleOrderData => {
            this.orderData.list.forEach(
              val => {
                const LOD = <any>find(
                  littleOrderData,
                  o => val.order_list[0].order_id === (o as any).littleOrderId,
                );
                if (LOD) {
                  val.order_list[0].exist = LOD.exist;
                }
              },
            );
          });
      }

    }
  }

  checkPrivilege(in_warehouse, order_info) {
    if (Number(in_warehouse) === 1 && this.isC2C) {
      this.notification.warn('无囤货订单操作权限');
      return false;
    }
    return true;
  }

  // 星标
  markStar(mid_order_id: string, is_mark_star: '1' | '0'): ng.IPromise<any> {
    return this.dataService.orderv2_setMarkStar({ mid_order_id, is_mark_star }).then(res => {
      this.notification.success();
      this.onUpdate();
    });
  }

  /**
   * 联系用户.
   * @param {string} order_id - 中订单号
   */
  contactUser: (order_id: string) => ng.IPromise<any> = order_id =>
    this.orderService.contactUser(order_id)

  /**
   ********************************* 待付款订单 *********************************
   */
  // 中订单

  // 小订单
  // 修改实付金额

  modifyPrice(order_id, total_fee) {
    this.orderService.modifyPrice(order_id, total_fee, () => this.onUpdate());
  }

  /**
   ********************************* 待备货订单 *********************************
   */
  // 中订单
  // 完成备货操作 -- 判断囤货订单
  completeOrder(type, mid_order_id, ship_country, in_warehouse, order_info) {
    // 用户支付后1h内，后台不可发起退款，不可进行备货
    if (Number(order_info.summary_info.seconds_from_buy) < 3600) {
      this.notification.warn('用户支付后1小时内的订单，不能进行备货操作');
      return;
    }
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }

    if (order_info.summary_info.group_status === 1) {
      this.notification.warn('该订单正在拼团中，拼团成功后方支持备货');
      return;
    }

    if (type === 'new_order') {
      this.orderService.completeOrder(mid_order_id, ship_country, () => this.onUpdate(),
                                      in_warehouse, order_info);
    } else {
      this.orderService.completeOldOrder(mid_order_id, () => this.onUpdate());
    }
  }

  // 撤销派发
  cancelDispatch(mid_order_id) {
    this.orderService.cancelDispatch(mid_order_id, () => this.onUpdate());
  }

  // 小订单
  // 发起退款
  refund(order_id, in_warehouse, order_info, smallOrder) {
    if (
      Number(order_info.summary_info.outside_warehouse) === 1
      && Number(smallOrder.can_refund) === 0
    ) {
      this.notification.warn('商品已在出库中，不支持退款。用户若在收货后不满意，可发起退货');
      return;
    }

    if (Number(order_info.summary_info.group_status) === 1) {
      this.notification.warn('该订单正在拼团中，不支持退款');
      return;
    }

    // 用户支付后1h内，后台不可发起退款，不可进行备货
    if (Number(order_info.summary_info.seconds_from_buy) < 3600) {
      this.notification.warn('用户支付后1小时内的订单，不能发起退款');
      return;
    }

    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }

    this.orderService.refund(order_id, () => this.onUpdate(), order_info);
  }

  // 修改商品规格
  modifySpec(order_id, item_id, attr_value, total_fee, sku_id, item_type, in_warehouse,
             order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    this.orderService.modifySpec(order_id, item_id, attr_value, total_fee, sku_id, item_type,
                                 () => this.onUpdate(), in_warehouse, order_info);
  }

  /**
   ********************************* 待派发订单 *********************************
   */
  // 派发订单
  dispatchOrder(type, mid_order_id, total_fee) {
    if (type === 'old_order') {
      this.orderService.dispatchOldOrder(mid_order_id, total_fee, () => this.onUpdate());
    } else {
      this.orderService.dispatchOrder(mid_order_id, total_fee, () => this.onUpdate());
    }
  }

  // 包裹拆分
  splitOrder(mid_order_id, in_warehouse, order_info) {
    console.log(mid_order_id);
    this.orderService.splitOrder(mid_order_id, () => this.onUpdate(), in_warehouse, order_info);
  }

  /**
   ********************************* 已派发订单 *********************************
   */
  // 中订单


  // 小订单
  // 修改派发金额
  changeDispatchPriceModal(order_id, total_fee) {
    this.orderService.changeDispatchPriceModal(order_id, total_fee, () => this.onUpdate());
  }


  /**
   ********************************* 待完成订单 *********************************
   */
  // 中订单
  // 官网发货button  -- 判断囤货订单
  officialShip(mid_order_id, item_location, ship_method, logistics_type, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.officialShip(mid_order_id, item_location, ship_method, logistics_type,
                                   () => this.onUpdate(), in_warehouse, order_info);
  }

  // 供应商发货模态框  -- 判断囤货订单
  sendGoods(mid_order_id, item_location, ship_method, action, logistics_type, logistics_conf_id,
            in_warehouse = 0, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.buyerShip(mid_order_id, item_location, ship_method, action, logistics_type,
                                logistics_conf_id, () => this.onUpdate(), in_warehouse,
                                order_info);
  }

  // 国内发货  -- 判断囤货订单
  inlandShip(mid_order_id, status, old_action, f_action, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.inlandShip(mid_order_id, status, old_action, f_action, () => this.onUpdate(),
                                 in_warehouse, order_info);
  }

  // 国内拼邮中转发货  -- 判断囤货订单
  domesticPieceSecondaryDelivery(mid_order_id, logistics_conf_id, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService
      .domesticPieceSecondaryDelivery(mid_order_id, logistics_conf_id, () => this.onUpdate(),
                                      in_warehouse, order_info);
  }

  // 老订单发货  -- 判断囤货订单
  oldSendGoods(mid_order_id, item_location, ship_method, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.oldOrderSendGoods(mid_order_id, item_location, ship_method,
                                        () => this.onUpdate(), in_warehouse, order_info);
  }

  // 兼容线上对新订单旧物流的发货
  OLD_sendGoods(mid_order_id, item_location, ship_method, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.OLD_sendGoods(mid_order_id, item_location, ship_method,
                                    () => this.onUpdate(), in_warehouse, order_info);
  }

  // 转运仓发货 -- 判断囤货订单
  transferHopperShip(mid_order_id, action, f_action, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    this.orderService.transferHopperShip(mid_order_id, action, f_action, () => this.onUpdate(),
                                         in_warehouse, order_info);
  }

  // 重新发货
  expressAgain(mid_order_id, action, item_location, ship_method, logistics_type, logistics_conf_id,
               in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    if (order_info.summary_info.group_status === 1) {
      this.notification.warn(GROUPON_DO_NOT_SHIP_MSG);
      return;
    }
    if (action === 'online_buy') {
      // 订单为线上采购途径,显示官网发货
      this.orderService.officialShip(mid_order_id, item_location, ship_method, logistics_type,
                                     () => this.onUpdate(), in_warehouse, order_info);
    } else if (action === 'offline_buy') {
      this.orderService.buyerShip(mid_order_id, item_location, ship_method, action, logistics_type,
                                  logistics_conf_id, () => this.onUpdate(), in_warehouse,
                                  order_info);
    } else {
      this.notification.warn('订单数据发生错误!');
    }
  }

  // 缴纳关税操作
  payTax({ order_id, group_status }) {
    if (group_status) {
      this.notification.warn('拼团商品一律包邮包税，不支持临时要求用户补缴关税哦');
      return;
    }
    this.orderService.payTax(order_id, () => this.onUpdate());
  }

  // 完成缴税
  finishTax(mid_order_id) {
    this.orderService.finishTax(mid_order_id, () => this.onUpdate());
  }


  // 小订单

  /**
   ********************************* 已完成订单 *********************************
   */
  // 中订单

  // 小订单
  // 发起退货操作
  startReturnGoods(order_id, total_fee, is_withdraw) {
    this.orderService.startReturnGoods(order_id, total_fee, is_withdraw)
      .then(() => this.onUpdate());
  }

  /**
   ********************************* 售后订单 *********************************
   */
  // 中订单
  // 审核退款申请
  auditRefund(mid_order_id, refund_apply_time, refund_reason, in_warehouse, order_info) {
    if (!this.checkPrivilege(in_warehouse, order_info)) {
      return;
    }
    this.orderService.auditRefund(mid_order_id, refund_apply_time, refund_reason,
                                  () => this.onUpdate(), in_warehouse, order_info);
  }

  // 小订单
  // 退货过程中确认收货
  openConfirmRecvPopUp(order_id) {
    this.orderService.openConfirmRecvPopUp(order_id, () => this.onUpdate());
  }

  // 完成退款
  openFinishRefundPopUp(order_id, in_warehouse, order_info) {
    if (Number(order_info.summary_info.outside_warehouse) === 1) {
      // this.notification.warn('非缺货状态的外仓库囤货订单不能完成退款');
      // return
    }
    this.orderService.openFinishRefundPopUp(order_id,
                                            () => this.onUpdate(), in_warehouse, order_info);
  }

  // 完成打款
  openFinishPayPopUp(order_id) {
    this.orderService.openFinishPayPopUp(order_id, () => this.onUpdate());
  }
  //自动退款
  autoRefund(lit_order_id, refund_fee) {
    const params = {
      lit_order_id,
      refund_fee
    }
    return this.dataService.orderv2_comfirmRefund(params).then(res => {
      this.notification.success('重试自动退款操作成功！')
      this.onUpdate()
    });
  }

  // 添加/查看退货物流
  addOrUpdateLogistics(littleOrderId: number, exist: number): ng.IPromise<any> {
    return this.$uibModal.open({
      size: 'lg',
      backdrop: 'static',
      component: 'modalGoodsAddReturnLogistic',
      resolve: {
        littleOrderId: () => littleOrderId,
        exist: () => exist,
      },
    }).result
      .then(() => this.onUpdate())
      .catch(e => e);
  }

  // 未收到退货
  unreceivedReturn(littleOrderId): ng.IPromise<any> {
    return this.seeModal.confirmP('未收到退货', '确认未收到退货？')
      .then(
        () => this.dataService.returngoods_unreceived({ littleOrderId })
          .then(() => {
            this.notification.success('未收到退货操作成功');
            return this.onUpdate();
          }),
      );
  }

  // 收到退货
  receivedReturn(littleOrderId: number): ng.IPromise<any> {
    return this.seeModal
      .confirmP(
        '收到退货',
        '确认已收到该订单的退货？一旦确认，系统将立刻发起自动转账，退款金额会即时退回至用户，请谨慎操作',
      )
      .then(
        () => this.dataService.returngoods_received({ littleOrderId })
          .then(() => {
            this.notification.success('收到退货操作成功');
            return this.onUpdate();
          }),
      );
  }

  private getReturningOrderLogisticStatus(littleOrderIds: string[]): ng.IPromise<any> {
    return this.dataService.returngoods_existsLogistics(littleOrderIds)
      .then(({ data }) => data);
  }

  /**
   ********************************* END *********************************
   */

}

export const orderTable: ng.IComponentOptions = {
  bindings: {
    type: '<',
    orderData: '<',
    onUpdate: '&',
  },
  template: require('./order-table.template.html'),
  controller: orderTableController,
};
