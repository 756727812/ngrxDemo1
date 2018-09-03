import * as _ from 'lodash';;
import './goods-class-type.less';
goodsClassTypeCtrl.$inject = ['$scope', '$q', '$location', '$routeParams', '$cookies', '$uibModal', 'dataService'];
export function goodsClassTypeCtrl($scope, $q, $location, $routeParams, $cookies, $uibModal, dataService) {
  const vm = this;
  let price = null,
    seller_privilege = $cookies.get('seller_privilege');

  vm.goodsType = $location.path().split('/')[2];
  vm.goodId = $routeParams.goodId;
  vm.select_f = []; // 长度为3的数组，存放选中的品类索引
  vm.classList = [];  // 存放三级类目
  vm.classSelect = [-1];  // 存放选中的品类ID，有效值从索引为1开始；
  vm.isclassLast = false; // 当前选中的品类是否已没有子品类
  vm.from = $routeParams.from;  // 当前页面来源

  vm.selectType = selectType;
  vm.checkLast = checkLast;
  vm.selectedClass = selectedClass;
  vm.setClass = setClass;
  vm.setList = setList;

  activate();

  /**
   * 启动函数
   */
  function activate() {
    dataService.checkShopStatus({ url: $location.path(), status: 'check_update' });

    const promises = [getCircleBySellerId(), getItem(), renderClass()];
    return $q.all(promises);
  }

  /**
   * 为选中的item添加类用的FLAG
   */
  function selectType(index, type) {
    vm.select_f[type] = index;
    vm.select_f[++type] = false;
  }

  /**
   * 检查是否还有子品类
   * @param {childs} 当前选中品类的子品类数组
   * 一、二级品类childs为数组，三级品类没有childs
   */
  function checkLast(childs) {
    vm.isclassLast = typeof childs === 'undefined' || childs.length === 0;
  }

  /**
   * 匹配心愿的商品，设置其所属品类
   * @param { cls } 品类ID
   */
  function selectedClass(cls) {
    const param = {
      class_id: cls,
      item_id: vm.goodId,
      item_price: price,
    };
    return dataService.item_matchEditItem(param).then(function (res) {
      $location
        .path('/wanted/themeList/addAnswer')
        .search({
          tid: $routeParams.tid,
          item_id: vm.goodId,
          search_ids: $routeParams.search_ids,
          class_id: cls,
        });
    });
  }

  /**
   * 当前选中的品类ID
   * @param { id: String } 品类ID
   */
  function setClass(id) {
    vm.selectClass = id;
  }

  /**
   * 设置选中的品类ID的结果（从1开始），并显示或隐藏相应的品类选择框
   * @param { id: String } 选中的品类ID
   * @param { type: Number } 对应的品类级别： 1 - 一级品类； 2 - 二级品类； 3 - 三级品类
   */
  function setList(id, type) {
    vm.classSelect[type] = id;
    if (type === 1) {
      vm.show2 = true;
      vm.show3 = false;
    } else if (type === 2) {
      vm.show3 = true;
    }
  }

  /**
   * 商户权限判断是否创建了圈子，没有的话跳转创建
   */
  function getCircleBySellerId() {
    /*
    seller_privilege === '1' &&
    dataService.circle_getCircleBySellerId().then(function (res) {
      if (typeof res.data == 'undefined') {
        var modalInstance = $uibModal.open({
          animation: true,
          template: require('./modal-jump-to-circle.html'),
          controller: 'modalJumpToCircleController',
          controllerAs: 'vm',
          size: 'sm',
          backdrop: false,
          resolve: {
            title: function () {
              return '提示';
            },
            content: function () {
              return '请先创建圈子哦~';
            }
          }
        });
      }
    });*/
  }

  /**
   * 根据商品ID获取商品信息
   */
  function getItem() {
    vm.goodId &&
      dataService.wanted_getItemDetail({
        item_id: vm.goodId,
      }).then(function (res) {
        vm.item_img_url = res.data.item_imgurl;
        vm.item_name = res.data.item_name;
        price = res.data.price;
        //获得品类的名称
        dataService.item_getClassInfo({
          class_id: res.data.class_id,
        }).then(function (reData) {
          vm.editClassType = reData.data.class_name;
        });
      });
  }

  /**
   * 渲染获取的品类
   */
  function renderClass() {
    dataService.item_class2List({
      only_on: 1,
    }).then(function (data) {
      const res = data.data;
      let classList = vm.classList, length = res.length, temp = {}, i, j, k;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') {
          classList.push(_.assign({}, res[i], { childs: [] }));
        }
      }
      const cllength = classList.length;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') continue;
        for (j = 0; j < cllength; j++) {
          if (res[i].parent_id === classList[j].class_id) {
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
              if (classList[j].childs[k].class_id === res[i].parent_id) {
                classList[j].childs[k].childs.push(res[i]);
                flag = false;
                break;
              }
            }
          }
        }
      }
    });
  }
}

export const goodsClassType: ng.IComponentOptions = {
  template: require('./goods-class-type.template.html'),
  controller: goodsClassTypeCtrl,
};
