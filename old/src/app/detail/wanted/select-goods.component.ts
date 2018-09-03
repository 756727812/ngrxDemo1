import * as angular from 'angular';
export const selectGoods = {
  controller: selectThemeGoodsController,
  template: require('./select-goods.template.html')
}

selectThemeGoodsController.$inject = ['$scope', '$location', '$routeParams', '$timeout', 'dataService', 'Notification'];
function selectThemeGoodsController($scope, $location, $routeParams, $timeout, dataService, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.currentType = 'selectGoods';
  $scope.searchData = {
    keyword: $routeParams.keyword
  };

  $timeout(function() {
    let fix = $('.scroll-fix'),
      fixTop = fix.offset().top,
      fixHeight = fix.height(),
      endTop, miss;
    $(window).scroll(function() {
      //页面与顶部高度
      const docTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);

      if (fixTop < docTop) {
        fix.css({
          'position': 'fixed',
          'z-index': '2'
        });
        if ((endTop < (docTop + fixHeight))) {
          fix.css({
            top: miss
          }); //滚动悬浮块滑到结束块上时，top值为负，即慢慢隐藏出浏览器
        } else {
          fix.css({
            top: 0
          }); //滚动悬浮块未到结束块上时，top为0
        }
      } else {
        fix.css({
          'position': 'static'
        });
      }
    })
  })

  $scope.searchGoods = function() {
    const routeParams_tmp = $location.search();
    $scope.searchData.page = 1;
    $location.search(angular.extend(routeParams_tmp, $scope.searchData));
  };

  $scope.selectGood = function(id) {
    switch ($routeParams.ori) {
      case 'pgc':
        $location.path("/wanted/themeList/addAnswer").search({
          q_id: $routeParams.q_id,
          item_id: id,
          tid: $routeParams.tid,
          themeType: $routeParams.themeType,
        });
        break;
      case 'theme_kol':
      case 'theme_front':
        $location.path("/wanted/themeList/addGoods").search({
          tid: $routeParams.tid,
          item_id: id,
          from: 'selectGood',
          ori: $routeParams.ori
        });
        break;
      case 'eventPgcQuestion':
        $location.path("/wanted/answerPgcQuestion").search({
          q_id: $routeParams.q_id,
          item_id: id,
          ori: $routeParams.ori
        });
        break;
      case 'parttime':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          themeType: $routeParams.themeType,
          item_id: id,
          ori: 'parttime'
        });
        break;
      case 'edit-event-answer':
        $location.path("/event/edit-event-answer").search({
          fid: $routeParams.fid,
          item_id: id
        });
        break;
      case 'eventAddAnswer':
        $location.path("/event/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id
        });
        break;
      case 'pgctopic':
        $location.path("/wanted/themeList/addAnswer").search({
          q_id: $routeParams.q_id,
          item_id: id,
          ori: 'pgctopic'
        });
        break;
      case 'pgckejian':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id,
          ori: 'pgckejian'
        });
        break;
      case 'parttimeRec':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id,
          ori: 'parttimeRec'
        });
        break;
      case 'themeList':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id,
          themeType: $routeParams.themeType,
          ori: 'themeList'
        });
        break;
      case 'themeclassified':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id,
          themeType: $routeParams.themeType,
          ori: 'themeclassified'
        });
        break;
      case 'userfirsttheme':
        $location.path("/wanted/themeList/addAnswer").search({
          tid: $routeParams.tid,
          item_id: id,
          themeType: $routeParams.themeType,
          ori: 'userfirsttheme'
        });
        break;
      default:
        if ($routeParams.from == 'event') {
          $location.path("/wanted/themeList/addAnswer").search({
            tid: $routeParams.tid,
            item_id: id,
            from: 'event'
          });
        } else {
          $location.path("/wanted/themeList/addAnswer").search({
            tid: $routeParams.tid,
            item_id: id,
            from: 'selectGood'
          });
        }
    }

  };

  const init = function() {
    const page = $routeParams.page ? $routeParams.page : 1;
    const params = {};
    $scope.searchData = angular.extend({}, $routeParams);
    if ($scope.searchData.keyword_name) {
      dataService.search_control_searchItems({
        key: $routeParams.keyword_name || '',
        type: '1',
        p: $routeParams.page || 1
      }).then(res => {
        $scope.itemList = res.data.item.list;
        $scope.total_items = res.data.item.count;
      })
    } else {
      const _param = angular.extend({}, $scope.searchData);
      _param.keyword = $routeParams.keyword_id;
      delete (_param.keyword_id);
      dataService.item_itemList(_param).then(res => {
        $scope.itemList = res.data.list;
        $scope.total_items = res.data.count
      });
    }
    if ($routeParams.tid) {
      dataService.wanted_getTheme({
        t_id: $routeParams.tid
      }).then(data => $scope.theme = data.data);
    }

  };
  init();
}
