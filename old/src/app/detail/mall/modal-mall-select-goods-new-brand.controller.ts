import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import * as _ from 'lodash';

export class mallSelectGoodsNewBrandController {
  is_checked_all: any;
  is_checked_all_hot: any;
  is_add_items: any[];
  list_cur: any[];
  list_choice: any[];
  list_choice_hot: any[];
  selected_goods_list: any[];
  list_item: any[];
  list_page: any[];
  list_page_favour: any[];
  type: any;
  str_choice: any;
  search_form: any;
  filter_class: any;
  cur_page: number;
  total_pages: number;
  favour_page: number;
  favour_total_pages: number;
  selected_class: any[] = [];
  class_list: any[];
  itemCount: number;
  itemCountOfFavor: number;
  active: number;
  list_kol_mall: any;
  isNewBrand: boolean = false;

  selectType: number = 1;
  searchGoodsName: string = '';
  isLoading: boolean = false;

  static $inject = [
    '$uibModalInstance',
    '$uibModal',
    'template_id',
    'mall_id',
    'collection_id',
    'dataService',
    'Notification',
    '$cookies',
  ];

  constructor(
    private $uibModalInstance: any,
    private $uibModal: any,
    private template_id: any,
    private mall_id: any,
    private collection_id: any,
    private dataService: IDataService,
    private Notification: INotificationService,
    private $cookies: ng.cookies.ICookiesService,
  ) {
    this.is_checked_all = false;
    this.is_checked_all_hot = false;
    this.is_add_items = []; //
    this.isNewBrand = this.$cookies.get('seller_privilege') === '30';
    // 获取已经选择过的。
    this.getIsHaveByTemplate();
  }

  // 初始化选中完成
  initOk() {
    this.list_cur = [];
    this.type = 2;
    this.list_choice = [];
    this.list_choice_hot = [];
    this.str_choice = '';
    this.selected_goods_list = [];
    this.list_item = [];
    this.search_form = {
      filter_class_id: [],
      keyword: '',
      class_id: [],
    };
    this.filter_class = [];
    this.cur_page = 1;
    this.total_pages = 1;
    this.favour_page = 1;
    this.favour_total_pages = 1;
    // this.hotGoods(2);// 分销
    // this.getSecondTabItemList();
    this.getAllItem(); // 获取商品
  }

  $onInit() {
    // const promises = [this.getClassList()];// [this.getClass2Tree()]
    // this.$q.all(promises).then(() => {
    //   console.log(this.class_list);
    //   this.search_form.class_id.length && forEach(this.search_form.class_id, c1 => {
    //     forEach(this.class_list, c2 => {
    //       if (c1 === c2.class_id) this.selected_class.push(c2)
    //       else forEach(c2.children, c3 => {
    //         if (c1 === c3.class_id) this.selected_class.push(c3)
    //         else forEach(c3.children, c4 => {
    //           if (c1 === c4.class_id) this.selected_class.push(c4)
    //         })
    //       })
    //     })
    //   })
    //   console.log(this.selected_class);
    //   this.search_form.class_id = this.selected_class.length && JSON.stringify(this.selected_class.map(o => o.class_id)) || undefined;
    // })
  }
  // ////////////////

  // if(this.cur_input !== ''){
  // this.list_cur = this.cur_input.split(",");
  // }
  // console.log('list_cur:',this.cur_input, this.list_cur)

  isInArray(arr, check) {
    if (!arr) {
      return false;
    }
    for (let i = 0; i < arr.length; i += 1) {
      if (Number(arr[i]) === Number(check)) {
        return true;
      }
    }
    return false;
  }

  getIsHaveByTemplate() {
    this.dataService
      .mall_template_templateItemIsAdd({
        template_id: this.template_id,
        mall_id: this.mall_id,
      })
      .then(res => {
        this.is_add_items = res.data.is_add_items;
        // this.is_add_items.push(226904);
        // console.log('is_add_items:',this.is_add_items)

        this.initOk();
      });
  }

  getIsHaveByMall() {
    this.initOk(); // 暂未实现过滤商品
  }

  selectedChangedAll(cur_type = 1) {
    let tmp_list = this.selected_goods_list;
    let check_type = this.is_checked_all;
    let choice_list = this.list_choice;

    if (Number(cur_type) === 0) {
      tmp_list = this.list_item;
      check_type = this.is_checked_all_hot;
      choice_list = this.list_choice_hot;
    }

    // if(!check_type){
    choice_list = [];
    // }
    for (let i = 0; i < tmp_list.length; i += 1) {
      if (!tmp_list[i].alreadyChecked) {
        tmp_list[i].isChecked = check_type;
        if (check_type) {
          choice_list.push(tmp_list[i].item_id);
        }
      }
    }

    if (Number(cur_type) === 0) {
      this.list_choice_hot = choice_list;
      this.list_item = tmp_list;
    } else {
      this.list_choice = choice_list;
      this.selected_goods_list = tmp_list;
    }

    this.updateSelected(cur_type);
  }

  clickGoods(good, cur_type = 1) {
    if (good.alreadyChecked) {
      return;
    }
    good.isChecked = !good.isChecked;
    this.selectedChanged(good, cur_type);
  }

  // tab切换
  changeTab_1(lists) {
    // tab切换
    this.type = 1;
    if (this.selected_goods_list) {
    }
  }
  changeTab_2(lists) {
    console.log('change 2');
    // tab切换
    this.type = 2;
    if (this.list_item) {
    }
  }

  hotGoods: (index) => ng.IPromise<any> = index =>
    this.dataService
      .item_getItemList({
        p: this.cur_page || undefined,
        item_insale: 2,
        page_size: 20,
        item_type: index,
        class_ids: '',
      })
      .then(res => {
        const tmp_list = res.data.data;
        this.list_item = [];
        for (let i = 0; i < tmp_list.length; i += 1) {
          if (this.is_add_items.indexOf(Number(tmp_list[i].item_id)) !== -1) {
            tmp_list[i].isChecked = true;
            tmp_list[i].alreadyChecked = true;
          } else {
            tmp_list[i].alreadyChecked = false;
          }

          if (
            this.list_choice_hot.indexOf(Number(tmp_list[i].item_id)) !== -1
          ) {
            tmp_list[i].isChecked = true;
          }

          if (!this.isInArray(this.list_cur, tmp_list[i].item_id)) {
            index === 2 && this.list_item.push(tmp_list[i]);
          }
        }
        this.itemCount = res.data.count;
        this.total_pages = Math.ceil(res.data.count / 20);
        this.list_page = [];
        for (let i = 1; i <= this.total_pages; i += 1) {
          this.list_page.push(i);
        }
        this.filter_class = _.filter(res.data.list_class, obj => {
          return obj['value'] !== '';
        });
      });

  // 点击搜索
  searchItem() {
    if (this.isLoading) {
      return false;
    }
    this.getAllItem();
  }

  // 选择商品类型
  selectGoodsType(type) {
    this.getAllItem();
  }

  // 取符合条件的所有商品
  getAllItem(curPage: number = 1): void {
    this.favour_page = curPage;
    this.isLoading = true;
    this.dataService
      .item_getItemList({
        p: curPage,
        item_insale: 2,
        item_type: this.selectType,
        page_size: 6,
        class_ids: '',
        keyword: this.searchGoodsName,
      })
      .then(res => {
        this.isLoading = false;
        this.selected_goods_list = this.getItemField(res.data.data);
        this.itemCountOfFavor = res.data.count;
        this.favour_total_pages = Math.ceil(res.data.count / 10);
        this.list_page_favour = [];

        for (let i = 0; i < this.selected_goods_list.length; i += 1) {
          if (
            this.is_add_items.indexOf(
              Number(this.selected_goods_list[i].item_id),
            ) !== -1
          ) {
            // this.selected_goods_list[i].isChecked = true;
            this.selected_goods_list[i].alreadyChecked = true;
          } else {
            this.selected_goods_list[i].alreadyChecked = false;
          }

          // if (this.list_choice.indexOf(Number(this.selected_goods_list[i].item_id)) != -1) {
          //   this.selected_goods_list[i].isChecked = true;
          // }
        }
      }, () => (this.isLoading = false));
  }
  getItemField(allItem: any[]) {
    const arrItem = [];
    const item = {};
    allItem.forEach((item, index) => {
      const {
        item_id,
        item_imgurl,
        item_name,
        item_insale,
        price_list,
        distribution_flag,
      } = item;
      const price = price_list && price_list[1] ? price_list[1].price : '--';
      arrItem.push({
        item_id,
        item_imgurl,
        item_name,
        item_insale,
        price,
        distribution_flag,
      });
    });
    console.log('arrItem====', arrItem);
    return arrItem;
  }
  getSecondTabItemList: () => ng.IPromise<any> = () => {
    // const fn = this.isNewBrand ? this.getDistributionItemList : this.materialFavorItemList
    return this.dataService
      .item_getItemList({
        p: this.favour_page || undefined,
        item_insale: 2,
        item_type: 3,
        page_size: 20,
        class_ids: '',
      })
      .then(res => {
        this.selected_goods_list = res.data.data; // this.isNewBrand ? res.data.data : res.data.list;
        this.itemCountOfFavor = res.data.count;
        this.favour_total_pages = Math.ceil(res.data.count / 20);
        this.list_page_favour = [];
        for (let i = 1; i <= this.favour_total_pages; i += 1) {
          this.list_page_favour.push(i);
        }

        for (let i = 0; i < this.selected_goods_list.length; i += 1) {
          if (
            this.is_add_items.indexOf(
              Number(this.selected_goods_list[i].item_id),
            ) !== -1
          ) {
            this.selected_goods_list[i].isChecked = true;
            this.selected_goods_list[i].alreadyChecked = true;
          } else {
            this.selected_goods_list[i].alreadyChecked = false;
          }

          if (
            this.list_choice.indexOf(
              Number(this.selected_goods_list[i].item_id),
            ) !== -1
          ) {
            this.selected_goods_list[i].isChecked = true;
          }
        }
      });
  };

  getDistributionItemList: () => ng.IPromise<any> = () =>
    this.dataService.item_getDistributionItemList({
      page: this.favour_page,
      page_size: 20,
    });

  // 选品库数据请求
  materialFavorItemList: () => ng.IPromise<any> = () =>
    this.dataService.data_api_materialFavorItemList({
      is_v2: 1,
      page: this.favour_page,
      page_size: 20,
    });

  // 显示选择品类的表
  // toSelectClass: () => ng.IPromise<any> = () => {
  //   const modalInstance = this.$uibModal.open({
  //     animation: true,
  //     size: 'sm',
  //     backdrop: 'static',
  //     template: require('../datacenter/modal-select-class.html'),
  //     controller: 'modalSelectClassController',
  //     controllerAs: 'vm',
  //     resolve: {
  //       // 获取选择的列表
  //       selected_class: () => this.selected_class,
  //       // 获取全部的列表
  //       class_list: () => this.class_list
  //     }
  //   })

  //   return modalInstance.result.then((new_selected_class: any[]) => {
  //     this.selected_class = new_selected_class;
  //     //      console.log(this.selected_class);
  //     this.search_form.filter_class_id = [];
  //     for (let i = 0; i < this.selected_class.length; i += 1) {
  //       this.search_form.filter_class_id.push(this.selected_class[i].class_id);
  //     }
  //     this.hotGoods(2);
  //   })
  // }

  // 在搜索中显示
  getSelectedClassName: () => string = () =>
    this.selected_class.map(o => o.class_name).join(',');

  getChildrenClassId: () => any = () => {
    const str = [];
    for (let i = 0; i < this.selected_class.length; i += 1) {
      if (this.selected_class[i].children) {
        if (this.selected_class[i].children[0].children) {
          str.push('1');
        } else {
          str.push('2');
        }
      } else {
        str.push('3');
      }
    }
    return str;
  };

  // 用于设置显示选中哪些商品
  selectedChanged(good, cur_type = 1) {
    const item_id = Number(good.item_id);
    let choice_list = this.list_choice;
    if (Number(cur_type) === 0) {
      choice_list = this.list_choice_hot;
    }
    if (good.isChecked) {
      choice_list.push(item_id);
    } else {
      // 从一维数据中移除元素，找不到哪个属性 @_@
      for (let i = 0; i < choice_list.length; i += 1) {
        if (choice_list[i] === item_id) {
          choice_list.splice(i, 1);
          break;
        }
      }
    }

    if (Number(cur_type) === 0) {
      this.list_choice_hot = choice_list;
    } else {
      this.list_choice = choice_list;
    }

    this.updateSelected(cur_type);
  }

  updateSelected(cur_type) {
    let choice_list = this.list_choice;
    if (Number(cur_type) === 0) {
      choice_list = this.list_choice_hot;
    }

    this.str_choice = '';
    for (let i = 0; i < choice_list.length; i += 1) {
      if (this.str_choice !== '') {
        this.str_choice += '、';
      }
      this.str_choice += choice_list[i];
    }

    if (Number(cur_type) === 0) {
      this.list_choice_hot = choice_list;
    } else {
      this.list_choice = choice_list;
    }
  }

  // 标识为已添加
  markItemAsAdded(id) {
    const index = this.selected_goods_list.findIndex(
      item => item.item_id === id,
    );
    if (index !== -1) {
      this.selected_goods_list[index].checking = false;
      this.selected_goods_list[index].alreadyChecked = true;
    }
  }

  markItemAsAdding(id) {
    const index = this.selected_goods_list.findIndex(
      item => item.item_id === id,
    );
    if (index !== -1) {
      this.selected_goods_list[index].checking = true;
      this.selected_goods_list[index].alreadyChecked = false;
    }
  }
  /**
   * 添加单个商品到文章
   * id: 商品ID
   * distributionFlag: 1-分销 0-自营
   */
  addCurItem(id, distributionFlag) {
    console.log(
      'this.distributionFlag',
      Number(distributionFlag) === 0 ? '自营' : '分销',
    );
    let type_template_add_item = 0;
    let type_mall_add_item = 0;
    if (this.mall_id > 0) {
      type_mall_add_item = 1;
    } else {
      type_template_add_item = 1;
    }

    if (id === '') {
      this.Notification.error('请选择商品');
      return;
    }

    this.markItemAsAdding(id);
    // 获取当前要同步的商城信息 wiki: http://wiki.seeapp.com/wiki/index.php/713%E5%95%86%E5%93%81%E7%AE%A1%E7%90%86
    if (Number(distributionFlag) === 0 || this.isNewBrand) {
      const choice_list =
        Number(distributionFlag) !== 0
          ? this.list_choice
          : this.list_choice_hot;
      console.log(choice_list, choice_list.length);

      const ids = id;
      const params = {
        ids,
        id: this.collection_id,
        article_id: this.mall_id,
      };

      return this.dataService
        .collection_collectionSet({
          collection_info: JSON.stringify(params),
        })
        .then(res => {
          this.markItemAsAdded(id);
          // this.Notification.success('添加商品成功！')
        });
    }
    return this.dataService
      .mall_template_getChoiceMall({
        template_id: this.template_id,
        mall_id: this.mall_id,
        add_exist_kol: 1,
      })
      .then(res => {
        const mall_list = res.data.list_mall;
        // 打开商品确认清单
        const choice_list = this.list_choice;

        this.dataService
          .mall_template_getChoiceItemList({
            is_set_one_item: 0,
            item_ids: JSON.stringify(choice_list),
            template_id: this.template_id,
            mall_id: this.mall_id,
            mall_list: JSON.stringify(mall_list),
          })
          .then(res => {
            this.list_item = res.data.item_list;
            this.list_kol_mall = res.data.kol_mall_list;

            _.forEach(this.list_kol_mall, v => {
              _.forEach(v.list_item, t => {
                t.ori_online_time_stmp = t.online_time;
                t.online_time = new Date(t.online_time * 1000);
                _.forEach(t.sku_list, s => {
                  s.release_time = new Date(s.release_time * 1000);
                });
                t.ori_online_time = new Date(t.ori_online_time * 1000);
              });
            });
            _.forEach(this.list_item, t => {
              t.ori_online_time_stmp = t.online_time;
              t.online_time = new Date(t.online_time * 1000);
              t.ori_online_time = new Date(t.ori_online_time * 1000);
            });
            _.forEach(this.list_kol_mall, kol_mall => {
              kol_mall.choice_item = [];
              // 格式化时间为时间戳
              _.forEach(kol_mall.list_item, kol_item => {
                kol_item.tmp_online_time = kol_item.online_time;
                kol_item.online_time = Date.parse(kol_item.online_time) / 1000;
                _.forEach(kol_item.sku_list, sku_info => {
                  sku_info.tmp_release_time = sku_info.release_time;
                  sku_info.release_time =
                    Date.parse(sku_info.release_time) / 1000;
                });
              });
            });
            this.dataService
              .mall_template_templateConfirmSync({
                template_id: this.template_id,
                mall_id: this.mall_id,
                item_list: JSON.stringify(this.list_item),
                kol_mall_list: JSON.stringify(this.list_kol_mall),
              })
              .then(res => {
                this.markItemAsAdded(id);
                // this.Notification.success('添加商品成功！')
              });
          });
      });
  }

  // 关闭弹出层
  cancel() {
    this.$uibModalInstance.dismiss(false);
  }

  // 提交
  /*
  ok() {
    console.log('this.type', this.type)
    let type_template_add_item = 0;
    let type_mall_add_item = 0;
    if (this.mall_id > 0) {
      type_mall_add_item = 1;
    } else {
      type_template_add_item = 1;
    }
    const from_params = {
      type_distribute: 0,
      type_template_add_item,
      type_template_item_set: 0,
      type_mall_add_item,
      type_mall_set_item: 0
    };
    // 获取当前要同步的商城信息 wiki: http://wiki.seeapp.com/wiki/index.php/713%E5%95%86%E5%93%81%E7%AE%A1%E7%90%86
    if (this.type == 1 || this.isNewBrand) {
      const choice_list = this.type != 1 ? this.list_choice : this.list_choice_hot
      console.log(choice_list, choice_list.length)

      let ids = '';
      for (let i = 0; i < choice_list.length; i += 1) {
        if (ids !== '') {
          ids += ',';
        }
        ids += Number(choice_list[i]);
      }


      const params = {
        id: this.collection_id,
        article_id: this.mall_id,
        ids,
      }
      if (ids === '') {
        this.Notification.error('请选择商品')
        return;
      }
      return this.dataService.collection_collectionSet({
        collection_info: JSON.stringify(params)
      }).then(res => {
        this.Notification.success('添加商品成功！')
        this.$uibModalInstance.close({});
      })


    } else {
      this.dataService.mall_template_getChoiceMall({
        template_id: this.template_id,
        mall_id: this.mall_id,
        add_exist_kol: 1,
      }).then(res => {
        const mall_list = res.data.list_mall
        //打开商品确认清单
        const cur_input = '';
        const choice_list = this.list_choice

        this.dataService.mall_template_getChoiceItemList({
          is_set_one_item: 0,
          item_ids: JSON.stringify(choice_list),
          template_id: this.template_id,
          mall_id: this.mall_id,
          mall_list: JSON.stringify(mall_list)
        }).then(res => {
          this.list_item = res.data.item_list;
          this.list_kol_mall = res.data.kol_mall_list;

          _.forEach(this.list_kol_mall, function(v) {
            _.forEach(v.list_item, function(t) {
              t.ori_online_time_stmp = t.online_time;
              t.online_time = new Date(t.online_time * 1000)
              _.forEach(t.sku_list, function(s) {
                s.release_time = new Date(s.release_time * 1000)
              })
              t.ori_online_time = new Date(t.ori_online_time * 1000)
            })
          })
          _.forEach(this.list_item, function(t) {
            t.ori_online_time_stmp = t.online_time;
            t.online_time = new Date(t.online_time * 1000)
            t.ori_online_time = new Date(t.ori_online_time * 1000)
          })
          _.forEach(this.list_kol_mall, function(kol_mall) {
            kol_mall.choice_item = [];
            //格式化时间为时间戳
            _.forEach(kol_mall.list_item, function(kol_item) {
              kol_item.tmp_online_time = kol_item.online_time;
              kol_item.online_time = Date.parse(kol_item.online_time) / 1000;
              _.forEach(kol_item.sku_list, function(sku_info) {
                sku_info.tmp_release_time = sku_info.release_time;
                sku_info.release_time = Date.parse(sku_info.release_time) / 1000;
              })
            })
          })
          this.dataService.mall_template_templateConfirmSync({
            template_id: this.template_id,
            mall_id: this.mall_id,
            item_list: JSON.stringify(this.list_item),
            kol_mall_list: JSON.stringify(this.list_kol_mall)
          }).then(res => {
            this.Notification.success('添加商品成功！')
            this.$uibModalInstance.close({});
            // this.$timeout(() => this.$window.location.reload(), 1000)
          })
        })
        // let modalInstance = this.$uibModal.open({
        //   animation: true,
        //   template: require('./modal-confirm-item-list.html'),
        //   controller: 'modalConfirmItemListController',
        //   controllerAs: 'vm',
        //   backdrop: 'static',
        //   size: 'lg',
        //   resolve: {
        //     from_params:() => from_params,
        //     is_set_one_item:()=>0,
        //     template_id:()=>this.template_id,
        //     mall_id:()=>this.mall_id,
        //     mall_list:() => mall_list,
        //     item_ids:()=>choice_list,
        //   },
        // })

      })
    }

  };



  private getClassList() {
    this.dataService.mall_mallClassChoice({}).then(res => {
      this.class_list = res.data.class_list;
    })
  }
  */
}
