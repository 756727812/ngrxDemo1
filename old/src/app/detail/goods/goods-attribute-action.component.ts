/**
 * 属性项功能: 新建、编辑
 */
import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';

goodsAttributeActionController.$inject = [
  '$scope',
  '$routeParams',
  'dataService',
  'Notification',
  'goodsService',
  '$location',
];
export function goodsAttributeActionController(
  $scope,
  $routeParams,
  dataService: IDataService,
  Notification,
  goodsService,
  $location,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  // $scope.labels = []; // 一级品类
  const attr_id = $routeParams.id; // 编辑属性项
  $scope.isEdit = !!attr_id; // 判断是否是编辑
  $scope.subDelIds = []; // 编辑时存储删除的ID
  $scope.delIds = [];
  $scope.formError = [];
  $scope.attrType2CustomArr = [];
  $scope.attrType5CustomArr = [];
  $scope.attrType6CustomArr = [];
  $scope.attrType6ValueArr = [{ selected: {} }];

  let attrData = {}; // 如果是编辑，保存原始属性项数据
  $scope.formData = {
    class_ids: [], // 加挂该属性的一级类目
    attr_type: '',
    attr_value: [],
    customizable: '1',
  };

  $scope.onelvlClass = {}; // 加挂该属性的一级类目

  $scope.attrs = {
    // 临时存储填写的属性值
    1: [], // attr_type == 1 || attr_type == 2
    5: [], // attr_type == 5 || attr_type == 6
  };

  $scope.$watch(
    'attrs[5]',
    function(cur) {
      if ($scope.formData.attr_type == 5) {
        $scope.getAttrType5Value = [];
        angular.forEach($scope.attrs[5], function(v1, k1) {
          angular.forEach(v1.values, function(v2, k2) {
            $scope.getAttrType5Value.push({
              name: v1.name,
              value: v2,
            });
          });
        });
      }
    },
    true,
  );

  $scope.type5Show = {
    radio: null,
  };

  $scope.type6Show = [];

  // 排序种子
  function compare(a, b) {
    if (a.weight < b.weight) return -1;
    else if (a.weight > b.weight) return 1;
    else return 0;
  }

  init();
  function init() {
    goodsService.getClass(function(classes) {
      const _t = angular.copy(classes);
      _t.shift();
      $scope.labels = _t;
    });

    if (attr_id) {
      // 进入编辑
      dataService
        .attrib_get({
          attr_id,
        })
        .then(res => {
          $scope.formData = attrData = res.data;
          angular.forEach(res.data.class_ids, function(v, k) {
            $scope.onelvlClass[v] = true;
          });
          const _type = res.data.attr_type;
          if (_type == 1 || _type == 2) {
            angular.forEach(res.data.option_values, function(v, k) {
              const _obj = {
                id: k,
                value: v.attr_value,
                weight: v.__order_weight,
              };
              $scope.attrs[1].push(_obj);
            });
            $scope.attrs[1].sort(compare);
          } else if (_type == 5) {
            angular.forEach(res.data.groups, function(v, k) {
              const _valArr = [];
              angular.forEach(v.values, function(_v, _k) {
                const _t = {
                  id: _k,
                  value: _v.attr_value,
                  weight: _v.__order_weight,
                };
                _valArr.push(_t);
              });
              $scope.attrs[5].push({
                id: k,
                name: v.group_name,
                weight: v.__order_weight,
                values: _valArr.sort(compare),
              });
            });
            $scope.attrs[5].sort(compare);
          } else if (_type == 6) {
            angular.forEach(res.data.ways, function(v, k) {
              const _valArr = [];
              angular.forEach(v.values, function(_v, _k) {
                const _t = {
                  id: _k,
                  value: _v.attr_value,
                  weight: _v.__order_weight,
                };
                _valArr.push(_t);
              });
              $scope.attrs[5].push({
                id: k,
                name: v.display_name,
                weight: v.__order_weight,
                values: _valArr.sort(compare),
              });
            });
            $scope.attrs[5].sort(compare);
          }
        });
    }
  }

  $scope.getIndex = function(i) {
    $scope.currIndex = i;
  };
  $scope.setResult = function(n, i) {
    $scope.isOpen = {};
    $scope.isOpen[i] = false;
    $scope.type6Show[$scope.currIndex].name = n;
  };

  /**
   * 交换数组元素位置，实现上下移动
   */
  $scope.swapArrEle = function swapArrEle(arr, k1, k2) {
    if (k2 < 0) k2 = arr.length - 1;
    if (k2 >= arr.length) k2 = 0;
    if (k1 < arr.length && k2 < arr.length) {
      const _t = arr[k2];
      arr[k2] = arr[k1];
      arr[k1] = _t;
    }
  };

  /**
   * 检查填写的属性项名称是否已被创建
   */
  $scope.checkAttrName = function() {
    if ($scope.formData.attr_name) {
      $scope.isExist = false;
      $('#attr_name').removeClass('error');
      dataService
        .attrib_find({
          attr_name: $scope.formData.attr_name,
          mode: 0,
        })
        .then(res => {
          if (res.data.length > 0) {
            $scope.formError.push('该属性项名已存在！');
            $('#attr_name').addClass('error');
          } else {
            $scope.formError.splice(
              $scope.formError.indexOf('该属性项名已存在！'),
              1,
            );
            $('#attr_name').removeClass('error');
          }
        });
    }
  };

  /**
   * 根据对象的键值获取所在数组的index
   */
  function findIndexByKeyValue(arraytosearch, key, valuetosearch) {
    for (let i = 0; i < arraytosearch.length; i++) {
      if (arraytosearch[i][key] == valuetosearch) {
        return i;
      }
    }
    return null;
  }

  /**
   * 编辑下删除单个属性值  type == 1 || type == 2
   */
  $scope.delAttr = function(attrType, id, index) {
    $scope.delIds.push(id);
    attrType.splice(index, 1);
  };

  $scope.delAttrSub = function(attrType, id, index, parent_id) {
    $scope.subDelIds.push({
      p_id: parent_id,
      id,
    });
    attrType.splice(index, 1);
  };

  /**
   * 保存/更新属性项
   */
  $scope.saveNewAttr = function() {
    if (~$scope.formError.indexOf('该属性项名已存在！')) {
      $scope.formError = ['该属性项名已存在！'];
      $('#attr_name').addClass('error');
    } else {
      $scope.formError = [];
      $('#attr_name').removeClass('error');
    }
    $scope.formData.class_ids = [];
    Object.keys($scope.onelvlClass).forEach(function(k) {
      if ($scope.onelvlClass[k]) $scope.formData.class_ids.push(k);
    });
    if ($scope.formData.class_ids.length === 0) {
      $scope.formError.push('请至少选择一项加挂属性的一级类目！');
      return -1;
    }

    if ($scope.isEdit) {
      // 编辑
      const d = $scope.formData,
        params = {
          attr_id: d.attr_id,
          attr_name: d.attr_name,
          display_name: d.display_name,
          tips: d.tips,
          remark: d.remark,
          attr_type: d.attr_type,
          customizable: d.customizable,
          class_ids: d.class_ids,
        };

      if (d.attr_type === '1' || d.attr_type === '2') {
        const _l = $scope.attrs[1].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性值！');
        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[1][_i].value === '')
            $scope.formError.push('请勿填写空的属性值名称！');
          if (_i + 1 < _l)
            if ($scope.attrs[1][_i].value === $scope.attrs[1][_i + 1].value)
              $scope.formError.push('请勿重复相同的属性值名称！');
        }
        if ($scope.formError.length > 0) return -1;
        angular.extend(params, {
          option_values: {
            update: {},
            delete: $scope.delIds,
            create: [],
          },
        });
        angular.forEach($scope.attrs[1], function(v, k) {
          angular.extend(v, {
            __order_weight: k + 1,
          });
          if (v.id === '-1') return;
          const _t = {};
          _t[v.id] = {
            value: v.value,
            __order_weight: v.__order_weight,
          };
          angular.extend(params['option_values']['update'], _t);
        });
        params['option_values']['create'] = $scope.attrs[1]
          .filter(function(v) {
            return v.id === '-1' && v.value;
          })
          .map(function(v) {
            return {
              value: v.value,
              __order_weight: v.__order_weight,
            };
          });
      } else if (d.attr_type === '5') {
        const _l = $scope.attrs[5].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性组！');

        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[5][_i].values.length === 0)
            $scope.formError.push('请至少填写一个属性组选项！');
          if ($scope.attrs[5][_i].name === '')
            $scope.formError.push('请勿填写空的属性组名称！');
          angular.forEach($scope.attrs[5][_i], function(v, k) {
            if (v.name === '')
              $scope.formError.push('请勿填写空的属性组选项！');
          });
          if (_i + 1 < _l)
            if ($scope.attrs[5][_i].name === $scope.attrs[5][_i + 1].name)
              $scope.formError.push('请勿重复相同的组名！');
        }
        if ($scope.formError.length > 0) return -1;
        angular.extend(params, {
          groups: {
            update: {},
            delete: $scope.delIds,
            create: [],
          },
        });
        angular.forEach($scope.attrs[5], function(v, k) {
          angular.extend(v, {
            __order_weight: k + 1,
          });
          if (v.id === '-1') return;
          const _t = {};
          _t[v.id] = {
            group_name: v.name,
            __order_weight: v.__order_weight,
            values: {
              update: {},
              delete: $scope.subDelIds,
              create: [],
            },
          };
          angular.forEach(v.values, function(_v, _k) {
            angular.extend(_v, {
              __order_weight: _k + 1,
            });
            if (_v.id === '-1') return;
            const _tSub = {};
            _tSub[_v.id] = {
              __order_weight: _k + 1,
              value: _v.value,
            };
            angular.extend(_t[v.id]['values']['update'], _tSub);
          });
          _t[v.id]['values']['create'] = v.values
            .filter(function(item) {
              return item.id === '-1' && item.value;
            })
            .map(function(item) {
              return {
                __order_weight: item.__order_weight,
                value: item.value,
              };
            });

          angular.extend(params['groups']['update'], _t);
        });
        params['groups']['create'] = $scope.attrs[5]
          .filter(function(v) {
            return v.id === '-1' && v.name;
          })
          .map(function(v) {
            return {
              group_name: v.name,
              __order_weight: v.__order_weight,
              values: v.values.map(function(_v) {
                return _v.value;
              }),
            };
          });
      } else if (d.attr_type === '6') {
        const _l = $scope.attrs[5].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性组！');

        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[5][_i].values.length === 0)
            $scope.formError.push('请至少填写一个属性组选项！');
          if ($scope.attrs[5][_i].name === '')
            $scope.formError.push('请勿填写空的属性组名称！');
          angular.forEach($scope.attrs[5][_i], function(v, k) {
            if (v.name === '')
              $scope.formError.push('请勿填写空的属性组选项！');
          });
          if (_i + 1 < _l)
            if ($scope.attrs[5][_i].name === $scope.attrs[5][_i + 1].name)
              $scope.formError.push('请勿重复相同的组名！');
        }
        if ($scope.formError.length > 0) return -1;
        angular.extend(params, {
          ways: {
            update: {},
            delete: $scope.delIds,
            create: [],
          },
        });
        angular.forEach($scope.attrs[5], function(v, k) {
          angular.extend(v, {
            __order_weight: k + 1,
          });
          if (v.id === '-1') return;
          const _t = {};
          _t[v.id] = {
            display_name: v.name,
            __order_weight: v.__order_weight,
            values: {
              update: {},
              delete: $scope.subDelIds
                .filter(function(item) {
                  return item.p_id === v.id;
                })
                .map(function(_item) {
                  return _item.id;
                }),
              create: [],
            },
          };
          angular.forEach(v.values, function(_v, _k) {
            angular.extend(_v, {
              __order_weight: _k + 1,
            });
            if (_v.id === '-1') return;
            const _tSub = {};
            _tSub[_v.id] = {
              __order_weight: _k + 1,
              value: _v.value,
            };
            angular.extend(_t[v.id]['values']['update'], _tSub);
          });
          _t[v.id]['values']['create'] = v.values
            .filter(function(item) {
              return item.id === '-1' && item.value;
            })
            .map(function(item) {
              return {
                __order_weight: item.__order_weight,
                value: item.value,
              };
            });
          angular.extend(params['ways']['update'], _t);
        });
        params['ways']['create'] = $scope.attrs[5]
          .filter(function(v) {
            return v.id === '-1' && v.name;
          })
          .map(function(v) {
            return {
              display_name: v.name,
              __order_weight: v.__order_weight,
              values: v.values.map(function(_v) {
                return _v.value;
              }),
            };
          });
      }

      dataService
        .attrib_update({
          attr_id: params.attr_id,
          attr_value: JSON.stringify(params),
        })
        .then(res => {
          Notification.success('属性项信息更新成功！');
          const cur_url = '/goods/attribute';
          $location.path(cur_url);
        });
    } else {
      // 新建
      $scope.formData.class_ids = JSON.stringify($scope.formData.class_ids);
      if (
        $scope.formData.attr_type == '1' ||
        $scope.formData.attr_type == '2'
      ) {
        // 单选/多选
        const _l = $scope.attrs[1].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性值！');
        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[1][_i] === '')
            $scope.formError.push('请勿填写空的属性值名称！');
          if (_i + 1 < _l)
            if ($scope.attrs[1][_i] === $scope.attrs[1][_i + 1])
              $scope.formError.push('请勿重复相同的属性值名称！');
        }
        if ($scope.formError.length > 0) return -1;
        $scope.attrs[1].forEach(function(val, key) {
          $scope.formData.attr_value.push(val);
        });
        $scope.formData.attr_value = JSON.stringify($scope.formData.attr_value);
      }

      if ($scope.formData.attr_type == '3' || $scope.formData.attr_type == '4')
        $scope.formData.attr_value = undefined; // 数值、文本

      if ($scope.formData.attr_type == '5') {
        // 非互斥分组多选类型
        const _l = $scope.attrs[5].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性组！');

        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[5][_i].values.length === 0)
            $scope.formError.push('请至少填写一个属性组选项！');
          if ($scope.attrs[5][_i].name === '')
            $scope.formError.push('请勿填写空的属性组名称！');
          angular.forEach($scope.attrs[5][_i], function(v, k) {
            if (v.name === '')
              $scope.formError.push('请勿填写空的属性组选项！');
          });
          if (_i + 1 < _l)
            if ($scope.attrs[5][_i].name === $scope.attrs[5][_i + 1].name)
              $scope.formError.push('请勿重复相同的组名！');
        }
        if ($scope.formError.length > 0) return -1;
        angular.forEach($scope.attrs[5], function(val, key) {
          $scope.formData.attr_value[key] = {};
          angular.extend($scope.formData.attr_value[key], {
            group_name: val.name,
            values: val.values,
          });
        });
        $scope.formData.attr_value = JSON.stringify($scope.formData.attr_value);
      }

      if ($scope.formData.attr_type == '6') {
        // 互斥分组多选类型
        const _l = $scope.attrs[5].length;
        if (_l === 0) $scope.formError.push('请至少填写一个属性组！');

        for (let _i = 0; _i < _l; _i++) {
          if ($scope.attrs[5][_i].values.length === 0)
            $scope.formError.push('请至少填写一个属性组选项！');
          if ($scope.attrs[5][_i].name === '')
            $scope.formError.push('请勿填写空的属性组名称！');
          angular.forEach($scope.attrs[5][_i], function(v, k) {
            if (v.name === '')
              $scope.formError.push('请勿填写空的属性组选项！');
          });
          if (_i + 1 < _l)
            if ($scope.attrs[5][_i].name === $scope.attrs[5][_i + 1].name)
              $scope.formError.push('请勿重复相同的组名！');
        }
        if ($scope.formError.length > 0) return -1;
        angular.forEach($scope.attrs[5], function(val, key) {
          $scope.formData.attr_value[key] = {};
          angular.extend($scope.formData.attr_value[key], {
            way_name: val.name,
            values: val.values,
          });
        });
        $scope.formData.attr_value = JSON.stringify($scope.formData.attr_value);
      }
      dataService.attrib_create($scope.formData).then(res => {
        Notification.success('属性创建成功！');
        const cur_url = '/goods/attribute';
        $location.path(cur_url);
      });
    }
  };
}

export const goodsAttributeAction: ng.IComponentOptions = {
  template: require('./goods-attribute-action.template.html'),
  controller: goodsAttributeActionController,
};
