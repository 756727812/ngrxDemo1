import * as moment from 'moment';
import * as angular from 'angular';

articleController.$inject = [
  '$scope',
  '$routeParams',
  '$location',
  'dataService',
  'Notification',
];
function articleController(
  $scope,
  $routeParams,
  $location,
  dataService,
  Notification,
) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  const curr_page = $routeParams.page || 1;
  const size = 50; //$routeParams.keyword ? 20:50;
  const rankingDate = $location.hash() || 'newest';
  $scope.showDate = !0;

  $scope.list_category = [{ platform: '时尚' }, { platform: '情感' }];
  $scope.catalog_name = $routeParams.catalog_name || '';

  $scope.dateOptions = {
    maxDate: new Date(),
  };
  // $scope.dt = moment($routeParams.date)._d;
  // var start_date = calcStartDate($scope.dt);
  const start_date = calcStartDate();
  $scope.$watch('dt', function(cur, prev) {
    if (typeof cur !== 'undefined' && cur !== prev) {
      $location.search(
        angular.extend({}, $location.search(), {
          date: moment(cur).format('YYYY-MM-DD'),
        }),
      );
    }
  });
  init();
  function init() {
    dataService.data_api_wechatArticle({}).then(res => {});

    //$scope.class = $location.hash() || '0';
    $scope.hasKeyword = $routeParams.keyword ? true : false;

    $scope.catalog_name = $routeParams.catalog_name;
    if ($scope.catalog_name == null || $scope.catalog_name == '') {
      $scope.catalog_name = $scope.list_category[0]['platform'];
    }
    //console.log($scope.catalog_name)

    getArticlesList({
      'search-type': 'article',
      offset: (curr_page - 1) * size,
      size,
      keyword: $routeParams.keyword || '',
      rankingDate,
      date: moment($scope.dt).format('YYYY-MM-DD'),
      catalog_name: $scope.catalog_name,
    });
  }

  $scope.selectTab = function() {
    console.log('selectTab' + $scope.catalog_name);
    $location.search({ catalog_name: $scope.catalog_name });
  };

  $scope.changeCategory = function(name) {
    //console.log(name);
    const _params = { catalog_name: name };
    $location.search(_params);
  };

  function getArticlesList(_params) {
    return dataService.weranking_get_items(_params).then(
      res => {
        if (res.data.code === 0) {
          $scope.isNull = res.data.data.total == 0;
          $scope.articleslist = res.data.data.list;
          $scope.total_items = res.data.data.total;
        } else Notification.dataError(res.data.msg);
      },
      err => Notification.serverError(err.data),
    );
  }

  $scope.searchArticle = function() {
    if ($scope.keyword) {
      $location.search({
        keyword: $scope.keyword,
        catalog_name: $scope.catalog_name,
      });
    }
  };

  function calcStartDate() {
    $scope.dt = moment($routeParams.date)['_d'];
    // $scope.dt = moment($routeParams.date);
    const nDate = moment($scope.dt);
    switch (rankingDate) {
      case 'daily':
        if (!$routeParams.date) {
          $scope.dt = moment(new Date())
            .subtract(1, 'days')
            .toDate();
        }
        return moment(nDate)
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
      case 'weekly':
        const weekOfDay = moment(nDate).format('E'); //算出这周的周几
        if (!$routeParams.date) {
          $scope.dt = moment(new Date())
            .subtract(7, 'days')
            .toDate();
          return moment(nDate)
            .subtract(7 + parseInt(weekOfDay), 'days')
            .format('YYYY-MM-DD');
        } else {
          return moment(nDate)
            .subtract(weekOfDay, 'days')
            .format('YYYY-MM-DD');
        }
      case 'monthly':
        if (!$routeParams.date) {
          $scope.dt = moment(new Date())
            .subtract(30, 'days')
            .toDate();
        }
        return moment(nDate)
          .subtract(30, 'days')
          .format('YYYY-MM-DD');
      default:
        return moment(nDate).format('YYYY-MM-DD');
    }
  }
  $scope.calcPeriod = function() {
    switch (rankingDate) {
      case 'daily':
        //$scope.dt = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
        return moment($scope.dt).format('YYYY-MM-DD');
      case 'weekly':
        //$scope.dt = moment(new Date()).subtract(1, 'weeks').format('YYYY-MM-DD');
        return (
          '第' +
          moment($scope.dt).format('Wo') +
          '(' +
          start_date +
          ' - ' +
          moment(start_date)
            .add(6, 'days')
            .format('YYYY-MM-DD') +
          ')'
        );
      case 'monthly':
        //$scope.dt = moment(new Date()).subtract(1, 'months').format('YYYY-MM-DD');
        return moment($scope.dt).format('YYYY年Mo');
      default:
        $scope.showDate = 0;
        return start_date;
    }
  };
}

export const wechatArticle = {
  template: require('./wechat-article.template.html'),
  controller: articleController,
};
