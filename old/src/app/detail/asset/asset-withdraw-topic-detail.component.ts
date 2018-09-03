import { IDataService } from '../../services/data-service/data-service.interface';
export const assetWithdrawTopicDetail = {
  template: require('./asset-withdraw-topic-detail.template.html'),
  controller: WithdrawDetailTopicCtrl,
};
WithdrawDetailTopicCtrl.$inject = ['$scope', 'dataService', '$routeParams', 'Notification'];
function WithdrawDetailTopicCtrl($scope, dataService: IDataService, $routeParams, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  let
    duration = $scope.duration = $routeParams.id,
    page = $routeParams.page || 1;
  $scope.cir_id = $routeParams.cir_id;
  $scope.settle_date = $routeParams.id;

  init();

  function init() {
    getBillDetailPgc();
  }

  /**
   * 获取账单详情-专题
   */
  function getBillDetailPgc() {
    dataService.pgc_settle_getBillDetail({
      cir_id: $scope.cir_id,
      settle_date: duration,
      p: page,
    }).then(res => {
      $scope.WithdrawDetail = res.data.bill_info;
      $scope.topicList = res.data.topic_list.list;
      $scope.total_items = res.data.topic_list.count;
    });
  }
}
// })();
