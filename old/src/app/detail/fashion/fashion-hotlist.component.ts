// (function () {
// 'use strict';
import * as angular from 'angular';
import { IDataService } from '../../services/data-service/data-service.interface';
import * as _ from 'lodash';;
import * as moment from 'moment';

export const fashionHotlist = {
  template: require('./fashion-hotlist.template.html'),
  controller: hotlistController,
};
const version = +new Date();

// angular
//   .module('seego.fashion')
//   .component('fashionHotlist', {
//     templateUrl: 'detail/fashion/fashion-hotlist.template.html?v=' + version,
//     controller: hotlistController
//   })

hotlistController.$inject = ['$scope', '$routeParams', '$q', 'Notification', '$location', 'seeModal', 'fashionService', 'dataService', '$log'];
function hotlistController($scope, $routeParams, $q, Notification, $location, seeModal, fashionService, dataService: IDataService, $log) {
  const $ctrl = this;
  let page = $routeParams.page || 1,
    user_id;
  $ctrl.platform = $routeParams.platform;
  $ctrl.list_type = $location.hash() || 'today';
  $ctrl.dt = moment($routeParams.date)['_d'];
  $ctrl.start_date = calcStartDate($ctrl.dt);
  $ctrl.searchLib = searchLib;
  $ctrl.seeDetail = seeDetail;
  $ctrl.addToFavorite = addToFavorite;
  $ctrl.generateWish = generateWish;
  $ctrl.calcPeriod = calcPeriod;
  $ctrl.removeFavoriteItem = removeFavoriteItem;

  $scope.$watch('$ctrl.dt', function (cur, prev) {
    if (typeof cur !== 'undefined' && cur !== prev) {
      $location.search(angular.extend({}, $location.search(), {
        date: moment(cur).format('YYYY-MM-DD'),
      }));
    }
  });

  $ctrl.$onInit = activate;

  function activate() {
    const promises = [getPlatform(), getCatlog(), checkPopEditKol()];
    return $q.all(promises).then(function () {
      return fashionService.getUid().then(function (uid) {
        user_id = uid;
        return getHotList();
      });
    });
  }

  //临时加的法务需求，强制让Kol编辑资料，并且在几个页面加判断
  function checkPopEditKol() {
    dataService.seller_checkPopEditKol().then(res => {
      if (res.data.pop == 1) {
        seeModal.confirmP('注意', '后台系统升级，为了提升账号安全性，请你前往个人中心补充个人信息', '现在就去^_^', false)
          .then(() => $location.url('personalInfo/account/modifyinfo-kol?id=' + res.data.id));
      }
    });
  }

  /**
   * 左侧的平台筛选
   */
  function searchLib(type) {
    $location.search(angular.extend({}, $location.search(), {
      platform: type,
    }));
  }

  function seeDetail(item) {
    return fashionService.fashionDetail(item);
  }

  function addToFavorite(item_id) {
    return fashionService.addToFavorite(item_id, user_id).then(function () {
      const index = _.findIndex($ctrl.hotlist, function (o) { return o['_id'] === item_id; });
      $ctrl.hotlist[index].isfavorite = true;
      return $ctrl.hotlist;
    });
  }
  function removeFavoriteItem(item_id) {
    fashionService.removeFavoriteItem(item_id, user_id, function () {
      const index = _.findIndex($ctrl.hotlist, function (o) { return o['_id'] === item_id; });
      $ctrl.hotlist[index].isfavorite = false;
      return $ctrl.hotlist;
    });
  }
  function generateWish(desc, img_url) {
    fashionService.generateWish(desc, img_url);
  }
  function calcStartDate(date) {
    switch ($ctrl.list_type) {
      case 'daily':
        return moment(date).subtract(1, 'days').format('YYYY-MM-DD');
      case 'weekly':
        return moment(date).subtract(7, 'days').format('YYYY-MM-DD');
      case 'monthly':
        return moment(date).subtract(30, 'days').format('YYYY-MM-DD');
      default:
        return moment(date).format('YYYY-MM-DD');
    }
  }
  function calcPeriod() {
    switch ($ctrl.list_type) {
      case 'daily':
        return $ctrl.start_date + ' - ' + moment($ctrl.dt).format('YYYY-MM-DD');
      case 'weekly':
        return $ctrl.start_date + ' - ' + moment($ctrl.dt).format('YYYY-MM-DD');
      case 'monthly':
        return $ctrl.start_date + ' - ' + moment($ctrl.dt).format('YYYY-MM-DD');
      default:
        return $ctrl.start_date;
    }
  }

  function getHotList() {
    const params = {
      p: page,
      uid: user_id,
      platform: $ctrl.platform,
      start_date: $ctrl.start_date && Math.floor((+new Date($ctrl.start_date)) / 1000),
    };
    return dataService.crawler_getHotList(params, $ctrl.list_type).then(function (res) {
      if (res.result === 1 || res.result === 10012) {
        $ctrl.hotlist = res.data;
        $ctrl.total_items = res.allcount;
        return $ctrl.hotlist;
      } else {
        Notification.dataError(res.data || res.msg);
        $q.reject(res.data || res.msg);
      }
    });
  }

  function getCatlog() {
    return fashionService.getCatalog().then(function (data) {
      $ctrl.inner_libs = data.PlatformCatalog;
      return $ctrl.inner_libs;
    });
  }

  function getPlatform() {
    return fashionService.getPlatform().then(function (data) {
      $ctrl.public_libs = data.PlatformCatalog;
      return $ctrl.public_libs;
    });
  }
}
// })();
