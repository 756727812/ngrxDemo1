import * as moment from 'moment';
import * as angular from 'angular';

mediaController.$inject = [
  '$scope',
  '$routeParams',
  '$location',
  'dataService',
  'Notification',
];
function mediaController(
  $scope,
  $routeParams,
  $location,
  dataService,
  Notification,
) {
  const curr_page = $routeParams.page || 1;
  const size = 50;
  const rankingDate = $location.hash() || 'today';
  const start_date = calcStartDate();

  $scope.offset = (curr_page - 1) * size;
  $scope.keyword = $routeParams.keyword || '';
  $scope.showDate = !0;
  $scope.list_category = [{ platform: '时尚' }, { platform: '情感' }];
  $scope.dateOptions = {
    maxDate: new Date(),
  };
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
    dataService.data_api_wechatKolContent({}).then(res => {});

    $scope.hasKeyword = !!$routeParams.keyword;
    $scope.catalog_name =
      $routeParams.catalog_name || $scope.list_category[0]['platform'];

    getAccountsList({
      'search-type': 'account',
      offset: $scope.offset,
      size,
      keyword: $routeParams.keyword || '',
      rankingDate,
      date: moment($scope.dt).format('YYYY-MM-DD'),
      catalog_name: $scope.catalog_name,
    });
  }

  $scope.selectTab = function() {
    $location.search({ catalog_name: $scope.catalog_name });
  };

  $scope.changeCategory = function(name) {
    $location.search({ catalog_name: name });
  };

  function getAccountsList(_params) {
    return dataService.weranking_get_items(_params).then(
      res => {
        if (res.data.code === 0) {
          $scope.isNull = res.data.data.total == 0;
          $scope.accountslist = res.data.data.list;
          $scope.total_items = res.data.data.total;
        } else Notification.dataError(res.data.msg);
      },
      err => Notification.serverError(err.data),
    );
  }
  $scope.searchAccount = function() {
    if ($scope.keyword) {
      $location.search({
        keyword: $scope.keyword,
        catalog_name: $scope.catalog_name,
      });
    } else {
      $location.search({});
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
        return moment($scope.dt).format('YYYY-MM-DD');
      case 'weekly':
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
        return moment($scope.dt).format('YYYY年Mo');
      default:
        $scope.showDate = 0;
        return start_date;
    }
  };
}

export const wechatMedia = {
  template: require('./wechat-media.template.html'),
  controller: mediaController,
};
