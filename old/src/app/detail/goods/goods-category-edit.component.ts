/**
 * 属性加挂流程的品类编辑
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsCategoryEditController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification', '$timeout', 'goodsService', 'seeModal'];
export function goodsCategoryEditController($scope, $routeParams, dataService: IDataService, Notification, $timeout, goodsService, seeModal) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const class_id = $scope.class_id = $routeParams.id,
    page = $routeParams.page || 1;

  $scope.root_id = $routeParams.root_id;

  init();

  function init() {
    getClassById(class_id);
    getAttrList(class_id, page);
  }

  /**
   * 查询当前class_id对应的class_name
   */
  function getClassById(class_id) {
    dataService.item_class2List({
      class_id,
    }).then(res => {
      $scope.class_name = res.data[0].class_name;
      $scope.class_weight = ~~res.data[0].class_weight;
    });
  }

  /**
   * 获取当前品类的加挂属性
   * @param _class_id { Number } 品类ID
   * @param _page { Number } 分页
   */
  function getAttrList(_class_id, _page) {
    dataService.category_getClass2Detail({
      class_id: _class_id,
      page: _page,
      page_size: 20,
    }).then(res => {
      $scope.attrList = res.data.list;
      $scope.total_items = res.data.total;
    });
  }
  /**
   * 保存新的品类名
   */
  $scope.saveName = function () {
    dataService.item_updateClass2({
      class_id,
      class_name: $scope.class_name,
      class_weight: $scope.class_weight,
    }).then(res => Notification.success('修改品类名成功！'));
  };

  /**
   * 编辑已加挂属性
   */
  $scope.edit = function (_index) {
    const attr = $scope.attrList[_index];
    goodsService.attrEditAndAddModal('edit', attr, class_id, $scope.class_name, '加挂属性编辑成功！', function () {
      // attr.is_rel = true;
      $timeout(function () {
        $scope.$apply(getAttrList(class_id, page));
      });
    });
  };

  function swapArrEle(arr, k1, k2) {
    if (k2 < 0) k2 = arr.length - 1;
    if (k2 >= arr.length) k2 = 0;
    if (k1 < arr.length && k2 < arr.length) {
      const _t = arr[k2];
      arr[k2] = arr[k1];
      arr[k1] = _t;
    }
  }

  // 更新属性顺序ID
  $scope.updateAttrOrder = function (_index_1, _index_2) {
    const prev_attr = $scope.attrList[_index_1],
      next_attr = $scope.attrList[_index_2];
    dataService.category_updateAttrOrder({
      class_id,
      order_json: JSON.stringify([
        {
          rel_id: prev_attr.rel_id,
          order_weight: next_attr.order_weight,
        },
        {
          rel_id: next_attr.rel_id,
          order_weight: prev_attr.order_weight,
        },
      ]),
    }).then(res => {
      Notification.success('调整属性顺序操作成功！');
      swapArrEle($scope.attrList, _index_1, _index_2);
    });
  };

  /**
   * 解除选中属性与当前品类的加挂关系
   */
  $scope.unchain = function (_index) {
    const _attr_name = $scope.attrList[_index].attr_name;
    seeModal.confirm('解除加挂', '确定解除属性 ' + _attr_name + ' 加挂？', function () {
      dataService.category_deleteAttrFromClass2({
        rel_id: $scope.attrList[_index].rel_id,
      }).then(res => {
        Notification.success('成功解除属性' + _attr_name + ' 加挂！');
        $scope.attrList.splice(_index, 1);
      });
    });
  };
}

export const goodsCategoryEdit: ng.IComponentOptions = {
  template: require('./goods-category-edit.template.html'),
  controller: goodsCategoryEditController,
};
