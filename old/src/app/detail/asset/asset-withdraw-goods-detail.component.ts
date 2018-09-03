import { IDataService } from '../../services/data-service/data-service.interface';
export const assetWithdrawGoodsDetail = {
  template: require('./asset-withdraw-goods-detail.template.html'),
  controller: WithdrawDetailGoodsCtrl,
};
WithdrawDetailGoodsCtrl.$inject = ['$scope', 'dataService', '$routeParams', 'Notification'];
function WithdrawDetailGoodsCtrl($scope, dataService: IDataService, $routeParams, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  let id = $routeParams.id, duration = $routeParams.duration, page = $routeParams.page;
  $scope.WithdrawDetail = {
    settle_date: $routeParams.duration,
    total_fee: $routeParams.total_fee,
    status: $routeParams.status,
  };
  init();

  function init() {
    dataService.pgc_settle_getTopicItemList({
      cir_id: $routeParams.cir_id,
      topic_id: id,
      settle_date: duration,
    }).then(res => $scope.goodsList = res.data.list);
  }
}
// })();
