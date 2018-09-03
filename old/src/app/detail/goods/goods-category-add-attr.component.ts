/**
 * 品类加挂属性操作
 */
import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

goodsCategoryAddAttrController.$inject = ['$scope', '$routeParams', 'dataService', 'Notification', '$location', 'goodsService'];
export function goodsCategoryAddAttrController($scope, $routeParams, dataService: IDataService, Notification, $location, goodsService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const page = $routeParams.page || 1,
    class_id = $scope.class_id = $routeParams.id,
    root_id = $scope.root_id = $routeParams.root_id,
    attr_keywd = $scope.attr_keywd = $routeParams.attr_keywd;

  init();

  function init() {
    getClassById(class_id);
    if ($scope.attr_keywd) {
      findAttr($scope.attr_keywd);
    } else {
      getAttrList();
    }
  }

  /**
   * 查询当前class_id对应的class_name
   */
  function getClassById(_class_id) {
    dataService.item_class2List({
      class_id: _class_id,
    }).then(res => $scope.class_name = res.data[0].class_name);
  }

  // 排序种子
  function compare(a, b) {
    if (+a.order_weight < +b.order_weight)
      return -1;
    else if (+a.order_weight > +b.order_weight)
      return 1;
    else
      return 0;
  }

  /**
   * 获取当前三级品类所属一级品类的相关属性
   */
  function getAttrList() {
    dataService.attrib_getList({
      page,
      page_size: 20,
      class_id: root_id,
      attach_class_id: class_id,
    }).then(res => {
      $scope.attrList = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  /**
   * 属性关键字搜索
   */
  function findAttr(_name) {
    dataService.attrib_find({
      attr_name: _name,
      mode: 1, // 模糊搜索
      page,
      page_size: 20,
      class_id: root_id,
      attach_class_id: class_id,
    }).then(res => {
      $scope.attrList = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  /**
   * 加挂属性
   */
  $scope.check = function (_index) {
    const attr = $scope.attrList[_index];
    goodsService.attrEditAndAddModal('add', attr, class_id, $scope.class_name, '属性加挂成功！', function () {
      attr.is_attached = '1';
    });
  };

  $scope.query = function () {
    $location.search(angular.extend({}, $location.search(), { attr_keywd: $scope.attr_keywd }));

  };
}

export const goodsCategoryAddAttr: ng.IComponentOptions = {
  template: require('./goods-category-add-attr.template.html'),
  controller: goodsCategoryAddAttrController,
};
