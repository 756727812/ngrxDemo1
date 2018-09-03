import * as moment from 'moment';
import * as md5 from 'md5';;
import * as angular from 'angular';

yuqingController.$inject = ['$scope', '$routeParams', '$location', 'dataService', 'Notification'];
function yuqingController($scope, $routeParams, $location, dataService, Notification) {

  const curr_page = $routeParams.page || 1;
  const size = 20;//$routeParams.keyword ? 20:50;

  $scope.catalog_name = $routeParams.tags || '';
  $scope.cate = $routeParams.cate || '1';
  $scope.searchType = $location.hash();
  $scope.has_store = $routeParams.has_store || false;

  init();
  function init() {
    $scope.sort_by = $routeParams.sort_by || 'read_num';
    if ($scope.searchType == 'newest') {
      $scope.sort_by = 'art_time';
    }

    getTags();
    getArticlesList({
      location_id: 3123,
      token: md5('see' + moment().format('YYYYMMDD') + '3123'),
      cate: $routeParams.cate || 1,
      tags: $routeParams.tags || '全部',
      page: curr_page,
      pageSize: 20,
      sort_by: $scope.sort_by,
      searchType: $location.hash() == '' ? 'newest' : $location.hash(),
      wechat_id: $routeParams.wechat_id || '',
      has_store: $scope.has_store === true ? 1 : 0,
    });
  }

  $scope.changeCheckAll = function () {
    const _params = { has_store: $scope.has_store, page: 1 };
    $location.search(_params);
  };

  $scope.selectTab = function () {
    // $location.search({catalog_name:$scope.catalog_name})
  };

  $scope.changeCategory = function (tags, cate_id) {
    const _params = { tags, cate: cate_id, page: 1 };
    $location.search(_params);
  };

  $scope.changeOrder = (sort_by) => {
    $scope.sort_by = sort_by;
    $location.search(Object.assign($location.search(), {
      page: 1,
      sort_by,
    }));
  };

  $scope.searchArticle = function () {

  };

  $scope.searchKolArticle = function (wechat_id) {
    $location.search(Object.assign($location.search(), {
      page: 1,
      wechat_id,
    }));
  };


  function getTags() {
    return dataService.weyuqing_get_tags().then(res => {
      $scope.xw_id = res['data']['行文参考'].id;
      $scope.xp_id = res['data']['选品参考'].id;
      $scope.sd_id = res['data']['十点读书'].id;
      $scope.list_xw = res['data']['行文参考'].data;
      $scope.list_xp = res['data']['选品参考'].data;
      $scope.list_sd = res['data']['十点读书'].data;
    });
  }

  function getArticlesList(_params) {
    return dataService.weyuqing_get_articles(_params).then(res => {
      $scope.isNull = res.data.total == 0;
      $scope.articleslist = res.data.list;
      $scope.total_items = res.data.total;
    });
  }

}

export const wechatYuqing = {
  template: require('./wechat-yuqing.template.html'),
  controller: yuqingController,
};
