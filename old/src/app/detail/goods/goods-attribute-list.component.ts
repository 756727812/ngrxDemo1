import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';

goodsAttributeListController.$inject = [
  '$scope',
  '$routeParams',
  'dataService',
  'Notification',
  '$location',
  '$uibModal',
  'goodsService',
  'seeModal',
];
export function goodsAttributeListController(
  $scope,
  $routeParams,
  dataService: IDataService,
  Notification,
  $location,
  $uibModal,
  goodsService,
  seeModal,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  const curr_page = $routeParams.page || 1;

  init();
  function init() {
    $scope.class = $location.hash() || '0';
    goodsService.getClass(function(classes) {
      $scope.tabs = angular.copy(classes);
    });
    if ($routeParams.keywd) {
      $scope.attrKeywd = $routeParams.keywd;
      dataService
        .attrib_find({
          attr_name: $scope.attrKeywd,
          mode: 1, // 模糊搜索
          page: curr_page,
          page_size: 20,
          class_id: $scope.class,
        })
        .then(res => {
          $scope.attributes = res.data.list;
          $scope.total_items = res.data.count;
        });
    } else getAttrList();
  }

  function getAttrList() {
    dataService
      .attrib_getList({
        page: curr_page,
        page_size: 20,
        class_id: $scope.class,
      })
      .then(res => {
        $scope.attributes = res.data.list;
        $scope.total_items = res.data.count;
      });
  }

  $scope.setTab = function(id) {
    $scope.class = id;
  };

  $scope.searchAttr = function() {
    if ($scope.attrKeywd) {
      $location.search({
        keywd: $scope.attrKeywd,
      });
    } else {
      const cur_url = '/goods/attribute';
      $location
        .path(cur_url)
        .search({})
        .hash($scope.class);
    }
  };

  $scope.manageAttr = function(attr) {
    let _s = attr.is_on === '1' ? '禁用' : '启用';
    seeModal.confirm(
      _s + '属性项',
      '确认' + _s + '属性项『' + attr.attr_name + '』？',
      function() {
        dataService
          .attrib_manage({
            attr_id: attr.attr_id,
            is_on: attr.is_on === '1' ? 0 : 1,
          })
          .then(res => {
            _s = res.data.is_on === '0' ? '禁用' : '启用';
            Notification.success(_s + '属性项成功！');
            getAttrList();
          });
      },
    );
  };
}

export const goodsAttributeList: ng.IComponentOptions = {
  template: require('./goods-attribute-list.template.html'),
  controller: goodsAttributeListController,
};
