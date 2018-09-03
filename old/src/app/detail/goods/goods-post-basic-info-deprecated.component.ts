import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as angular from 'angular';

goodsPostBasicInfoDeprecatedController.$inject = [
  '$scope',
  '$location',
  '$routeParams',
  '$timeout',
  'ADDRESS',
  'SHIPFEECHARGE',
  'dataService',
  'Notification',
];
export function goodsPostBasicInfoDeprecatedController(
  $scope,
  $location,
  $routeParams,
  $timeout,
  ADDRESS,
  SHIPFEECHARGE,
  dataService: IDataService,
  Notification,
) {
  $(window).bind('beforeunload', function () {
    return '';
  });

  let sizeData = [],
    brandList = [],
    CurrencyRate; // 获取汇率
  $scope.isNewBrand = false;
  $scope.basicInfo = true;
  $scope.class_id = $routeParams.classid;
  $scope.goodId = $routeParams.goodId;
  $scope.type = $routeParams.type;
  //商品规格
  $scope.specialPro = [];
  $scope.countyList = [];
  $scope.areaList = [];
  $scope.addBrand = '';
  $scope.user_info = [];

  /*
   颜色类
   colorTab : 当前选中的颜色系Tab index
   colorSet ： 后台颜色接口返回的颜色分类数组
   sub_color ： 每个色系下的对应详细颜色的数组
   selectedColor ： 存储颜色分类中选中的具体颜色:[{"0":"乳白色","1":"白色"},null,null,null,{"1":"姜黄色"},null,{"2":"宝蓝色"}]
   _selectedColor ： 由selectedColor转换而来的选中的颜色数组，方便输
   */
  $scope.seeColor = {
    hasColor: false,
    colorTab: 0,
    colorSet: [],
    sub_color: [],
    selectedColor: [],
    _selectedColor: [],
  };
  $scope.seeSize = {
    hasColor: false,
    sizeTab: 0,
    sizeSet: [],
    sub_size: [],
    selectedColor: [],
    _selectedColor: [],
  };
  $scope.seeSize = {
    hasSize: false,
    sizeSet: [],
    sub_size: [],
    selectedSize: [],
    _selectedSize: [],
  };
  $scope.addItem = {
    multi: {},
    single: {},
    attr_key: [],
    ops: {},
    attr_value: [],
    selectSpecial: {},
    sizeTable: {},
    value_editPost: {},
    item_img_list: [],
    ship_country: '',
    selectTitle: {},
    sizeTitle: [],
    ship_fee: 0,
    ship_fee_nofree: 0,
    ship_fee_total: 0,
    item_location: '1',
    ship_type: '1',
    ship_method: '3',
    pack_type: '0',
    ship_tax_flag: '0',
    ship_send_time: [],
    ship_recv_time: [],
    selled_service: ['0', '0'],
  };
  $scope.brandList = {
    multi: {},
    single: {},
    attr_key: [],
    ops: [],
    attr_value: [],
    selectSpecial: {},
    sizeTable: {},
    value_editPost: {},
  };
  $scope.specialObject = [];

  $scope.resetImage = function (type, index) {
    if (index >= 0) {
      $scope.addItem[type][index] = '';
      for (let i = index, len = $scope.addItem[type].length; i < len - 1; i++) {
        $scope.addItem[type][i] = $scope.addItem[type][i + 1];
      }
      $scope.addItem[type].pop();
      $scope.addItem.item_img_list_index--;
    } else {
      $scope.addItem[type] = '';
    }
  };

  $scope.addItem.addColor_array = [];
  $scope.addItem.addColor_item = '';

  $scope.addItem.addSize_array = [];
  $scope.addItem.addSize_item = '';

  function calculateShipFee(location, weight) {
    const ceil = Math.ceil.bind(Math);
    switch (location) {
      case '1':
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 5 + 45 : 45;
        break;
      case '5':
        $scope.addItem.ship_fee_nofree =
          weight > 1000 ? Math.ceil((weight - 1000) / 500) * 15 + 35 : 35;
        break;
      case '6':
        $scope.addItem.ship_fee_nofree =
          weight > 1000 ? Math.ceil((weight - 1000) / 1000) * 40 + 80 : 80;
        break;
      case '7': // 日本一号仓
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 5 + 40 : 40;
        // $scope.addItem.ship_fee_nofree = (function (_) {
        //     if (_ >= 800) {
        //         return _ > 1000 ? (75 + Math.ceil((_ - 1000) / 100) * 5) : 75;
        //     } else {
        //         return _ < 500 && 48.6 || _ < 600 && 59.4 || _ < 700 && 67.5 || 74.7;
        //     }
        // } (weight))
        break;
      case '101':
        $scope.addItem.ship_fee_nofree = Math.ceil(weight / 100) * 5 + 15;
        break;
      case '102':
        $scope.addItem.ship_fee_nofree = Math.ceil(weight / 100) * 5 + 15;
        break;
      case '50':
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 6 + 35 : 35;
        break;
      case '51':
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 6 + 35 : 35;
        break;
      case '52':
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 6 + 35 : 35;
        break;
      case '53':
        $scope.addItem.ship_fee_nofree =
          weight > 500 ? Math.ceil((weight - 500) / 100) * 6 + 40 : 40;
        break;
      default:
        Notification.warn('选择地址错误!');
    }
  }

  const getWeight = function () {
    dataService.item_classList().then(res => {
      angular.forEach(res.data, function (classItem) {
        if (classItem.class_id === $scope.class_id) {
          const weight = ($scope.weight = classItem.class_weight);
          if (+$scope.weight < 0) {
            Notification.warn('获取商品重量信息错误!');
            return -1;
          }
          calculateShipFee($scope.addItem.item_location, weight);
          return weight;
        }
      });
    });
  };

  $scope.addOtherColorEnter = function (event) {
    if (event.keyCode !== 13) return;
    $scope.addOtherColor($scope.addItem.addColor_item);
  };
  $scope.addOtherColor = function (colorItem) {
    const parent = $scope.addItem;
    if (colorItem === '') {
      return;
    }
    if (parent.addColor_array.length >= 24) {
      Notification.warn('最多只能添加24种颜色');
      return;
    }
    $scope.addItem.addColor_array.push(colorItem);
    $scope.addItem.addColor_item = '';
  };
  $scope.addOtherSizeEnter = function (event) {
    if (event.keyCode !== 13) return;
    $scope.addOtherSize($scope.addItem.addSize_item);
  };
  $scope.addOtherSize = function (colorItem) {
    const parent = $scope.addItem;
    if (colorItem === '') {
      return;
    }
    if (parent.addSize_array.length >= 24) {
      Notification.warn('最多只能添加24种尺码');
      return;
    }
    $scope.addItem.addSize_array.push(colorItem);
    $scope.addItem.addSize_item = '';
  };

  $scope.$watch('addItem.item_brand', function (newValue) {
    if (angular.isString(newValue)) {
      $scope.isNewBrand = true;
    } else if (angular.isObject(newValue)) {
      $scope.isNewBrand = false;
    }
  });

  /**
   * 查询品牌
   */
  function getBrand() {
    dataService
      .item_getStandardBrandList()
      .then(res => ($scope.brandList = brandList = res.data));
  }

  //函数声明提升 解决ff和safari不能打开的问题
  function getSizeIndex(type, array) {
    for (let j = 0, len = array.length; j < len; j++) {
      if (array[j].title == type) {
        return j;
      }
    }
    return -1;
  }

  function getColorIndex(type, array) {
    for (let j = 0, le = array.length; j < le; j++) {
      const colorArray = array[j].color_array;
      for (let i = 0, l = colorArray.length; i < l; i++) {
        if (type == colorArray[i]) {
          return j;
        }
      }
    }
    return -1;
  }

  function renderData() {
    if ($scope.goodId) {
      if ($scope.type == 'editPost') {
        //获得商品的描述 待编辑商品进入的编辑
        dataService
          .item_getItem({
            item_id: $scope.goodId,
          })
          .then(res => {
            //自动填充属性
            const item = res.data;
            $scope.seller_id = item.seller_id;
            $scope.addItem.item_comments = item.item_desc;
            $scope.addItem.sell_point = item.sell_point; // 卖点
            $scope.addItem.sku_mark = item.sku_mark; // 货号
            $scope.addItem.item_mark = item.item_mark; // 货号
            $scope.addItem.desc = item.item_desc;
            $scope.addItem.image = item.item_imgurl;
            //$('#mainImage').css('background-image', "url(" + item.item_imgurl + ")");
            $scope.addItem.item_name = item.item_name;
            $scope.addItem.item_ori_url = item.item_ori_url;
            $scope.addItem.ship_country = item.ship_country;
            $scope.addItem.ship_area = item.ship_area;
            $scope.addItem.ship_fee = item.ship_fee;
            $scope.addItem.ship_method = item.ship_method;
            $scope.addItem.ship_tax = item.ship_tax;
            $scope.addItem.ship_time = item.ship_time;
            //$scope.addItem.item_brand = item.brand_info.brand_name;
            $scope.addItem.item_brand = {
              brand_id: item.brand_info.brand_id,
              brand_name: item.brand_info.brand_name,
            };
            $scope.addItem.brand_id = item.brand_info.brand_id;
            $scope.addItem.size_table_imgurl = item.size_table_imgurl;
            $scope.addItem.sku_list_editPost = item.sku_list;
            if (item.prepare_sku == 1) {
              $scope.addItem.currency = '人民币';
            } else {
              $scope.addItem.currency = item.sku_list[0].currency;
            }
            $scope.addItem.prepare_sku = item.prepare_sku;
            $scope.addItem.attr_value_editPost = item.attr_value;
            $scope.addItem.attr_key_editPost = item.attr_key;
            $scope.addItem.item_img_list = item.item_img_list
              ? item.item_img_list.split(';')
              : [];
            $scope.addItem.product_country = item.product_country;
            $scope.addItem.pack_type = item.pack_type;
            $scope.addItem.pack_type_str = (function (_) {
              return (
                (_ === '0' && '精装(带原包装)') ||
                (_ == '1' && '简装(不带原包装)') ||
                (_ == '2' && item.pack_type_str)
              );
            })(item.pack_type);
            $scope.addItem.ship_send_time = item.ship_send_time.map(function (
              i,
            ) {
              return +i;
            });
            $scope.addItem.ship_recv_time = item.ship_recv_time.map(function (
              i,
            ) {
              return +i;
            });
            $scope.addItem.ship_tax_flag = item.ship_tax_flag;
            $scope.addItem.selled_service = item.selled_service;
            $scope.addItem.ship_send_promiss = item.ship_send_promiss;
            $scope.addItem.ship_recv_promiss = item.ship_recv_promiss;
            $timeout(function () {
              // var mainImageViewer = new Viewer(document.getElementById('mainImage'))
              // var detailImagesViewer = new Viewer(document.getElementById('detailImages'))
              // var sizeImageViewer = new Viewer(document.getElementById('sizeImage'))
            });
            if (item.size_table_str) {
              sizeData = JSON.parse(item.size_table_str); //[{title:'中国码',value:[2,4,5,6,7,8]},{title:'均码',value:[2,4,5,6,7,8]},{title:'普通码',value:[2,4,5,6,7,8]}];
              if (sizeData && sizeData.length) {
                let valLength = sizeData[0].value.length;
                const symbol = 'x';
                const obj = {
                  title: symbol,
                  value: [],
                };
                while (valLength > 0) {
                  obj.value.push(symbol);
                  valLength--;
                }
                sizeData.push(obj);
              }

              angular.forEach(sizeData, function (item) {
                $scope.addItem.sizeTitle.push(item.title);
                $scope.addItem.selectTitle[item.title] = true;
              });
            }
            //props
            angular.forEach(item.item_props, function (it) {
              angular.forEach(it, function (value, key) {
                if (angular.isArray(value)) {
                  //多选
                  const obj = {};
                  angular.forEach(value, function (i) {
                    obj[i] = true;
                  });
                  $scope.addItem.multi[key] = obj;
                } else {
                  //单选
                  $scope.addItem.single[key] = value;
                }
              });
            });
            //sku
            const sku = [];
            angular.forEach(item.attr_key, function (ite) {
              angular.forEach(item.attr_value, function (it) {
                if (it.attr_key_id == ite.attr_key_id) {
                  const obj = {
                    key: ite.attr_name,
                    value: [],
                  };
                  obj.value.push({ id: it.value_id, value: it.attr_value });
                  sku.push(obj);
                  if (!$scope.addItem.value_editPost[ite.attr_name]) {
                    $scope.addItem.value_editPost[ite.attr_name] = {};
                  }
                  $scope.addItem.value_editPost[ite.attr_name][it.value_id] =
                    it.attr_value;
                }
              });
            });

            const result = {};
            const _tmp = [];
            angular.forEach(sku, function (item) {
              if ($.inArray(item.key, _tmp) > -1) {
                result[item.key].value.push(item.value[0]);
              } else {
                _tmp.push(item.key);
                result[item.key] = {
                  key: item.key,
                  value: [item.value[0]],
                };
              }
            });

            $scope.addItem.sku_editPost = result;
          });
      } else {
        //编辑 获得自动填充的数据 已上架商品进入的编辑
        dataService
          .item_getItem({
            item_id: $scope.goodId,
          })
          .then(res => {
            //自动填充属性
            const item = res.data;
            $scope.addItem.item_comments = item.item_desc;
            $scope.addItem.sell_point = item.sell_point; // 卖点
            $scope.addItem.sku_mark = item.sku_mark; // 货号
            $scope.addItem.item_mark = item.item_mark; // 货号
            $scope.addItem.desc = item.item_desc;
            $scope.addItem.item_ori_url = item.item_ori_url;
            $scope.addItem.image = item.item_imgurl;
            //$('#mainImage').css('background-image', "url(" + item.item_imgurl + ")");
            $scope.addItem.item_name = item.item_name;
            $scope.addItem.brand_id = item.brand_info.brand_id;
            $scope.addItem.ship_country = item.ship_country;
            $scope.addItem.ship_area = item.ship_area;
            $scope.addItem.ship_fee = item.ship_fee;
            $scope.addItem.ship_method = item.ship_method;
            $scope.addItem.ship_tax = item.ship_tax;
            $scope.addItem.ship_time = item.ship_time;
            $scope.addItem.item_brand = {
              brand_id: item.brand_info.brand_id,
              brand_name: item.brand_info.brand_name,
            };
            $scope.addItem.size_table_imgurl = item.size_table_imgurl;
            $scope.addItem.sku_list_editPost = item.sku_list;
            if (item.prepare_sku == 1) {
              $scope.addItem.currency = '人民币';
            } else {
              $scope.addItem.currency = item.sku_list[0].currency;
            }
            $scope.addItem.attr_value_editPost = item.attr_value;
            $scope.addItem.attr_key_editPost = item.attr_key;
            $scope.addItem.ship_fee = item.ship_transmit_fee;
            $scope.addItem.ship_method = item.ship_method;
            $scope.addItem.item_location = item.item_location;
            $scope.addItem.prepare_sku = item.prepare_sku;
            $scope.oldDateTimePicker =
              item.expire_time == '0'
                ? ''
                : moment.unix(item.expire_time).format('YYYY/MM/DD HH:mm:ss');
            $scope.addItem.product_country = item.product_country;
            $scope.addItem.pack_type = item.pack_type;
            $scope.addItem.pack_type_str = (function (_) {
              return (
                (_ === '0' && '精装(带原包装)') ||
                (_ == '1' && '简装(不带原包装)') ||
                (_ == '2' && item.pack_type_str)
              );
            })(item.pack_type);
            $scope.addItem.ship_send_time = item.ship_send_time.map(function (
              i,
            ) {
              return +i;
            });
            $scope.addItem.ship_recv_time = item.ship_recv_time.map(function (
              i,
            ) {
              return +i;
            });
            $scope.addItem.ship_tax_flag = item.ship_tax_flag;
            $scope.addItem.selled_service = item.selled_service;
            $scope.addItem.ship_send_promiss = item.ship_send_promiss;
            $scope.addItem.ship_recv_promiss = item.ship_recv_promiss;
            //$scope.dateTimePicker = moment.unix(item.expire_time);
            //console.log($scope.addItem.attr_value_editPost,$scope.addItem.attr_value)
            // $timeout(function () {
            //     var mainImageViewer = new Viewer(document.getElementById('mainImage'))
            //     var detailImagesViewer = new Viewer(document.getElementById('detailImages'))
            //     var sizeImageViewer = new Viewer(document.getElementById('sizeImage'))
            // })
            switch (item.ship_method) {
              case '1': {
                break;
              }
              case '2': {
                $scope.addItem.ship_type = 2;
                $scope.addItem.ship_fee_total = item.ship_transmit_fee;
                break;
              }
              case '3': {
                $scope.addItem.ship_type = 1;
                $scope.addItem.ship_fee_nofree = item.ship_transmit_fee;
                break;
              }
              case '10': {
                $scope.addItem.ship_type = 1;
                break;
              }
            }
            //本来注释的
            // $scope.addItem.attr_value = item.attr_value;
            // $scope.addItem.size_table_str = JSON.parse(item.size_table_str);
            $scope.addItem.item_img_list = item.item_img_list
              ? item.item_img_list.split(';')
              : [];
            //addItem.selectSpecial[specItem.attr_name][s_color]
            if (item.size_table_str) {
              sizeData = JSON.parse(item.size_table_str); //[{title:'中国码',value:[2,4,5,6,7,8]},{title:'均码',value:[2,4,5,6,7,8]},{title:'普通码',value:[2,4,5,6,7,8]}];
              if (sizeData && sizeData.length) {
                let valLength = sizeData[0].value.length;
                const symbol = 'x';
                const obj = {
                  title: symbol,
                  value: [],
                };
                while (valLength > 0) {
                  obj.value.push(symbol);
                  valLength--;
                }
                sizeData.push(obj);
              }

              angular.forEach(sizeData, function (item) {
                $scope.addItem.sizeTitle.push(item.title);
                $scope.addItem.selectTitle[item.title] = true;
              });
            }
            //props
            angular.forEach(item.item_props, function (it) {
              angular.forEach(it, function (value, key) {
                if (angular.isArray(value)) {
                  //多选
                  const obj = {};
                  angular.forEach(value, function (i) {
                    obj[i] = true;
                  });
                  $scope.addItem.multi[key] = obj;
                } else {
                  //单选
                  $scope.addItem.single[key] = value;
                }
              });
            });

            // 返回对象数组中包含指定属性值的对象下标
            const arrayObjectIndexOf = function (myArray, searchTerm, property) {
              for (let i = 0, len = myArray.length; i < len; i++) {
                if (myArray[i][property] === searchTerm) return i;
              }
              return -1;
            };

            // 与Array的filter方法配合去重
            const onlyUnique = function (value, index, self) {
              return self.indexOf(value) === index;
            };

            // 如果接口数据中包含"尺寸",则动态为seeSize.sizeSet添加"尺寸"这个尺码及相关数据
            angular.forEach(item.attr_key, function (attrKeyItem) {
              if (attrKeyItem.attr_name === '尺寸') {
                const CHICUN = {
                  title: '尺寸',
                  value: [],
                  prop_name: '尺寸',
                },
                  tempArr = [];
                angular.forEach(item.attr_value, function (attrValueItem) {
                  if (attrKeyItem.attr_key_id === attrValueItem.attr_key_id) {
                    tempArr.push(attrValueItem.attr_value);
                  }
                });
                CHICUN['value'] = tempArr.filter(onlyUnique);
                if (
                  arrayObjectIndexOf(
                    $scope.seeSize.sizeSet,
                    '尺寸',
                    'title',
                  ) === -1
                ) {
                  $scope.seeSize.sizeSet.push(CHICUN);
                }
              }
            });

            angular.forEach(item.attr_key, function (attrKeyItem) {
              if (attrKeyItem.attr_name === '自定义') {
                const CHICUN = {
                  title: '自定义',
                  value: [],
                  prop_name: '自定义',
                },
                  tempArr = [];
                angular.forEach(item.attr_value, function (attrValueItem) {
                  if (attrKeyItem.attr_key_id === attrValueItem.attr_key_id) {
                    tempArr.push(attrValueItem.attr_value);
                  }
                });
                CHICUN['value'] = tempArr.filter(onlyUnique);
                if (
                  arrayObjectIndexOf(
                    $scope.seeSize.sizeSet,
                    '自定义',
                    'title',
                  ) === -1
                ) {
                  $scope.seeSize.sizeSet.push(CHICUN);
                }
              }
            });

            for (let i = 0, len = item.sku_list.length; i < len; i++) {
              const skuItem = item.sku_list[i];
              const skuId = skuItem.sku_id;
              const valueIdArray = skuItem.value_id_array;
              const keyArray = [];

              angular.forEach(item.attr_key, function (attrKeyItem) {
                angular.forEach(item.attr_value, function (attrValueItem) {
                  if (valueIdArray.indexOf(attrValueItem.value_id) != -1) {
                    if (attrKeyItem.attr_key_id == attrValueItem.attr_key_id) {
                      if (
                        attrKeyItem.attr_name == '欧码' ||
                        attrKeyItem.attr_name == '美码' ||
                        attrKeyItem.attr_name == '英码' ||
                        attrKeyItem.attr_name == '手镯内径' ||
                        attrKeyItem.attr_name == '通用码' ||
                        attrKeyItem.attr_name == '日本码' ||
                        attrKeyItem.attr_name == '均码' ||
                        attrKeyItem.attr_name == '中国码' ||
                        attrKeyItem.attr_name == '腰围' ||
                        attrKeyItem.attr_name == '链子长度' ||
                        attrKeyItem.attr_name == '尺寸' ||
                        attrKeyItem.attr_name == '自定义' ||
                        attrKeyItem.attr_name == '戒圈' ||
                        attrKeyItem.attr_name == '尺码'
                      ) {
                        if (
                          !$scope.addItem.selectSpecial[attrKeyItem.attr_name]
                        ) {
                          $scope.addItem.selectSpecial[
                            attrKeyItem.attr_name
                          ] = {};
                        }
                        $scope.setSize(
                          getSizeIndex(
                            attrKeyItem.attr_name,
                            $scope.seeSize.sizeSet,
                          ),
                          attrKeyItem.attr_name,
                        );
                        //console.warn($scope.seeSize.sizeSet);
                        $scope.addItem.selectSpecial[attrKeyItem.attr_name][
                          attrValueItem.attr_value
                        ] =
                          attrValueItem.attr_value;
                      } else {
                        if (
                          !$scope.addItem.selectSpecial[attrKeyItem.attr_name]
                        ) {
                          $scope.addItem.selectSpecial[
                            attrKeyItem.attr_name
                          ] = {};
                        }
                        if (attrKeyItem.attr_name == '颜色') {
                          $scope.setColor(
                            getColorIndex(
                              attrValueItem.attr_value,
                              $scope.seeColor.colorSet,
                            ),
                          );
                        }
                        $scope.addItem.selectSpecial[attrKeyItem.attr_name][
                          attrValueItem.attr_value
                        ] =
                          attrValueItem.attr_value;
                      }
                      keyArray.push(attrValueItem.attr_value);
                    }
                  }
                });
              });

              let key;
              if ($scope.addItem.sizeType) {
                key = $scope.addItem.sizeType + keyArray.join('');
              } else {
                key = keyArray.join('');
              }

              //console.warn($scope.addItem.attr_value);
              $scope.addItem.ops[key] = {
                sku_ori_price: skuItem.sku_ori_price,
                sku_price: skuItem.sku_price,
                sku_stock: skuItem.sku_stock,
                sku_id: skuId,
                currency: $scope.addItem.currency,
              };
              //console.warn($scope.addItem.ops);
            }
          });
      }
    }
  }

  function StringToArray(string) {
    return JSON.parse(string);
  }

  $scope.setColor = function (index) {
    $scope.seeColor.colorTab = index;
  };

  $scope.setSize = function (index, type) {
    $scope.seeSize.sizeTab = index;
    $scope.addItem.sizeType = type;
  };

  $scope.upload = function (res) {
    if (res.result == 1) {
      $scope.addItem.image = res.data;
      //$timeout(function () {
      // var viewer = new Viewer(document.getElementById('mainImage'))
      //})

      //$('#mainImage').css('background-image', "url(//img-qn.seecsee.com" + res.data + ")")
    }
  };

  // 新增品牌图片
  $scope.uploadBrand = function (res) {
    if (res.result == 1) {
      $scope.addItem.brandImage = res.data;
      $('#brandImage').css(
        'background-image',
        'url(//img-qn.seecsee.com' + res.data + ')',
      );
    }
  };

  $scope.uploadSizeImg = function (data) {
    if (data.result == 1) {
      //var imgObj = new Image();
      //imgObj.src = data.data;
      //console.log(imgObj.width);
      $scope.addItem.size_table_imgurl = data.data;
      // var viewer = new Viewer(document.getElementById('sizeImage'))
    }
  };
  const imgCount = 15;
  $scope.addItem.item_img_list_index = 0;
  $scope.uploadMore = function (data) {
    const index = $scope.addItem.item_img_list_index;
    if (data.result == 1) {
      if (index < imgCount) {
        $scope.addItem.item_img_list.push(data.data);
        $scope.addItem.item_img_list_index++;
      }
      // var viewer = new Viewer(document.getElementById('detailImages'))
    } else Notification.dataError(data.msg);
  };

  function renderClassAttrList() {
    dataService
      .item_getClassAttr({
        class_id: $scope.class_id,
      })
      .then(data => {
        const res = data.data || [];
        let tempRes,
          i,
          colorSet = [],
          sizeSet = [],
          length = res.length;
        for (i = length - 1; i >= 0; i--) {
          tempRes = res[i];
          tempRes.attr_default_value = StringToArray(
            tempRes.attr_default_value,
          );
          //商品规格
          (function (tempRes) {
            if (tempRes.attr_isspec == 1) {
              $scope.specialPro.push(tempRes);
              $scope.addItem.attr_key.push(tempRes['attr_name']);
              $scope.specialObject.push(tempRes);
              if (tempRes.attr_name == '颜色') {
                dataService.item_getColor().then(function (data) {
                  colorSet = data.data;
                  $scope.seeColor.colorSet = colorSet;
                  $scope.seeColor.sub_color = colorSet[0].color_array;
                  $scope.seeColor.colorTab = 0;
                  renderData();
                });
              } else {
                dataService
                  .item_getSizeProperty({
                    class_id: $scope.class_id,
                  })
                  .then(
                    function (data) {
                      sizeSet = data.data;
                      $scope.addItem.sizeType = sizeSet[0].title;
                      $scope.seeSize.sizeSet = sizeSet;
                      $scope.seeSize.sub_size = sizeSet[0].value;
                      $scope.seeSize.sizeTab = 0;
                    },
                    err => {
                      const obj = {
                        title: tempRes.attr_name,
                        value: tempRes.attr_default_value,
                      };
                      sizeSet = data.data;
                      $scope.addItem.sizeType = tempRes.title;
                      $scope.seeSize.sizeSet = [obj];
                      $scope.seeSize.sub_size = tempRes.attr_default_value;
                      $scope.seeSize.sizeTab = 0;
                    },
                )
                  .finally(() => renderData());
              }
            }
          })(tempRes);

          if (tempRes.attr_type == 1) {
            //单选属性
            tempRes.radioBox = tempRes.attr_default_value;
          } else if (tempRes.attr_type == 2 && tempRes.attr_isspec != 1) {
            //多选属性
            tempRes.checkBox = tempRes.attr_default_value;
          }
        }
        $scope.classAttr = res;
      });
  }

  //hainan adds
  /*    dataService.getSize($scope.class_id).success(function (data){
   if(data.result === 1){
   //处理尺码表
   var titleArray = [];
   sizeData = data.data;//[{title:'中国码',value:[2,4,5,6,7,8]},{title:'均码',value:[2,4,5,6,7,8]},{title:'普通码',value:[2,4,5,6,7,8]}];
   angular.forEach(sizeData,function(item){
   titleArray.push(item.title);
   });
   $scope.addItem.sizeTitle = titleArray;
   }
   });*/

  function getSizeList(selectTitle) {
    let length;
    const list = [];
    let i = 0;
    if (sizeData && selectTitle.length) {
      length = sizeData[0].value.length;
      list.push(selectTitle);
      while (i < length) {
        const itemArray = [];
        for (let j = 0, len = selectTitle.length; j < len; j++) {
          angular.forEach(sizeData, function (item) {
            if (selectTitle[j] == item.title) {
              itemArray.push(item.value[i]);
            }
          });
        }
        list.push(itemArray);
        i++;
      }
      $scope.addItem.sizeList = list;
    } else {
      $scope.addItem.sizeList = [];
    }
  }

  function refreshSizeTable() {
    const sizeList = $scope.addItem.sizeList;
    let item;
    if (sizeList && sizeList.length) {
      for (let i = 0, len = sizeList.length; i < len; i++) {
        item = sizeList[i];
        for (let j = 0, le = item.length; j < le; j++) {
          if (!$scope.addItem.sizeTable[i]) {
            $scope.addItem.sizeTable[i] = {};
          }
          $scope.addItem.sizeTable[i][j] = item[j];
        }
      }
    }
  }

  $scope.$watch(
    'addItem.selectSpecial',
    function () {
      //暂时处理两个维度
      const obj = {};

      const attr_key = $scope.addItem.attr_key;
      const specialPro = $scope.addItem.selectSpecial;
      const type = $scope.addItem.sizeType;

      if (type) {
        let position;
        for (let i = 0, len = attr_key.length; i < len; i++) {
          if (attr_key[i] == '颜色') {
            position = i;
            break;
          }
        }
        //console.warn(attr_key);
        if (position == 0) {
          attr_key.splice(1, 1, type);
        } else {
          attr_key.splice(0, 1, type);
        }
        //console.warn(attr_key);
      }

      if (!attr_key) {
        return;
      }
      $scope.addItem.attr_value = [];
      for (let i = 0, len = attr_key.length; i < len; i++) {
        if (!checkPro(attr_key[i], specialPro)) {
          //console.log('请选择 ' + attr_key[i]);
          return;
        }
      }

      for (let i = 0, len = attr_key.length; i < len; i++) {
        const name = attr_key[i];
        //console.log(name,specialPro)
        if (specialPro[name]) {
          angular.forEach(specialPro[name], function (v, k) {
            if (v) {
              if (obj[name]) {
                obj[name].push(k);
              } else {
                obj[name] = [k];
              }
            }
          });
        }
      }
      //console.warn(attr_key,obj)
      //以后改
      if (attr_key.length === 1) {
        angular.forEach(obj[attr_key[0]], function (it) {
          // $scope.addItem.attr_value.push([it]);
          const obj = {};
          obj[attr_key[0]] = it;
          $scope.addItem.attr_value.push({
            key: $scope.addItem.sizeType ? $scope.addItem.sizeType + it : it,
            array: [it],
            value: obj,
          });
        });
      } else {
        angular.forEach(obj[attr_key[0]], function (item) {
          angular.forEach(obj[attr_key[1]], function (it) {
            // $scope.addItem.attr_value.push([item,it]);
            const obj = {};
            obj[attr_key[0]] = item;
            obj[attr_key[1]] = it;
            $scope.addItem.attr_value.push({
              key: $scope.addItem.sizeType
                ? $scope.addItem.sizeType + item + it
                : item + it,
              array: [item, it],
              value: obj,
            });
          });
        });
      }
    },
    true,
  );

  $scope.$watch(
    'addItem.selectTitle',
    function () {
      const selectTitle = [];
      angular.forEach($scope.addItem.selectTitle, function (value, key) {
        if (value) {
          selectTitle.push(key);
        }
      });
      getSizeList(selectTitle);
      refreshSizeTable();
    },
    true,
  );

  $scope.$watch(
    'addItem.size_table_imgurl',
    function () {
      const url = $scope.addItem.size_table_imgurl;
      if (url && url.search(/http:|https:/) !== 0) {
        $scope.size_table_imgurl = '//img-qn.seecsee.com' + url;
      } else {
        $scope.size_table_imgurl = url;
      }
    },
    true,
  );

  $scope.$watch(
    'addItem.image',
    function () {
      const url = $scope.addItem.image;
      if (url && url.search(/http:|https:/) !== 0) {
        $scope.image = '//img-qn.seecsee.com' + url;
      } else {
        $scope.image = url;
      }
    },
    true,
  );

  $scope.$watch(
    'addItem.item_img_list',
    function () {
      $scope.item_img_list = [];
      const imgList = $scope.addItem.item_img_list;
      for (let i = 0, len = imgList.length; i < len; i++) {
        if (imgList[i].search(/http:|https:/) !== 0 && imgList[i] !== '') {
          $scope.item_img_list.push('//img-qn.seecsee.com' + imgList[i]);
        } else {
          $scope.item_img_list.push(imgList[i]);
        }
      }
      /*        angular.forEach($scope.addItem.item_img_list,function(item){
     if(item.search(/http:|https:/) != 0){
     item = '//img-qn.seecsee.com' + item;
     }
     });*/
    },
    true,
  );

  /*$scope.$watch('addItem', function(){
   console.log($scope);
   },true);*/

  const count_country = 1;
  let index_country = 0;
  $scope.$watch(
    'addItem.ship_country',
    function () {
      if (index_country > count_country) {
        $scope.addItem.ship_area = '';
      }
      index_country++;
      /*dataService.getAreaList($scope.addItem.ship_country).success(function (data){
     if (data.result === 1){
     $scope.areaList = data.data;
     }
     });*/
    },
    true,
  );

  $scope.errorMessage = {};
  $scope.$watch(
    'addItem.ops',
    function () {
      const target = $scope.addItem.ops;
      for (const obj in target) {
        if (target.hasOwnProperty(obj)) {
          if (target[obj].ori_price < target[obj].price) {
            $scope.errorMessage.ops = true;
            return false;
          }
        }
      }
      $scope.errorMessage.ops = false;
    },
    true,
  );

  $scope.$watch(
    'addItem.sizeInput',
    function () {
      $scope.addItem.sizeTitle = [];
      $scope.addItem.selectTitle = {};
      sizeData = [];
      if (!$scope.addItem.sizeInput) return;
      const valArray = $scope.addItem.sizeInput.split(' ');
      const titleArray = [];

      for (let i = 0, len = valArray.length; i < len; i++) {
        const tds = valArray[i].split('\t').concat(['x']);
        for (let j = 0, l = tds.length; j < l; j++) {
          if (i == 0) {
            sizeData.push({
              title: tds[j],
              value: [],
            });
            titleArray.push(tds[j]);
          } else {
            sizeData[j].value.push(tds[j]);
          }
        }
      }
      $scope.addItem.sizeTitle = titleArray;
      angular.forEach(titleArray, function (item) {
        $scope.addItem.selectTitle[item] = true;
      });
    },
    true,
  );

  $scope.$watch(
    'addItem.ship_country',
    function () {
      if ($scope.addItem.ship_country == '中国') {
        $scope.addItem.ship_method = '1';
      } else {
        $scope.addItem.ship_method = '3';
      }
      if ($scope.addItem.ship_country == '日本') {
        $scope.addItem.item_location = '7'; // 默认选中日本一号仓
      }
      $scope.addItem.ship_fee = 0;
      $scope.addItem.ship_fee_total = 0;
      $scope.addItem.ship_fee_nofree = 0;
    },
    true,
  );
  $scope.$watch(
    'addItem.ship_type',
    function () {
      if ($scope.addItem.ship_type == 2) {
        $scope.addItem.ship_method = '2';
      }
    },
    true,
  );
  $scope.$watch(
    'addItem.ship_fee_total',
    function () {
      $scope.addItem.ship_fee = $scope.addItem.ship_fee_total;
    },
    true,
  );

  $scope.$watch(
    'addItem.ship_fee_nofree',
    function () {
      $scope.addItem.ship_fee = $scope.addItem.ship_fee_nofree;
    },
    true,
  );
  $scope.$watch(
    'addItem.ship_method',
    function () {
      switch ($scope.addItem.ship_method) {
        case '2': {
          $scope.addItem.ship_fee = $scope.addItem.ship_fee_total;
          break;
        }
        case '3': {
          $scope.addItem.ship_fee = $scope.addItem.ship_fee_nofree;
          break;
        }
        case '10': {
          $scope.addItem.ship_fee = 0;
          break;
        }
      }
    },
    true,
  );

  $scope.$watch(
    'addItem.item_location',
    function () {
      const address = ADDRESS;
      const shipFeeCharge = SHIPFEECHARGE;
      $scope.addItem.ship_store_addr = address[$scope.addItem.item_location];
      $scope.addItem.shipFeeCharge =
        shipFeeCharge[$scope.addItem.item_location];

      calculateShipFee($scope.addItem.item_location, $scope.weight);
    },
    true,
  );

  $scope.dynamicPopoverUrl = 'japanPopover.html';

  $scope.addOneLine = function () {
    const sizeList = $scope.addItem.sizeList;
    if (sizeList.length) {
      let i = 0;
      const item = [];
      while (i < sizeList[0].length) {
        item.push('');
        i++;
      }
      sizeList.push(item);
    }
  };
  $scope.addBrandSubmit = function (addBrand) {
    dataService
      .item_addBrand(addBrand)
      .then(data => ($scope.addItem.brand_id = data.data));
  };

  $scope.getStoreAddr = function (name) {
    const address = ADDRESS;
    $scope.addItem.ship_store_addr = address[name];
  };

  $scope.getShipFeeCharge = function (name) {
    const shipFeeCharge = SHIPFEECHARGE;
    $scope.addItem.shipFeeCharge = shipFeeCharge[name];
  };

  function checkPro(key, selectProObj) {
    const obj = selectProObj[key];
    if (!obj) {
      return false;
    }
    for (const k in obj) {
      if (obj[k]) {
        return true;
      }
    }
    return false;
  }

  function renderBrandList(callback) {
    dataService.item_getBrandList().then(data => {
      $scope.brandList = data.data;
      callback();
    });
  }

  function renderCountyList() {
    dataService
      .CommonData_getConfigLocation()
      .then(res => ($scope.countryList = res.data));
  }

  $scope.setSame = function (model, type) {
    const len = $scope.addItem.attr_value.length;
    const arr1 = $scope.addItem.attr_value;
    const arr2 = $scope.addItem.ops;
    for (let i = 0; i < len; i++) {
      const keyarr = arr1[i].key;
      let key = keyarr;
      if ($scope.addItem.sizeType) {
        key = keyarr;
      }
      if (arr2[keyarr] === undefined) {
        arr2[keyarr] = {};
      }
      arr2[key][type] = model;
      arr2[keyarr][type] = model;
    }
  };

  function getUserInfo() {
    dataService.order_getUserData().then(data => {
      $scope.user_info = data.data;
      $scope.seller_id = data.data.seller_id;
    });
  }

  function getCurrencyRate() {
    dataService.item_getCurrencyRate().then(res => {
      CurrencyRate = res.data.map;
      $scope.$broadcast('CurrencyRate', CurrencyRate);
    });
  }

  const init = function () {
    getUserInfo();
    renderClassAttrList();
    renderCountyList();
    //	renderBrandList(renderData);
    renderData();
    getWeight();
    getBrand();
    getCurrencyRate();
  };
  init();

  $scope.sending = false;
  $scope.sendingBtn = '确认';
  const editType = $routeParams.type;
  $scope.$on('CurrencyRate', function (e, d) {
    CurrencyRate = d; // 汇率
  });

  $scope.addItemSubmit = function (goodsForm) {
    $scope.errMsg = '';

    let sku;
    const item = $scope.addItem;

    const data = {
      item_name: item.item_name,
      class_id: $scope.class_id,
      //brand_id: item.brand_id,
      //brand_id: angular.isObject(item.item_brand) ? item.item_brand.brand_id : '',
      //brand_name: item.item_brand,
      item_ori_url: item.item_ori_url,
      ship_fee: item.ship_fee,
      ship_tax: '',
      ship_method: item.ship_method,
      item_location: item.item_location,
      ship_time: '',
      ship_isstatic: '',
      ship_country: item.ship_country,
      ship_area: item.ship_area,
      attr_key: item.attr_key,
      item_prop: [],
      sku_list: [],
      item_imgurl: item.image,
      item_imglist: item.item_img_list.join(';'),
      item_img_list: item.item_img_list.join(';'),
      item_desc: item.desc,
      item_brand: angular.isObject(item.item_brand)
        ? item.item_brand.brand_name
        : angular.isString(item.item_brand) ? item.item_brand : '',
      size_table_imgurl: item.size_table_imgurl,
      size_table_str: [],
      currency: item.currency,
      expire_time: $scope.dateTimePicker,
      sku_mark: item.sku_mark || '',
      item_mark: item.item_mark || '',
      sell_point: item.sell_point,
      product_country: item.product_country,
      pack_type: item.pack_type,
      pack_type_str: (function (_) {
        return (
          (_ === '0' && '精装(带原包装)') ||
          (_ == '1' && '简装(不带原包装)') ||
          (_ == '2' && item.pack_type_str)
        );
      })(item.pack_type),
      ship_send_time: JSON.stringify(item.ship_send_time),
      ship_recv_time: JSON.stringify(item.ship_recv_time),
      ship_tax_flag: item.ship_tax_flag,
      selled_service: JSON.stringify(item.selled_service),
      ship_recv_promiss: item.ship_recv_promiss,
      ship_send_promiss: item.ship_send_promiss,
    };

    if (!data.item_name) {
      goodsForm.item_name.$touched = goodsForm.item_name.$invalid = true;
      $scope.errMsg = '请填写商品名称';
      return;
    }
    if (!data.sell_point) {
      goodsForm.sell_point.$touched = goodsForm.sell_point.$invalid = true;
      $scope.errMsg = '请填写商品卖点';
      return;
    }
    if (editType == 'editPost') {
      if (!data.item_desc) {
        goodsForm.desc.$touched = goodsForm.desc.$invalid = true;
        $scope.errMsg = '请填写商品详情';
        return;
      }
    }
    if (!data.item_imgurl) {
      $scope.errMsg = '请上传商品主图片';
      return;
    }
    if (!data.item_img_list) {
      $scope.errMsg = '请上传商品详细图片';
      return;
    }
    if (!data.item_brand) {
      goodsForm.item_brand.$touched = goodsForm.item_brand.$invalid = true;
      $scope.errMsg = '请填写商品品牌';
      return;
    }
    if (angular.isString($scope.addItem.item_brand)) {
      if (!$scope.addItem.brandImage) {
        $scope.errMsg = '请上传新增品牌的图片';
        return;
      }
      if (!$scope.addItem.brand_desc) {
        $scope.errMsg = '请填写新增品牌的简介';
        return;
      }
    }
    if ($scope.addItem.attr_value.length == 0) {
      $scope.errMsg = '请选择商品规格';
      return;
    }
    if (!data.currency) {
      $scope.errMsg = '请选择货币类型';
      return;
    }
    if ($.isEmptyObject(item.ops)) {
      $scope.errMsg = '请填写商品的市场价/售价/数量';
      return;
    }
    let _opsFlag = true;
    angular.forEach(item.ops, function (val, key) {
      if (!val.ori_price) {
        $scope.errMsg = '请填写商品规格中的市场价！';
        _opsFlag = false;
      }
      if (!val.price) {
        $scope.errMsg = '请填写商品规格中的售价！';
        _opsFlag = false;
      }
      if (!val.stock) {
        $scope.errMsg = '请填写商品规格中的数量！';
        _opsFlag = false;
      }
    });
    if (!_opsFlag) return;

    if ($scope.addItem.pack_type == 2 && !$scope.addItem.pack_type_str) {
      goodsForm.pack_type.$touched = goodsForm.pack_type.$invalid = true;
      $scope.errMsg = '请填写其他商品包装';
      return;
    }
    if (!$scope.addItem.ship_country) {
      goodsForm.country.$touched = goodsForm.country.$invalid = true;
      $scope.errMsg = '请选择发货地国家';
      return;
    }
    if ($scope.addItem.ship_send_time.length < 2) {
      goodsForm.ship_send_time.$touched = goodsForm.ship_send_time.$invalid = true;
      $scope.errMsg = '请填写预计发货时长';
      return;
    }
    if ($scope.addItem.ship_recv_time.length < 2) {
      goodsForm.ship_recv_time.$touched = goodsForm.ship_recv_time.$invalid = true;
      $scope.errMsg = '请填写预计到货时长';
      return;
    }

    if ($scope.seller_id != 1) {
      if (!(data.ship_method || data.ship_fee)) {
        $scope.errMsg = '物流费用或者发货方式不能不填';
        return;
      }
    }
    if (null == data.ship_fee) {
      $scope.errMsg = '请填写运费';
      return;
    }

    if ($scope.seller_id != 1 && data.ship_method == 0) {
      $scope.errMsg = '请选择是否包邮';
      return;
    }
    $scope.isItemRequired = true;

    if (item.sizeType) {
      let position;
      const type = item.sizeType;
      for (let i = 0, len = item.attr_key.length; i < len; i++) {
        if (item.attr_key[i] == '颜色') {
          position = i;
          break;
        }
      }
      if (position == 0) {
        item.attr_key.splice(1, 1, type);
      } else {
        item.attr_key.splice(0, 1, type);
      }
    }
    data.attr_key = item.attr_key;

    angular.forEach(item.attr_value, function (it) {
      let key = it.array.join('');
      if ($scope.addItem.sizeType) {
        key = $scope.addItem.sizeType + key;
      }
      let obj;
      item.ops[key].sku_id = item.ops[key].sku_id ? item.ops[key].sku_id : -1;
      obj = angular.extend({}, item.ops[key]);
      obj.attr_value = it.array;
      data.sku_list.push(obj);
    });
    angular.forEach(item.single, function (value, key) {
      const proItem = {};
      proItem[key] = value;
      data.item_prop.push(proItem);
    });
    angular.forEach(item.multi, function (value, key) {
      const proItem = {};
      proItem[key] = [];
      angular.forEach(value, function (v, k) {
        if (v) {
          proItem[key].push(k);
        }
      });
      data.item_prop.push(proItem);
    });
    //get size
    angular.forEach(item.sizeTable, function (value, key) {
      if (key == 0) {
        angular.forEach(value, function (v, k) {
          data.size_table_str.push({
            title: v,
            value: [],
          });
        });
      } else {
        let num = 0;
        angular.forEach(data.size_table_str, function (item) {
          item.value.push(value[num++]);
        });
      }
    });

    $scope.sending = true;
    $scope.sendingBtn = '提交中...';

    if (angular.isString(item.item_brand)) {
      const brandParams = {
        brand_name: item.item_brand,
        brand_desc: item.brand_desc,
        brand_imgurl: item.brandImage,
      };
      dataService.item_addBrand(brandParams).then(res => {
        data['brand_id'] = res.data.brand_id;
        addItem(data);
      });
    } else if (angular.isObject(item.item_brand)) {
      data['brand_id'] = item.item_brand.brand_id;
      addItem(data);
    }

    function addItem(_data) {
      _data.sku_list = JSON.stringify(_data.sku_list);
      _data.attr_key = JSON.stringify(_data.attr_key);
      _data.item_prop = JSON.stringify(_data.item_prop);
      _data.size_table_str.splice(-1, 1);
      _data.size_table_str = JSON.stringify(_data.size_table_str);

      dataService
        .item_addItem(_data)
        .then(res => {
          $(window).unbind('beforeunload');
          $location.url('/goods/posted');
        })
        .finally(() => {
          $scope.sending = false;
          $scope.sendingBtn = '确认';
        });
    }
  };

  $scope.editPostItemSubmit = function (goodsForm) {
    let sku;
    const item = $scope.addItem;
    const data = {
      attr_key: item.attr_key,
      attr_key_ex: item.attr_key_editPost,
      item_prop: [],
      sku_list: [],
      item_id: $scope.goodId,
      attr_value: item.attr_value_editPost,
      item_imglist: item.item_img_list.join(';'),
      item_info: {
        class_id: $scope.class_id,
        item_name: item.item_name,
        item_desc: item.desc,
        item_ori_url: item.item_ori_url,
        item_imgurl: item.image,
        item_img_list: item.item_img_list.join(';'),
        ship_country: item.ship_country,
        ship_area: item.ship_area,
        size_table_str: [],
        size_table_imgurl: item.size_table_imgurl,
        //brand_id: angular.isObject(item.item_brand) ? item.item_brand.brand_id : '',
        //brand_name: item.item_brand,
        currency: item.currency,
        ship_fee: item.ship_fee,
        ship_method: item.ship_method,
        item_location: item.item_location,
        expire_time: $scope.dateTimePicker,
        sell_point: item.sell_point, // 卖点
        sku_mark: item.sku_mark || '', // 货号
        item_mark: item.item_mark || '', // 货号
        product_country: item.product_country,
        pack_type: item.pack_type,
        pack_type_str: (function (_) {
          return (
            (_ === '0' && '精装(带原包装)') ||
            (_ == '1' && '简装(不带原包装)') ||
            (_ == '2' && item.pack_type_str)
          );
        })(item.pack_type),
        ship_send_time: JSON.stringify(item.ship_send_time),
        ship_recv_time: JSON.stringify(item.ship_recv_time),
        ship_tax_flag: item.ship_tax_flag,
        selled_service: JSON.stringify(item.selled_service),
        ship_recv_promiss: item.ship_recv_promiss,
        ship_send_promiss: item.ship_send_promiss,
      },
    };
    if (!$scope.addItem.item_name) {
      goodsForm.item_name.$touched = goodsForm.item_name.$invalid = true;
      $scope.errMsg = '请填写商品名称';
      return -1;
    }
    if (!$scope.addItem.sell_point) {
      goodsForm.sell_point.$touched = goodsForm.sell_point.$invalid = true;
      $scope.errMsg = '请填写商品卖点';
      return -1;
    }
    if (editType == 'editPost') {
      if (!$scope.addItem.desc) {
        goodsForm.desc.$touched = goodsForm.desc.$invalid = true;
        $scope.errMsg = '请填写商品详情';
        return -1;
      }
    }
    if (!$scope.addItem.image) {
      $scope.errMsg = '请上传商品主图片';
      return -1;
    }
    if (!$scope.addItem.item_img_list) {
      $scope.errMsg = '请上传商品详细图片';
      return -1;
    }
    if (!$scope.addItem.item_brand) {
      goodsForm.item_brand.$touched = goodsForm.item_brand.$invalid = true;
      $scope.errMsg = '请填写商品品牌';
      return -1;
    }
    if (angular.isString($scope.addItem.item_brand)) {
      if (!$scope.addItem.brandImage) {
        $scope.errMsg = '请上传新增品牌的图片';
        return -1;
      }
      if (!$scope.addItem.brand_desc) {
        $scope.errMsg = '请填写新增品牌的简介';
        return -1;
      }
    }

    if (editType == 'post') {
      if ($scope.addItem.attr_value.length == 0) {
        $scope.errMsg = '请选择商品规格';
        return -1;
      }
      if (!$scope.addItem.currency) {
        $scope.errMsg = '请选择货币类型';
        return -1;
      }
      if ($.isEmptyObject(item.ops)) {
        $scope.errMsg = '请填写商品的市场价/售价/数量';
        return -1;
      }

      if (!$scope.addItem.ship_country) {
        goodsForm.country.$touched = goodsForm.country.$invalid = true;
        $scope.errMsg = '请选择发货地国家';
        return -1;
      }

      if ($scope.seller_id != 1) {
        if (!($scope.addItem.ship_method || $scope.addItem.ship_fee)) {
          $scope.errMsg = '物流费用或者发货方式不能不填';
          return -1;
        }
      }
      if (null == $scope.addItem.ship_fee) {
        $scope.errMsg = '请填写运费';
        return -1;
      }

      if ($scope.seller_id != 1 && $scope.addItem.ship_method == 0) {
        $scope.errMsg = '请选择是否包邮';
        return -1;
      }
    }

    angular.forEach($scope.addItem.value_editPost, function (value, key) {
      angular.forEach(value, function (v, k) {
        angular.forEach($scope.addItem.attr_value_editPost, function (item) {
          if (item.value_id == k) {
            item.attr_value = v;
          }
        });
      });
    });

    if (item.sizeType) {
      let position;
      const type = item.sizeType;
      // if(type == '通用码' || type == '均码' || type == '中国码'){
      //     type = '尺码';
      // }
      for (let i = 0, len = item.attr_key.length; i < len; i++) {
        if (item.attr_key[i] == '颜色') {
          position = i;
          break;
        }
      }
      if (position == 0) {
        item.attr_key.splice(1, 1, type);
      } else {
        item.attr_key.splice(0, 1, type);
      }
    }

    if ($scope.type == 'editPost') {
      data.sku_list = item.sku_list_editPost;
    }

    if ($scope.type == 'post') {
      //get sku_list
      angular.forEach(item.attr_value, function (it) {
        const valueItem = it.value;
        let key;
        let obj;
        if ($scope.addItem.sizeType) {
          key = $scope.addItem.sizeType + it.array.join('');
        } else {
          key = it.array.join('');
        }

        item.ops[key].sku_id = item.ops[key].sku_id ? item.ops[key].sku_id : -1;
        obj = angular.extend({}, item.ops[key]);
        obj.attr_value = it.array;
        data.sku_list.push(obj);
      });
    }

    //get item_prop
    angular.forEach(item.single, function (value, key) {
      const proItem = {};
      proItem[key] = value;
      data.item_prop.push(proItem);
    });
    angular.forEach(item.multi, function (value, key) {
      const proItem = {};
      proItem[key] = [];
      angular.forEach(value, function (v, k) {
        if (v) {
          proItem[key].push(k);
        }
      });
      data.item_prop.push(proItem);
    });
    //get size
    angular.forEach(item.sizeTable, function (value, key) {
      if (key == 0) {
        angular.forEach(value, function (v, k) {
          data.item_info.size_table_str.push({
            title: v,
            value: [],
          });
        });
      } else {
        let num = 0;
        angular.forEach(data.item_info.size_table_str, function (item) {
          item.value.push(value[num++]);
        });
      }
    });

    $scope.sending = true;
    $scope.sendingBtn = '提交中...';

    // 新增品牌
    if (angular.isString(item.item_brand)) {
      const brandParams = {
        brand_name: item.item_brand,
        brand_desc: item.brand_desc,
        brand_imgurl: item.brandImage,
      };
      dataService.item_addBrand(brandParams).then(res => {
        data.item_info['brand_id'] = res.data.brand_id;
        addItem(data);
      });
    } else if (angular.isObject(item.item_brand)) {
      data.item_info['brand_id'] = item.item_brand.brand_id;
      addItem(data);
    }

    function addItem(_data) {
      _data.sku_list = JSON.stringify(_data.sku_list);
      _data.attr_key = JSON.stringify(_data.attr_key);
      _data.attr_key_ex = JSON.stringify(_data.attr_key_ex);
      _data.item_prop = JSON.stringify(_data.item_prop);
      _data.item_info.size_table_str.splice(-1, 1);
      _data.item_info.size_table_str = JSON.stringify(
        _data.item_info.size_table_str,
      );
      _data.attr_value = JSON.stringify(_data.attr_value);
      _data.item_info = JSON.stringify(_data.item_info);

      dataService
        .item_addItem(_data)
        .then(resData => {
          $(window).unbind('beforeunload');
          if ($routeParams.come_from) {
            switch ($routeParams.come_from) {
              case 'add_answer':
                window.history.go(-1);
                break;
              case 'wait_post':
                $location.url('/goods/');
                break;
              case 'posted':
                $location.url('/goods/posted');
                break;
              default:
                $location.url('/goods/Post');
            }
          } else {
            if (editType == 'editPost') $location.url('/goods/posted');
            else $location.url('/goods/Post');
          }
        })
        .finally(() => {
          $scope.sending = false;
          $scope.sendingBtn = '确认';
        });
    }
  };
}

export const goodsPostBasicInfoDeprecated: ng.IComponentOptions = {
  template: require('./goods-post-basic-info-deprecated.template.html'),
  controller: goodsPostBasicInfoDeprecatedController,
};
