import { IDataService } from '../../services/data-service/data-service.interface';

// 显示商品规则详情
ModalGoodsRuleDetailShowCtrl.$inject = ['$scope', '$uibModalInstance', 'rule', 'dataService'];
export function ModalGoodsRuleDetailShowCtrl($scope, $uibModalInstance, rule, dataService: IDataService) {
  dataService.rule_getRuleItemCount({ rule_id: rule.rule_id }).then(res => $scope.ruleItemCount = res.data);
  $scope.rule = rule;
  $scope.ok = function () {
    $uibModalInstance.close();
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}
