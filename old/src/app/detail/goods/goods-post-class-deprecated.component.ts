import { IDataService } from '../../services/data-service/data-service.interface'
import * as _ from 'lodash';

goodsPostClassDeprecatedController.$inject = ['$scope', '$routeParams', '$location', 'dataService', '$uibModal', 'Notification', '$cookies']

export function goodsPostClassDeprecatedController($scope, $routeParams, $location, dataService: IDataService, $uibModal, Notification, $cookies) {
  const type = $scope.type = $routeParams.type;
  const goodId = $scope.goodId = $routeParams.goodId;
  let price = '';
  $scope.from = $routeParams.from;
  $scope.classType = true;
  $scope.select_f = [];
  $scope.classList = [];
  $scope.classSelect = [];
  $scope.isclassLast = false;

  if (goodId) {
    dataService.wanted_getItemDetail({
      item_id: goodId
    }).then(res => price = res.data.price)
  }
  const seller_privilege = $cookies.get('seller_privilege')

  if (seller_privilege == 1 || seller_privilege == 30) {
    /*
    dataService.circle_getCircleBySellerId().then(function (res) {
      if (typeof res.data === 'undefined') {
        var title = '提示',
          content = '请先创建圈子哦~';
        var modalInstance = $uibModal.open({
          template: require('./modal-jump-to-circle.html'),
          controller: 'modalJumpToCircleController',
          controllerAs: 'vm',
          size: 'sm',
          backdrop: false,
          resolve: {
            title: function () {
              return title;
            },
            content: function () {
              return content;
            }
          }
        });
      }
    });*/
  }

  //为选中的item添加类用的FLAG
  $scope.selectType = function(number, length, type) {

    $scope.select_f[type] = [];
    let i = 0;
    if (type == 0) {
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

  $scope.checkLast = function(childs) {
    if (childs == undefined || !childs[0]) {
      $scope.isclassLast = true;
    } else {
      $scope.isclassLast = false;
    }
  };

  $scope.selectedClass = function(cls) {
    const param = {
      class_id: cls,
      item_id: goodId,
      item_price: price
    };
    dataService.item_matchEditItem(param)
      .then(res => $location.url("/wanted/themeList/addAnswer?tid=" + $routeParams.tid + "&item_id=" + goodId + '&search_ids=' + $routeParams.search_ids + '&class_id=' + cls))
  };

  $scope.goClass = function(selectClass) {
    if (!$scope.isclassLast) return false;
    $location.url("/goods/Post/" + selectClass);
  };

  //跳转用的item的item的id
  $scope.setClass = function(index) {
    $scope.selectClass = index;
  };

  //选中的item的结果（从1开始）
  $scope.setList = function(index, type) {
    $scope.classSelect[type] = index;
    if (type == 1) {
      $scope.show2 = true;
      $scope.select_f[1] = false;
      $scope.show3 = false
    } else if (type == 2) {
      $scope.show3 = true;
      $scope.select_f[2] = false;
    }
  };

  $scope.renderClass = function() {
    dataService.item_classList().then(data => {
      const res = data.data;
      let classList = $scope.classList, length = res.length, temp = {}, i, j, k;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') {
          classList.push(_.assign(res[i], { childs: [] }));
        }
      }
      const cllength = classList.length;
      for (i = 0; i < length; i++) {
        if (res[i].parent_id === '0') continue;
        for (j = 0; j < cllength; j++) {
          if (res[i].parent_id == classList[j].class_id) {
            classList[j].childs.push(_.assign(res[i], { childs: [] }));
            break;
          }
        }
      }
      let flag = true;

      for (i = 0; i < length; i++) {
        if (res[i].class_path.indexOf(',') > -1) {
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
    })
  };

  if (goodId) {
    if (type == 'post') {

    } else if (type == "editPost") {
      dataService.item_getItem({ item_id: goodId }).then(data => {
        $scope.item_img_url = data.data.item_imgurl;
        $scope.item_name = data.data.item_name;
        //console.log(data);
        //获得品类的名称
        dataService.item_getClassInfo({
          class_id: data.data.class_id
        }).then(res => $scope.editClassType = res.data.class_name)
      });
    }
  }


  const init = function() {
    $scope.renderClass();
  };

  init();
}

export const goodsPostClassDeprecated: ng.IComponentOptions = {
  template: require('./goods-post-class-deprecated.template.html'),
  controller: goodsPostClassDeprecatedController
}
