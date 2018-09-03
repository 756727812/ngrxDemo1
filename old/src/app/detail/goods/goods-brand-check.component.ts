/**
 * 品牌库管理--检测重名
 */
import { IDataService } from '../../services/data-service/data-service.interface';

goodsBrandCheckController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification', '$uibModal'];
export function goodsBrandCheckController($scope, $routeParams, dataService: IDataService, Notification, $uibModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  let brand_id = $routeParams.id;
  $scope.brandName = $routeParams.name;
  init();
  function init() {
    dataService.brand_getSimilarBrandList({ brand_id }).then(res => {
      $scope.brandList = res.data;
      $scope.is_standard = res.data[0].is_standard;
      all();
    });
  }
  function all() {//全选、单选功能
    $scope.selected = [];
    let updateSelected = function (action, id) {
      if (action == 'add' && !~$scope.selected.indexOf(id))
        $scope.selected.push(id);
      if (action == 'remove' && ~$scope.selected.indexOf(id))
        $scope.selected.splice($scope.selected.indexOf(id), 1);
    };
    $scope.updateSelection = function ($event, id) {
      let checkbox = $event.target;
      let action = (checkbox.checked ? 'add' : 'remove');
      updateSelected(action, id);
    };
    $scope.selectAll = function ($event) {
      let checkbox = $event.target;
      let action = (checkbox.checked ? 'add' : 'remove');
      for (let i = 0; i < $scope.brandList.length; i++) {
        let brand = $scope.brandList[i];
        updateSelected(action, brand.brand_id);
      }
    };
    $scope.getSelectedClass = function (brand) {
      return $scope.isSelected(brand.brand_id) ? 'selected' : '';
    };
    $scope.isSelected = function (id) {
      return $scope.selected.indexOf(id) >= 0;
    };
    $scope.isSelectedAll = function () {
      return $scope.selected.length === $scope.brandList.length;
    };
  }
  $scope.mergeBrand = function (_brand, _body) {//品牌合并
    if (_body == '2' && $scope.selected.length == 0) {
      Notification.warn('请至少选择一条数据进行处理。');
      return false;
    }
    let modalInstance = $uibModal.open({
      template: require('./modal-goods-merge.template.html'),
      controller: 'ModalGoodsMergeCtrl',
      resolve: {
        brand() {
          return _brand;
        },
        body() {
          return _body;
        },
      },
    });
    modalInstance.result.then(function (brand) {
      let _params = {
        brand_id_arr: '',
        to_brand_id: '',
      };
      if (_body == '0') {
        _params.brand_id_arr = '[' + brand_id + ']';
        _params.to_brand_id = brand.brand_id;
      } else if (_body == '1') {
        _params.brand_id_arr = '[' + brand.brand_id + ']';
        _params.to_brand_id = brand_id;
      } else if (_body == '2') {
        _params.brand_id_arr = JSON.stringify($scope.selected);
        _params.to_brand_id = brand_id;

      }
      dataService.brand_mergeItemBrand(_params).then(res => {
        Notification.success('合并操作成功！');
        window.history.go(-1);
      });
    });
  };
}

export const goodsBrandCheck: ng.IComponentOptions = {
  template: require('./goods-brand-check.template.html'),
  controller: goodsBrandCheckController,
};
