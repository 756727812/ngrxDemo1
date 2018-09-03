/**
 * 添加回答
 */
import * as angular from 'angular';
export const addAnswer = {
  controller: addAnswerController,
  template: require('./add-answer.template.html'),
};

addAnswerController.$inject = ['$scope', '$routeParams', '$location', 'dataService', '$filter', 'Notification'];
function addAnswerController($scope, $routeParams, $location, dataService, $filter, Notification) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  $scope.formData = {};
  $scope.formData.t_id = $routeParams.tid;
  $scope.tid = $routeParams.tid;
  $scope.search_ids = $routeParams.search_ids;
  $scope.isFromEditPost = $routeParams.class_id ? true : false;
  $scope.from = $routeParams.from;
  $scope.answerType = '1';
  $scope.q_id = $routeParams.q_id;
  $scope.ori = $routeParams.ori ? $routeParams.ori : 'pgc';
  $scope.isPre = 1;
  $scope.formData.f_time = new Date((new Date()).getTime() + 2 * 60 * 60 * 1000);
  $scope.themeType = $routeParams.themeType;
  if ($scope.themeType == 'kolTheme' || $scope.themeType == 'frontTheme') {
    $scope.answerType = '2';
    $scope.typeFlag = 2;
  }
  let itemName = '';
  const item_id = $routeParams.item_id;
  let brandList = [];

  $scope.isNew = true;
  $scope.hasNewBrand = true; // 是否没有品牌信息
  $scope.isNewBrand = false; // 检测用户输入的是不是新品牌
  $scope.buyurl = '//seecsee.com/static/detail/commodity.html?item_id=' + $routeParams.item_id;

  $scope.$watch('formData.f_brand', function (newValue) {
    if (angular.isString(newValue)) {
      $scope.isNewBrand = true;
    } else if (angular.isObject(newValue)) {
      $scope.isNewBrand = false;
    }
  });

  $scope.$watch('answerType', function () {
    $scope.errMsg = '';
  });

  $scope.onSetPreTime = function (newDate, oldDate) {
    if (newDate.getTime() <= (new Date())) {
      $scope.formData.f_time = new Date((new Date()).getTime() + 2 * 60 * 60 * 1000);
      Notification.warn('预约发布时间须晚于当前发布时间！');
    }
  };

  /**
   * 查询品牌
   */
  function getBrand() {
    dataService.couponmanager_getBrandAndClass().then(res => $scope.brandList = brandList = res.data.brand);
  }

  function getTheme(t_id) {
    dataService.wanted_getTheme({ t_id }).then(res => $scope.theme = res.data);
  }

  getBrand();
  if ($scope.tid) {
    getTheme($routeParams.tid);
  }

  $scope.uploadBrand = function (res) {
    if (res.result == 1) {
      $scope.brandImage = res.data;
      $('#brandImage').css('background-image', 'url(//img-qn.seecsee.com' + res.data + ')');
    }
  };

  if (typeof $routeParams.item_id !== 'undefined') {
    $scope.isNew = false;
    dataService.wanted_getItemDetail({ item_id: $routeParams.item_id }).then(res => {
      $scope.item = res.data;
      $scope.item_name = $scope.item.item_name;
      itemName = angular.copy($scope.item.item_name);
      $scope.formData.f_imgurl = $scope.item.item_imgurl;
      $scope.formData.f_price = $scope.item.prepare_sku == '1' ? +$scope.item.item_price / 100 : +$scope.item.min_price;
      $scope.formData.f_buyurl = $scope.buyurl;
      $scope.formData.f_brand = $scope.item.brand_info.brand_name;
      $scope.hasNewBrand = $scope.item.brand_info.brand_name ? false : true;
      $scope.formData.item_id = $routeParams.item_id;
      $scope.formData.f_comment = $scope.item.item_name;
    });
  }
  if ($routeParams.cir_id) {
    dataService.circle_getCircleOwner({
      cir_id: $routeParams.cir_id,
    }).then(function (res) {
      $scope.users = [res.data];
      $scope.formData.u_id = $scope.users[0].u_id;
    });
  } else {
    dataService.seller_getSellerMajia().then(res => {
      if (res.hasOwnProperty('data')) {
        $scope.users = res.data;
        const rand_idx = Math.floor(Math.random() * ($scope.users.length));
        $scope.formData.u_id = $scope.users[rand_idx].u_id;
      }
    });
  }

  $scope.addAnswer = function (formData, addAnswerForm, themeType) {
    if ($scope.q_id) {
      const postdata = {
        item_id: $routeParams.item_id,
        q_id: $scope.q_id,
      };

      dataService.topic_answerQuestion(postdata).then(res => {
        Notification.success('添加答案成功！');
        const postData = {
          insert_id: res.data.data.f_id,
          table_name: 'see_find',
        };
        dataService.seller_saveRecord(postData).then(res => {
          switch ($routeParams.ori) {
            case 'eventPgcQuestion':
              $location.path('event/my-event').hash('topic');
              break;
            case 'pgckejian':
              $location.path('wanted/pgc-content-answer').search({}).hash('kejian');
              break;
            case 'pgctopic':
              $location.path('wanted/pgc-content-answer').search({}).hash('topic');
              break;
            default:
              return;
          }
        });
      });
    } else {

      if ($scope.answerType == '1') {
        if (!$scope.formData.f_buyurl) {
          addAnswerForm.f_buyurl.$touched = addAnswerForm.f_buyurl.$invalid = true;
          return -1;
        }
        if (!$scope.formData.f_imgurl) {
          $scope.errMsg = '请上传图片';
          return -1;
        }
        if (!$scope.formData.f_price) {
          addAnswerForm.f_price.$touched = addAnswerForm.f_price.$invalid = true;
          return -1;
        }
        if (!$scope.formData.f_brand) {
          addAnswerForm.f_brand.$touched = addAnswerForm.f_brand.$invalid = true;
          return -1;
        }

        /**
         * @param {
         *  `t_id`   '心愿ID',
         *  `item_id`   '商品ID，如果弃选时为0',
         *  `search_ids`  '搜索出来的item字符串',
         *  `description` '选择或者弃选原因'
         *  }
         * @type {{}}
         */
        const params = {
          t_id: $routeParams.tid,
          item_id: $routeParams.item_id,
          search_ids: $routeParams.search_ids,
          description: $scope.formData.description || '',
        };
        // 新增品牌
        const brandParams = {
          brand_name: $scope.formData.f_brand,
          brand_desc: $scope.brand_desc,
          brand_imgurl: $scope.brandImage,
        };
        // 更新商品信息接口
        const upParams = {
          item_id,
          item_name: $scope.item_name,
          brand_id: $scope.item ? $scope.item.brand_info.brand_id : '',
          f_imgurl: $scope.formData.f_imgurl,
        };


        if (!$scope.isNewBrand) {
          upParams.brand_id = $scope.formData.f_brand.brand_id;
          formData.f_brand = $scope.formData.f_brand.brand_name;
        }

        // 更新爬虫链接添加的商品的品牌的信息
        const uplinkParams = {
          brand_name: encodeURIComponent($scope.formData.f_brand),
          item_id: $scope.formData.item_id,
        };

        if ($scope.goodsbyLink) {
          dataService.python_api_changeBrandName(uplinkParams)
            .then(res => preAddAnswer(brandParams, upParams));
        } else {
          dataService.wanted_checkIfJZCanAnswer({ t_id: formData.t_id, themeType })
            .then(res => preAddAnswer(brandParams, upParams));
        }
      } else {
        dataService.wanted_checkIfJZCanAnswer({ t_id: formData.t_id, themeType })
          .then(res => addAnswerService(formData));
      }
    }


    // 新增品牌
    function preAddAnswer(brandParams, upParams) {

      if ($scope.isNewBrand && $scope.hasNewBrand) {
        dataService.item_addBrand(brandParams).then(res => {
          $scope.brand_id = res.data.brand_id;
          if ($scope.isNew) {
            addAnswerService(formData);
          } else {
            upParams.brand_id = $scope.brand_id;
            updateItem(upParams);
          }
        });
      } else {
        if ($scope.isNew) {
          addAnswerService(formData);
        } else {
          updateItem(upParams);
        }
      }
    }


    // 更新商品名称和品牌
    function updateItem(params) {
      dataService.item_updateItem(params).then(res => {
        if ($scope.search_ids) {
          addSearchItemReason(params);
        } else {
          addAnswerService(formData);
        }
      });
    }

    function addSearchItemReason(params) {
      dataService.wanted_addSearchItem(params).then(res => addAnswerService(formData));
    }

    function addAnswerService(formData) {
      if ($scope.isPre == 0) {
        delete formData.f_time;
      }
      dataService.wanted_addAnswer(formData).then(res => {
        Notification.success('添加答案成功！');
        const postData = {
          insert_id: res.data.f_id,
          table_name: 'see_find',
        };
        dataService.seller_saveRecord(postData).then(res => {
          if ($routeParams.from == 'event') {
            $location.path('/event/event-answer/').search({
              t_id: $scope.tid,
            });
          } else if ($routeParams.ori === 'pgckejian') {
            $location.path('wanted/pgc-content-answer').search({}).hash('kejian');
          } else if ($routeParams.ori === 'pgctopic') {
            $location.path('wanted/pgc-content-answer').hash('topic');
          } else if ($routeParams.ori === 'parttime') {
            $location.path('parttime/userTheme').search({ themeType: $scope.themeType });
          } else if ($routeParams.ori === 'parttimeRec') {
            $location.path('parttime/recommendTheme').search({});
          } else {
            $location.url('/wanted/themeList/theme-answer/' + formData.t_id).search({ themeType: $scope.themeType });
          }
        });
      },                                          err => {
        if (err.type == 1) {
          $location.path('/parttime/userTheme');
        }
      });
    }
  };

  $scope.upload = function (res) {
    if (res.result == 1) {
      $scope.formData.f_imgurl = res.data;
      //$('#itemImage').css('background-image', "url(//img-qn.seecsee.com" + res.data + ")")
    }
  };

  $scope.getGoodsInfo = function () {
    if (!$scope.formData.f_buyurl || $scope.formData.f_buyurl == '') {
      return;
    }
    const tar_url = encodeURIComponent($scope.formData.f_buyurl);
    dataService.python_api_changeToPrepareItemWithURL(tar_url).then(data => {
      $scope.isNew = false;
      $scope.goodsbyLink = true;
      const ret = data;
      $scope.formData.f_price = ret.item_price;
      //$scope.formData.f_brand = ret.brand_name;
      $scope.formData.f_buyurl = $filter('getUrlprefix')() + '/static/detail/commodity.html?item_id=' + ret.item_id + '&browser=commonWebView&showRightButton=1&f_id=0';
      $scope.formData.f_imgurl = ret.item_imgurl;
      $scope.item_name = ret.item_name;
      $scope.formData.item_id = ret.item_id;
    },                                                              err => Notification.warn('解释失败，暂不支持该平台或数据抓取失败'));
  };
}
