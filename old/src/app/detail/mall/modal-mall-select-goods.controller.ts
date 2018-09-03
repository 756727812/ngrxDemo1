/**
 * 待付款订单tab下的修改实付金额模态框
 */
import { IDataService } from '../../services/data-service/data-service.interface'
import * as md5 from 'md5';
import * as _ from 'lodash';
import { forEach } from 'lodash'

export class mallSelectGoodsController {
  is_checked_all: any
  is_add_items: Array<any>
  list_cur: Array<any>
  list_choice: Array<any>
  selected_goods_list: Array<any>
  list_item: Array<any>
  list_page: Array<any>
  list_page_favour: Array<any>
  type: any
  str_choice: any
  search_form: any
  filter_class: any
  cur_page: number
  total_pages: number
  favour_page: number
  favour_total_pages: number
  selected_class: Array<any> = []
  class_list: Array<any>
  static $inject = ['$uibModalInstance', '$uibModal', 'template_id', 'mall_id', 'collection_id', 'params', 'dataService', '$routeParams', '$q']
  constructor(
    private $uibModalInstance: any,
    private $uibModal: any,
    private template_id: any,
    private mall_id: any,
    private collection_id: any,
    private params: any,
    private dataService: IDataService,
    private $routeParams: any,
    private $q: ng.IQService,
  ) {
    this.is_checked_all = false;
    this.is_add_items = [];//
    //获取已经选择过的。
    this.getIsHaveByTemplate();
  }

  //初始化选中完成
  initOk() {
    this.list_cur = []
    this.type = 1
    this.list_choice = []
    this.str_choice = ''
    this.selected_goods_list = []
    this.list_item = []
    this.search_form = {
      filter_class_id: [],
      keyword: '',
      class_id: []
    }
    this.filter_class = []
    this.cur_page = 1
    this.total_pages = 1
    this.favour_page = 1;
    this.favour_total_pages = 1;
    this.hotGoods();
    this.materialFavorItemList();
  }


  $onInit() {
    const promises = [this.getClassList()];//[this.getClass2Tree()]
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
    for (let i = 0; i < arr.length; i++) {
      if (Number(arr[i]) == Number(check)) {
        return true;
      }
    }
    return false;
  }


  getIsHaveByTemplate() {
    this.dataService.mall_template_templateItemIsAdd({
      template_id: this.template_id,
      mall_id: this.mall_id
    }).then(res => {
      this.is_add_items = res.data.is_add_items;
      // this.is_add_items.push(226904);
      // console.log('is_add_items:',this.is_add_items)

      this.initOk();
    })
  }

  getIsHaveByMall() {
    this.initOk();//暂未实现过滤商品
  }


  selectedChangedAll() {
    if (!this.is_checked_all) {
      this.list_choice = [];
    }
    for (let i = 0; i < this.selected_goods_list.length; i++) {
      if (!this.selected_goods_list[i].alreadyChecked) {
        this.selected_goods_list[i].isChecked = this.is_checked_all;
        if (this.is_checked_all) {
          this.list_choice.push(this.selected_goods_list[i].item_id)
        }
      }
    }
  }

  clickGoods(good) {
    if (good.alreadyChecked) {
      return;
    }
    good.isChecked = !good.isChecked
    this.selectedChanged(good)
  }

  // tab切换
  changeTab_1(lists) {
    // tab切换
    this.type == 1
    if (this.selected_goods_list) {
      // for(var i = 0; i< this.selected_goods_list.length; i++){
      //   if(!this.selected_goods_list[i].alreadyChecked){
      //     this.selected_goods_list[i].isChecked = false;
      //   }
      // }
    }
  }
  changeTab_2(lists) {
    console.log('change 2');
    // tab切换
    this.type == 2
    if (this.list_item) {
      // for(var i = 0; i< this.list_item.length; i++){
      //   if(!this.list_item[i].alreadyChecked){
      //     this.list_item[i].isChecked = false;
      //   }
      // }
    }
  }


  hotGoods: () => ng.IPromise<any> = () =>
    this.dataService.data_api_materialSelectItem({
      filter_class_id: this.search_form.filter_class_id.length > 0 ? JSON.stringify(this.search_form.filter_class_id) : '',
      keyword: this.search_form.keyword || '',
      page: this.cur_page || undefined
    }).then(res => {
      const tmp_list = res.data.list_item
      this.list_item = []
      for (let i = 0; i < tmp_list.length; i++) {
        if (this.is_add_items.indexOf(Number(tmp_list[i].item_id)) != -1) {
          tmp_list[i].isChecked = true;
          tmp_list[i].alreadyChecked = true;
        } else {
          tmp_list[i].alreadyChecked = false;
        }

        if (this.list_choice.indexOf(Number(tmp_list[i].item_id)) != -1) {
          tmp_list[i].isChecked = true;
        }

        if (!this.isInArray(this.list_cur, tmp_list[i].item_id)) {
          this.list_item.push(tmp_list[i]);
        }
      }
      this.total_pages = Math.ceil(res.data.count_item / 20)
      this.list_page = [];
      for (let i = 1; i <= this.total_pages; i++) {
        this.list_page.push(i);
      }
      this.filter_class = _.filter(res.data.list_class, function(obj) {
        return obj['value'] != ""
      })
    })

  // 选品库数据请求
  materialFavorItemList: () => ng.IPromise<any> = () =>
    this.dataService.data_api_materialFavorItemList({ is_v2: 1, page: this.favour_page, page_size: 20 }).then(res => {
      this.selected_goods_list = res.data.list;
      this.favour_total_pages = Math.ceil(res.data.count / 20)
      this.list_page_favour = [];
      for (let i = 1; i <= this.favour_total_pages; i++) {
        this.list_page_favour.push(i);
      }

      for (let i = 0; i < this.selected_goods_list.length; i++) {
        if (this.is_add_items.indexOf(Number(this.selected_goods_list[i].item_id)) != -1) {
          this.selected_goods_list[i].isChecked = true;
          this.selected_goods_list[i].alreadyChecked = true;
        } else {
          this.selected_goods_list[i].alreadyChecked = false;
        }

        if (this.list_choice.indexOf(Number(this.selected_goods_list[i].item_id)) != -1) {
          this.selected_goods_list[i].isChecked = true;
        }
      }
    })

  // 显示选择品类的表
  toSelectClass: () => ng.IPromise<any> = () => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      size: 'sm',
      backdrop: 'static',
      template: require('../datacenter/modal-select-class.html'),
      controller: 'modalSelectClassController',
      controllerAs: 'vm',
      resolve: {
        // 获取选择的列表
        selected_class: () => this.selected_class,
        // 获取全部的列表
        class_list: () => this.class_list
      }
    })

    return modalInstance.result.then((new_selected_class: any[]) => {
      this.selected_class = new_selected_class;
      //      console.log(this.selected_class);
      this.search_form.filter_class_id = [];
      for (let i = 0; i < this.selected_class.length; i++) {
        this.search_form.filter_class_id.push(this.selected_class[i].class_id);
      }
      this.hotGoods();
    })
  }

  // 在搜索中显示
  getSelectedClassName: () => string = () => this.selected_class.map(o => o.class_name).join(',')

  getChildrenClassId: () => any = () => {
    const str = [];
    for (let i = 0; i < this.selected_class.length; i++) {
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
  }

  private getClassList() {
    this.dataService.mall_mallClassChoice({}).then(res => {
      this.class_list = res.data.class_list;
    })
  }
  /*
  private getClass2Tree: () => ng.IPromise<any> = () =>
    this.dataService.item_class2List({
      only_on: 1,
      get_all: 1,
    }).then(res => {
      const data = res.data;
      let classList = [], length = data.length, temp = {}, i, j, k;
      forEach(data, o => {
        o.parent_id === '0' && classList.push(Object.assign(o, { children: [] }))
      })
      const cllength = classList.length;
      for (i = 0; i < length; i++) {
        if (data[i].parent_id === '0') continue;
        for (j = 0; j < cllength; j++) {
          if (data[i].parent_id == classList[j].class_id) {
            classList[j].children.push(Object.assign(data[i], { children: [] }));
            break;
          }
        }
      }
      let flag = true;

      for (i = 0; i < length; i++) {
        if (~data[i].class_path.indexOf(',')) {
          flag = true;
          for (j = 0; j < cllength; j++) {
            if (!flag) break;
            const templ = classList[j].children.length;
            for (k = 0; k < templ; k++) {
              if (classList[j].children[k].class_id == data[i].parent_id) {
                classList[j].children[k].children.push(data[i]);
                flag = false;
                break;
              }
            }
          }
        }
      }
      this.class_list = classList
    })
  */

  // 用于设置显示选中哪些商品
  selectedChanged(good) {
    const item_id = Number(good.item_id);
    if (good.isChecked) {
      this.list_choice.push(item_id)
    } else {
      //从一维数据中移除元素，找不到哪个属性 @_@
      for (let i = 0; i < this.list_choice.length; i++) {
        if (this.list_choice[i] == item_id) {
          this.list_choice.splice(i, 1);
          break;
        }
      }
    }

    this.str_choice = '';
    for (let i = 0; i < this.list_choice.length; i++) {
      if (this.str_choice !== '') {
        this.str_choice += '、';
      }
      this.str_choice += this.list_choice[i];
    }
  }

  // 提交
  ok() {
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
    //获取当前要同步的商城信息
    this.dataService.mall_template_getChoiceMall({
      template_id: this.template_id,
      mall_id: this.mall_id,
      add_exist_kol: 1,
    }).then(res => {
      const mall_list = res.data.list_mall
      //打开商品确认清单
      const cur_input = '';
      const modalInstance = this.$uibModal.open({
        animation: true,
        template: require('./modal-confirm-item-list.html'),
        controller: 'modalConfirmItemListController',
        controllerAs: 'vm',
        backdrop: 'static',
        size: 'lg',
        resolve: {
          from_params: () => from_params,
          is_set_one_item: () => 0,
          template_id: () => this.template_id,
          mall_id: () => this.mall_id,
          mall_list: () => mall_list,
          item_ids: () => this.list_choice,
        },
      })

      this.$uibModalInstance.close({});

    })

  };

  // 取消
  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  };

}
