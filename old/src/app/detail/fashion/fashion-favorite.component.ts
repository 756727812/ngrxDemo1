import * as _ from 'lodash';;
import * as moment from 'moment';
import * as md5 from 'md5';;

export const fashionFavorite = {
  template: require('./fashion-favorite.template.html'),
  controller: favoriteController,
};
favoriteController.$inject = ['$routeParams', '$q', 'Notification', '$location', 'fashionService', '$log', 'dataService'];
function favoriteController($routeParams, $q, Notification, $location, fashionService, $log, dataService) {
  const $ctrl = this;
  let page = $routeParams.page || 1, user_id;

  $ctrl.total_items = 0;
  $ctrl.submitSearch = submitSearch;
  $ctrl.removeFavoriteItem = removeFavoriteItem;
  $ctrl.seeDetail = seeDetail;
  $ctrl.generateWish = generateWish;
  $ctrl.saveMark = saveMark;
  $ctrl.searchForm = {
    keyword: $routeParams.keyword,
  };
  $ctrl.$onInit = activate;


  function activate() {
    dataService.data_api_fashionFavor({}).then(res => { });
    return fashionService.getUid().then(function (uid) {
      user_id = uid;
      return getFavoriteList();
    });
  }

  function submitSearch() {
    $location.search({
      keyword: $ctrl.searchForm.keyword,
    });
  }

  function seeDetail(item) {
    return fashionService.fashionDetail(item);
  }

  function removeFavoriteItem(item_id) {
    fashionService.removeFavoriteItem(item_id, user_id, function () {
      return activate();
    });
  }

  function generateWish(desc, img_url) {
    fashionService.generateWish(desc, img_url);
  }

  function saveMark(data, item_id) {
    if (data && data.length <= 1000) {
      return dataService.crawler_addToFavoriteList({
        tips: data,
        uid: user_id,
        item_id,
        skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
      }).then(function (res) {
        Notification.success('添加备注成功！');
        return activate();
      });
    } else {
      const error = '备注字符数不能超过1000字！';
      Notification.warn(error);
      return $q.reject(error);
    }
  }

  function getFavoriteList() {

    const params = {
      page,
      kw: $ctrl.searchForm.keyword,
      uid: user_id,
      skey: md5('Seeu_' + moment().format('YYYY-MM-DD')),
    };

    return dataService.crawler_getFavoriteList(params).then(function (res) {
      if (res.result === 1 && _.isArray(res.data)) {
        $ctrl.favorite_list = res.data;
        $ctrl.total_items = res.allcount;
        return $ctrl.favorite_list;
      } else {
        $ctrl.favorite_list = [];
        $ctrl.total_items = 0;
        return $ctrl.favorite_list;
      }
    });
  }
}
