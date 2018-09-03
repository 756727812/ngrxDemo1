/**
 * 发布心愿
 */
import * as angular from 'angular';
export const publishArticle = {
  bindings: {
    type: '@',
  },
  controller: publishArticleController,
  template: require('./publish-article.template.html'),
};

publishArticleController.$inject = ['$scope', '$routeParams', 'Notification', '$cookies', '$location', 'dataService'];
function publishArticleController($scope, $routeParams, Notification, $cookies, $location, dataService) {
  // var vm = this;


  // activate();

  // ////////////////

  // function activate() { }

  const userPrivilege = $cookies.get('seller_privilege');
  const themeId = $routeParams.id;
  const title = $routeParams.title,
    img_url = $routeParams.img_url;
  const imgCount = 5;
  $scope.type = this.type;
  init();

  function init() {
    $scope.isPgc = userPrivilege === '8';
    $scope.currentIndex = 0;
    $scope.tagsInputVal = [];
    $scope.isOK = 1;
    if (themeId) {
      $scope.isEdit = 1;
      getThemeDetail(themeId);
    } else {
      $scope.isEdit = 0;
      $scope.isPre = 1;
      $scope.form = {
        title: title ? decodeURIComponent(title) : '',
        imgurl: '',
        extra_imgurl: [],
        extra_imgurl_sizemap: {},
        tags: [
          {
            haveId: '1',
          },
        ],
        t_item_list: '',
        t_tag_json: '',
        recommend_style: ['all', 'all', 'all'],
        t_time: new Date((new Date()).getTime() + 2 * 60 * 60 * 1000),
      };
      img_url && getImgurl(decodeURIComponent(img_url), function (img_url) {
        $scope.form.imgurl = img_url;
      });
    }
    getKolUidList();
    getBrandAndLocation();
  }

  function getImgurl(img_url, cb) {
    dataService.wanted_uploadImgByUrl({
      img: img_url,
    }).then(function (res) {
      cb && cb(res.data.image_url);
    });
  }

  function getThemeDetail(id) {
    dataService.wanted_getThemeDetail({ id }).then(res => {
      $scope.form = res.data;
      $scope.form.title = res.data.t_title;
      $scope.form.imgurl = res.data.t_imgurl;
      $scope.form.recommend_style = ['all', 'all', 'all'];
      $scope.form.recommend_style[0] = res.data.t_style_data.split('|')[0] || 'all';
      $scope.form.recommend_style[1] = res.data.t_style_data.split('|')[1] || 'all';
      $scope.form.recommend_style[2] = res.data.t_style_data.split('|')[2] || 'all';
      $scope.form.tags = getTags(res.data.wanted[0]);
      $scope.form.t_item_list = $scope.form.t_item_string == '0' ? '' : $scope.form.t_item_string;
      $scope.form.imgurl_size = res.data.img_size;
      $scope.form.extra_imgurl = res.data.extra_imgurl;
      $scope.form.extra_imgurl_sizemap = res.data.extra_imgurl_sizemap;
      extra_img_list_index = $scope.form.extra_imgurl.length;
      //$scope.form.t_time = new Date((new Date()).getTime() + 2*60*60*1000);
      $scope.isPre = res.data.t_time ? 1 : 0;
      const t_time = new Date(res.data.t_time).getTime(),
        n_time = new Date().getTime();
      if (res.data.t_time && t_time <= n_time) {
        $scope.isPre = 0;
        $scope.isOK = 0;
        $scope.form.t_time = '';
      } else if (res.data.t_time && n_time < t_time && t_time <= (n_time + 2 * 60 * 60 * 1000)) {
        $scope.form.t_time = new Date(n_time + 2 * 60 * 60 * 1000);
      } else {
        $scope.form.t_time = new Date(res.data.t_time);
      }
    });
  }
  function getTags(data) {
    const tags = [];
    for (const i in data.clue) {
      data.clue[i].json.haveId = (data.clue[i].json.mk_id == '' || data.clue[i].json.mk_id == '0') ? '2' : '1';
      console.log(data.clue[i].json.haveId);
      data.clue[i].json.coordinate = data.clue[i].json.x + ',' + data.clue[i].json.y;
      tags.push(data.clue[i].json);
    }
    return tags;
  }
  function getBrandAndLocation() {
    dataService.item_getBrandAndLocation().then(res => {
      $scope.brandList = res.data.brand_list;
      $scope.locationList = res.data.location_list;
    });
  }

  function getKolUidList() {
    dataService.wanted_getKolUidList().then(res => $scope.kolList = res.data);
  }

  /**
   * 获取商品ID数组对应的商品信息数组
   * @param {arr} 商品ID数组
   */
  function getItemInfoArray(arr, cb) {
    dataService.item_getItemInfoArray({
      item_list: JSON.stringify(arr),
    }).then(res => cb && cb(res.data));
  }

  /**
   * 获取当前图片上鼠标位置的坐标
   * @param {e} 鼠标事件
   */
  function coordinatefn(e) {
    e = e || window.event;
    const imgId = '#' + $(e.target).attr('id'),
      currentWidth = $(imgId).width(),
      currentHeight = $(imgId).height(),
      offsetX = e.pageX - $(imgId).offset().left,
      offsetY = e.pageY - $(imgId).offset().top,
      x = offsetX / currentWidth,
      y = offsetY / currentHeight;
    return [x.toFixed(3), y.toFixed(3)];
  }

  /**
   * 交换数组元素位置
   * @param { arr: Array }
   * @param { k1: Number } index
   * @param { k2: Number } another index
   */
  function swapArrEle(arr, k1, k2) {
    if (k2 < 0) k2 = arr.length - 1;
    else if (k2 >= arr.length) k2 = 0;
    if (k1 < arr.length && k2 < arr.length) {
      const _t = arr[k2];
      arr[k2] = arr[k1];
      arr[k1] = _t;
    }
  }

  $scope.getCoordinate = function (e) {
    $scope.coordinate = coordinatefn(e).join(',');
  };
  $scope.setCoordinate = function (e) {
    angular.extend($scope.form.tags[$scope.currentIndex], {
      coordinate: coordinatefn(e).join(','),
      x: coordinatefn(e)[0],
      y: coordinatefn(e)[1],
    });
  };

  /**
   * 上传商品详细图回调函数
   * @param { res: Promise } 上传图片后接口返回的xhr对象
   */
  let extra_img_list_index = 0;
  $scope.uploadDetail = function (res, size) {
    if (res.result === 1) {
      if (extra_img_list_index < imgCount) {
        $scope.form.extra_imgurl[extra_img_list_index] = res.data;
        extra_img_list_index++;
        $scope.form.extra_imgurl_sizemap[res.data] = size;
      }
    } else Notification.dataError(res.msg);
  };

  $scope.changeOrder = function (index1, index2) {
    swapArrEle($scope.form.extra_imgurl, index1, index2);
  };

  $scope.delImage = function (type, index) {
    switch (type) {
      case 'extra_imgurl':
        $scope.form.extra_imgurl.splice(index, 1);
        break;
      default:
        return;
    }
  };

  $scope.upload = function (res, size) {
    if (res.result === 1) {
      $scope.form.imgurl = res.data;
      $scope.form.imgurl_size = size;
    } else Notification.dataError(res.msg);
  };

  $scope.setCurrentIndex = function (index) {
    $scope.currentIndex = index;
  };
  $scope.delTag = function (index) {
    $scope.form.tags.splice(index, 1);
  };
  $scope.onSetRecTime = function (newDate, oldDate) {
    if (newDate.getTime() <= (new Date())) {
      $scope.form.recommend_time = new Date();
      Notification.warn('预计上线时间须晚于当前发布时间！');
    }
  };
  $scope.onSetPreTime = function (newDate, oldDate) {
    if (newDate.getTime() <= (new Date())) {
      $scope.form.t_time = new Date((new Date()).getTime() + 2 * 60 * 60 * 1000);
      Notification.warn('预约发布时间须晚于当前发布时间！');
    }
  };
  $scope.sumIds = function (index) {
    if ($scope.form.tags[index].mk_id) {
      let _t = angular.copy($scope.form.tags[index].mk_id.trim()),
        _a = angular.copy($scope.form.t_item_list === '' ? [] : $scope.form.t_item_list.split(','));
      _a.push(_t);
      _a = _a.filter(function (e, i, _a) {
        return _a.lastIndexOf(e) === i;
      });
      $scope.form.t_item_list = _a.join(',');
      getItemInfoArray([_t], function (_data) {
        if (angular.isArray(_data)) {
          const data = _data[0];
          $scope.form.tags[index].item_name = data.item_name;
          angular.extend($scope.form.tags[index], {
            cl_class: data.item_name,
            cl_brand: data.brand,
            cl_area: data.location,
          });
          let tags = angular.copy($scope.form.t_tag_json === '' ? [] : $scope.form.t_tag_json.split(','));
          tags.push(data.item_name, data.brand);
          tags = tags.filter(function (e, i, _a) {
            return tags.lastIndexOf(e) === i;
          });
          $scope.form.t_tag_json = tags.join(',');
        }
      });
    }
  };
  $scope.addToTags = function () {
    // $scope.tagsInputVal.push({text: val})
    let tags = angular.copy($scope.form.t_tag_json === '' || $scope.form.t_tag_json.length === 0 ? [] : $scope.form.t_tag_json.trim().split(','));
    angular.forEach($scope.form.tags, function (item) {
      item.cl_class && tags.push(item.cl_class.trim());
      item.cl_brand && tags.push(item.cl_brand.trim());
    });
    tags = tags.filter(function (e, i, _a) {
      return tags.lastIndexOf(e) === i;
    });
    $scope.form.t_tag_json = tags.join(',');
  };
  $scope.unique = function () {
    let _a = angular.copy($scope.form.t_item_list === '' ? [] : $scope.form.t_item_list.split(','));
    _a = _a.filter(function (e, i, _a) {
      return _a.lastIndexOf(e) === i;
    });
    $scope.form.t_item_list = _a.join(',');
  };
  // 查看商品列表图片
  $scope.showGoods = function () {
    getItemInfoArray($scope.form.t_item_list.split(','), function (data) {
      if (angular.isArray(data)) $scope.selectedGoods = data;
    });
  };
  $scope.removeClass = function (index) {
    $('.tags_' + index).removeClass('error');
  };
  $scope.save = function () {
    $scope.errors = [];
    if (!$scope.form.imgurl) {
      $scope.errors.push('请上传心愿的图片！');
    }
    if ($scope.form.timepicker < new Date()) {
      $scope.errors.push('规则创建时间必须早于预约的执行时间！');
    }
    angular.forEach($scope.form.tags, function (item, index) {
      if (!item.cl_class && !item.cl_brand && !item.cl_area) {
        $scope.errors.push('标签' + (index + 1) + '中的名称、品牌和地点必须填写其中一个！');
        $('.tags_' + index).addClass('error');
        document.querySelector('#TAG_' + index).scrollIntoView();
      } else {
        angular.extend(item, {
          height: 25,
          width: 60,
          direction: 'left',
          title: item.cl_class,
        });
        delete item.haveId;
        delete item.coordinate;
      }
    });
    if ($scope.isPre == 0) {
      $scope.form.t_time = '';
    }
    $scope.form.t_tag_json = $scope.form.t_tag_json === '' ? [] : $scope.form.t_tag_json.trim().split(',');
    if ($scope.errors.length > 0) return;
    if ($scope.isEdit) {
      $scope.form.t_id = themeId;
      $scope.form.t_title = $scope.form.title;
      $scope.form.t_imgurl = $scope.form.imgurl;
      $scope.form.upload_type = '-1';
      delete $scope.form.wanted;
      dataService.wanted_updateTheme({
        theme: JSON.stringify($scope.form),
      }).then(res => {
        Notification.success('编辑心愿操作成功！');
        $location.url('/wanted/themeList');
      }).finally(() => $scope.form.t_tag_json = '');
    } else {
      dataService.wanted_addThemev2({
        theme: JSON.stringify($scope.form),
      }).then(res => {
        Notification.success('发布心愿操作成功！');
        $location.url('/wanted/themeList');
      });
    }
  };
}
