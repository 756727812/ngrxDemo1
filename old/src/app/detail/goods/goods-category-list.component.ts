import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

const version = +new Date();

goodsCategoryListController.$inject = ['$scope', '$routeParams', '$location', 'dataService', '$timeout', '$uibModal', 'Notification'];
export function goodsCategoryListController($scope, $routeParams: ng.route.IRouteParamsService, $location: ng.ILocationService, dataService: IDataService, $timeout, $uibModal, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }
  $scope.hash = $location.hash() || '1';
  $scope.list_mall_class = [];
  $scope.list_class = [];
  $scope.keywd = '';// $routeParams['keywd'] || '';

  $scope.classList = [];
  $scope.select_f = [[], [], []];
  $scope.classSelect = [];
  let classListData;
  //为选中的item添加类用的FLAG
  $scope.selectType = function (number, length, type) {

    $scope.select_f[type] = [];
    let i = 0;
    if (type === 0) {
      for (i = 0; i < length - 1; i++) {
        $scope.select_f[type][i] = false;
        $scope.select_f[1][i] = false;
      }
    } else {
      for (i = 0; i < length - 1; i++) {
        $scope.select_f[type][i] = false;
      }
    }
    $scope.select_f[type][number] = true;
  };

  //选中的item的结果（从1开始）
  $scope.setList = function (index, type) {
    $scope.classSelect[type] = index;
    if (type == 1) {
      $scope.show2 = true;
      $scope.select_f[1] = false;
      $scope.show3 = false;
    } else if (type == 2) {
      $scope.show3 = true;
      $scope.select_f[2] = false;
    }
  };
  $scope.setRoot = function (class_id) {
    $scope.root_id = class_id;
  };

  $scope.submitSearch = function () {
    //console.log('keywd:',$scope.keywd)
    if ($scope.hash === '1') {
      $scope.filterKeywd();
    } else if ($scope.hash === '2') {
      $scope.filterMallKeywd();
    }
  };


  $scope.filterKeywd = function () {
    $scope.select_f = [[], [], []];
    $scope.classSelect = [];
    $scope.show2 = false;
    $scope.show3 = false;
    let _t, _r = classListData.filter(function (item) {
        return item.class_name.match($scope.keywd) !== null;
      });
    if (_r.length > 0) {
      _t = _r[0];
      if (_t.parent_id === '0') { // 一级品类
        $scope.show2 = true;
        $scope.show3 = false;
        angular.forEach($scope.classList, function (v, i) {
          if (_t.class_id === v.class_id) {
            $scope.classSelect[1] = i;
            $scope.select_f[0][i] = true;
          }
        });
      } else {
        const parent = classListData.filter(function (val) {
          return val.class_id == _t.parent_id;
        })[0];
        $scope.show2 = true;
        $scope.show3 = true;
        if (parent.parent_id === '0') { // 二级品类
          angular.forEach($scope.classList, function (v, i) {
            if (parent.class_id === v.class_id) {
              $scope.classSelect[1] = i;
              $scope.select_f[0][i] = true;
            }
          });
          angular.forEach($scope.classList[$scope.classSelect[1]].childs, function (v, i) {
            if (_t.class_id === v.class_id) {
              $scope.classSelect[2] = i;
              $scope.select_f[1][i] = true;
            }
          });
        } else {    // 三级品类
          const ancester = classListData.filter(function (val) {
            return val.class_id === parent.parent_id;
          })[0];
          angular.forEach($scope.classList, function (v, i) {
            if (ancester.class_id === v.class_id) {
              $scope.classSelect[1] = i;
              $scope.select_f[0][i] = true;
            }
          });
          angular.forEach($scope.classList[$scope.classSelect[1]].childs, function (v, i) {
            if (parent.class_id === v.class_id) {
              $scope.classSelect[2] = i;
              $scope.select_f[1][i] = true;
            }
          });
          angular.forEach($scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]].childs, function (v, i) {
            if (_t.class_id === v.class_id) {
              $scope.classSelect[3] = i;
              $scope.select_f[2][i] = true;
            }
          });

        }
      }
    }
  };
  /**
   * 检查新建/修改的品类名是否有重复
   * @_lvl: 对应品类级别
   * @catObj: 需要查重的品类对象 {class_name: 'xxx'}
   */
  function duplicateCheck(_lvl, catObj) {
    let currentCats, flag = false,
      checkExists = function (array) {
        return array.filter(function (i) { return catObj.class_name == i.class_name; }).length > 0;
      };
    if (_lvl == 1) {
      currentCats = $scope.classList;
      if (checkExists(currentCats)) {
        Notification.warn('已有同名一级品类！');
        flag = true;
      }
    } else if (_lvl == 2) {
      currentCats = $scope.classList[$scope.classSelect[1]].childs;
      if (checkExists(currentCats)) {
        Notification.warn('已有同名二级品类！');
        flag = true;
      }
    } else if (_lvl == 3) {
      currentCats = $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]].childs;
      if (checkExists(currentCats)) {
        Notification.warn('已有同名三级品类！');
        flag = true;
      }
    } else {
      Notification.warn('不存在当前级别的品类！');
      flag = true;
    }
    return flag;
  }
  $scope.newCat = function (lvl) {
    const parents = function () {
      if (lvl == 2) {
        return [$scope.classList[$scope.classSelect[1]]];
      } else if (lvl == 3) {
        return [$scope.classList[$scope.classSelect[1]], $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]]];
      } else {
        return [];
      }
    };
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-create-new-category.template.html'),
      controller: 'createNewCatModalCtrl',
      size: 'md',
      resolve: {
        lvl() {
          return lvl == 1 && '一' || lvl == 2 && '二' || lvl == 3 && '三';
        },
        parents() {
          return parents();
        },
      },
    });

    modalInstance.result.then(function (_params) {
      if (_params) {
        if (lvl == 3) {
          if (!(_params.class_name && _params.class_weight)) {
            Notification.dataError('品类填写不完整');
            return;
          }
          if (_params.class_weight < 0) {
            Notification.dataError('重量必须大于0');
            return;
          }
        }
        if (duplicateCheck(lvl, _params)) return;
        angular.extend(_params, {
          parent_id: lvl == 1 && parents() || angular.copy(parents()).reverse()[0].class_id,
        });
        dataService.item_createClass2(_params).then(res => {
          Notification.success('创建品类成功！');
          $scope.classList = [];
          return renderClass();
        });
      }
    });
  };
  $scope.editCat = function (lvl) {
    const target = function () {
      if (lvl == 1) {
        return $scope.classList[$scope.classSelect[1]];
      } else if (lvl == 2) {
        return $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]];
      } else if (lvl == 3) {
        return $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]].childs[$scope.classSelect[3]];
      }
    };

    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-create-new-category.template.html'),
      controller: 'editCatModalCtrl',
      size: 'md',
      resolve: {
        old_name() {
          return target().class_name;
        },
      },

    });

    modalInstance.result.then(function (_params) {
      if (_params) {
        if (duplicateCheck(lvl, _params)) return;
        angular.extend(_params, {
          class_id: target().class_id,
        });
        dataService.item_updateClass2(_params).then(res => {
          Notification.success('修改品类成功！');
          $scope.classList.length = 0;
          renderClass();
        });
      }
    });
  };
  $scope.modifyStatus = function (lvl, index) {
    let _target;
    if (lvl == 1) {
      _target = $scope.classList[$scope.classSelect[1]];
    } else if (lvl == 2) {
      _target = $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]];
    } else if (lvl == 3) {
      _target = $scope.classList[$scope.classSelect[1]].childs[$scope.classSelect[2]].childs[$scope.classSelect[3]];
    }
    const _params = {
      class_id: _target.class_id,
      is_on: _target.is_on == '1' && 1 || JSON.stringify(_target.is_on),
    };
    dataService.item_updateClass2(_params).then(res => {
      Notification.success('修改上下线状态成功！');
      $scope.classList.length = 0;
      renderClass();
    });
  };
  function handleiCheck() {
    if (!(<any>$()).iCheck) return;
    $(':checkbox:not(.js-switch, .switch-input, .switch-iphone, .onoffswitch-checkbox, .ios-checkbox), :radio').each(function () {
      const checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
      const radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';

      if (~checkboxClass.indexOf('_line') || ~radioClass.indexOf('_line')) {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
          insert: '<div class="icheck_line-icon"></div>' + $(this).attr('data-label'),
        });
      } else {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
        });
      }
    });
  }
  function renderClass() {
    $scope.list_mall_class = [];

    dataService.item_class2List().then(data => {
      $scope.types = data.data.map(function (v, k) { return v.class_name; });
      classListData = angular.copy(data.data);
      const res = data.data;
      let classList = $scope.classList, length = res.length, temp = {}, i, j, k;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') {
          classList.push(_.assign({}, res[i], { childs: [] }));
        }
      }
      const cllength = classList.length;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') continue;
        for (j = 0; j < cllength; j++) {
          if (res[i].parent_id == classList[j].class_id) {
            classList[j].childs.push(_.assign({}, res[i], { childs: [] }));
            break;
          }
        }
      }
      let flag = true;

      for (i = 0; i < length; i++) {
        if (~res[i].class_path.indexOf(',')) {
          flag = true;
          for (j = 0; j < cllength; j++) {
            if (!flag) break;
            const templ = classList[j].childs.length;
            for (k = 0; k < templ; k++) {
              if (classList[j].childs[k].class_id == res[i].parent_id) {
                classList[j].childs[k].childs.push(res[i]);
                flag = false;
                break;
              }
            }
          }
        }
      }

      if ($scope.keywd !== '') {
        //  $scope.filterKeywd();
      }
      $timeout(function () {
        handleiCheck();
      });
    });
  }


  $scope.filterMallKeywd = function () {
    $scope.select_f = [[], [], []];
    $scope.show2 = false;
    //  console.log($scope.keywd)
    angular.forEach($scope.list_mall_class, function (v, i) {
      // console.log(v.mall_class_name)
      if ($scope.keywd === v.mall_class_name) {
        const cur_index = i;
        //console.log('cur_index',cur_index,v)
        $scope.selectMallClass(cur_index, $scope.list_mall_class.length, 0);
        $scope.setMallItemList($scope.list_mall_class[cur_index]);
        return true;
      }
    });
  };

  function renderMallClass(mall_class_id = 0) {
    $scope.classList = [];
    dataService.mall_mallClassList({}).then(res => {
      $scope.list_mall_class = res.data.list_mall_class;
      $scope.list_class = res.data.list_class;
      //   console.log($scope.list_class)

      $scope.types = [];
      angular.forEach($scope.list_mall_class, function (v, i) {
        $scope.types.push(v.mall_class_name);
      });

      let cur_index = 0;
      if (Number(mall_class_id) > 0) {
        angular.forEach($scope.list_mall_class, function (v, i) {
          if (Number(v.mall_class_id) == Number(mall_class_id)) {
            cur_index = i;
            return true;
          }
        });
      }
      //   console.log('cur_index',cur_index,mall_class_id)
      $scope.selectMallClass(cur_index, $scope.list_mall_class.length, 0);
      $scope.setMallItemList($scope.list_mall_class[cur_index]);

      if ($scope.keywd !== '') {
        //  $scope.filterMallKeywd();
      }
      return $scope.list_mall_class;
    });
  }

  //为选中的item添加类用的FLAG
  $scope.selectMallClass = function (number, length, type) {
    $scope.select_f[type] = [];
    let i = 0;
    if (type === 0) {
      for (i = 0; i < length - 1; i++) {
        $scope.select_f[type][i] = false;
        $scope.select_f[1][i] = false;
      }
    } else {
      for (i = 0; i < length - 1; i++) {
        $scope.select_f[type][i] = false;
      }
    }
    $scope.select_f[type][number] = true;

    $scope.show2 = true;
  };

  //选中的item的结果（从1开始）
  $scope.setMallItemList = function (item) {
    angular.forEach($scope.list_class, function (v, i) {
      v.is_relate = '0';
      //判断是否为当前的
      v.mall_class_id = '0';
      angular.forEach(item.list_class_id, function (v_item_class, i_item_class) {
        if (Number(v_item_class) == Number(v.class_id)) {
          v.mall_class_id = item.mall_class_id;
          v.is_relate = '1';
          return true;
        }
      });
      if (v.mall_class_id !== '0') {
        return true;
      }
      v.mall_class_id = item.mall_class_id;
      v.is_relate = '0';
      //判断是否在别的里面
      angular.forEach($scope.list_mall_class, function (v_mall, i_mall) {
        angular.forEach(v_mall.list_class_id, function (v_item_class, i_item_class) {
          if (Number(v_item_class) == Number(v.class_id)) {
            v.mall_class_id = v_mall.mall_class_id;
            v.is_relate = '-1';
            return true;
          }
        });
      });

    });

    const new_list = [];
    angular.forEach($scope.list_class, function (v, i) {
      if (v.is_relate === '1') {
        new_list.push(v);
      }
    });
    angular.forEach($scope.list_class, function (v, i) {
      if (v.is_relate === '0') {
        new_list.push(v);
      }
    });
    angular.forEach($scope.list_class, function (v, i) {
      if (v.is_relate === '-1') {
        new_list.push(v);
      }
    });
    $scope.list_class = new_list;
  };

  $scope.modifyIsPublish = function (item) {
    //     console.log('modifyIsPublish',item)
    let tips_success = '商品品类上线成功';
    if (Number(item.is_public) == 0) {
      tips_success = '商品品类下线成功';
    }
    const params = {
      mall_class_id: item.mall_class_id,
      is_public: Number(item.is_public),
    };
    const params_post = {
      class_info: JSON.stringify(params),
    };
    dataService.mall_mallClassSet(params_post).then(res => {
      Notification.success(tips_success);
      $scope.list_mall_class.length = 0;
      renderMallClass(params.mall_class_id);
    });
  };

  $scope.newMallClass = function () {
    $scope.editMallClass({
      mall_class_id: '0',
      mall_class_name: '',
    });
  };
  $scope.editMallClass = function (item) {
    const tmp_item = {
      mall_class_id: item.mall_class_id,
      mall_class_name: item.mall_class_name,
    };
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal-create-mall-class.template.html'),
      controller: 'createMallClassCtrl',
      size: 'md',
      resolve: {
        class_info: () => tmp_item,
      },

    });

    modalInstance.result.then(function (_params) {
      const params = {
        class_info: JSON.stringify(_params),
      };
      let tips_success = '';
      if (_params.mall_class_id === '0') {
        tips_success = '创建商城品类成功';
        dataService.mall_mallClassAdd(params).then(res => {
          Notification.success(tips_success);
          $scope.list_mall_class.length = 0;
          renderMallClass(_params.mall_class_id);
        });
      } else {
        tips_success = '编辑商城品类名称成功';
        dataService.mall_mallClassSet(params).then(res => {
          Notification.success(tips_success);
          $scope.list_mall_class.length = 0;
          renderMallClass(_params.mall_class_id);
        });
      }
    });
  };

  $scope.funcRelate = function (item) {
    //    console.log('funcRelate',item)
    let tips_success = '关联成功';
    if (item.is_relate === '1') {
      tips_success = '取消关联成功';
    }
    const params = {
      mall_class_id: item.mall_class_id,
      class_id: item.class_id,
      is_public: item.is_relate === '0' ? 1 : 0,
    };
    dataService.mall_mallRelateSet(params).then(res => {
      Notification.success(tips_success);
      $scope.list_mall_class.length = 0;
      renderMallClass(item.mall_class_id);
    });
  };

  $scope.selectTab = function () {
    $location.search({});
  };

  if ($scope.hash === '1') {
    renderClass();
  } else if ($scope.hash === '2') {
    renderMallClass();
  }

}

export const goodsCategoryList: ng.IComponentOptions = {
  template: require('./goods-category-list.template.html'),
  controller: goodsCategoryListController,
};
