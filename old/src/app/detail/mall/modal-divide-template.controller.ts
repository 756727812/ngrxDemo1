import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as angular from 'angular'

export class modalDivideTemplateController {
  total_items: number = 0 //选中kol数
  cur_tab_items: number = 0 //当前选中标签所含总kol数
  cur_tab_index: number = 0 //当前选中标签的序号
  cur_tab_select_items: number
  tab_list: Array<any>
  kol_list: Array<any>
  list_key: Array<any>
  item_list: Array<any> //对应标签kol
  selected_list: Array<any> = []//选中的kol
  isSlected: Array<any> = []//标签集合
  is_not_chocie: number
  kol_select: any

  static $inject = ['$uibModalInstance', '$routeParams', 'template_id', 'template_name', 'seeModal', '$uibModal', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private template_id: string,
    private template_name: string,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private dataService: IDataService
  ) {
    this.is_not_chocie = 0;
    this.get_choice_kol(this.template_id)
  }

  private get_choice_kol: (id: any) => ng.IPromise<any> = (id) =>
    this.dataService.mall_template_getChoiceKol({
      template_id: id || 0
    }).then(res => {
      this.tab_list = res.data.list_tab
      this.kol_list = res.data.list_kol
      this.list_key = res.data.list_kol
    })

  showKol(id, i, type) {
    $('.tab-list label').removeClass('text-primary')
    $('.tab-list').eq(i).find('label').addClass('text-primary')
    this.item_list = _.filter(this.kol_list, function(object) {
      // object.is_checked = false
      type != undefined && (object.tab_id == id && (object.is_checked = type))
      return object.tab_id == id
    })
    this.cur_tab_items = this.item_list.length
    this.cur_tab_index = <number>i
    this.cur_tab_select_items = 0
    if (type != undefined) {
      if (type) {
        // this.selected_list = _.concat(this.selected_list,this.item_list)
        this.uniqKol(this.selected_list, this.item_list)
        this.cur_tab_select_items = this.item_list.length
      } else {
        this.cur_tab_select_items = 0
        this.selected_list = _.filter(this.selected_list, function(object) {
          return object.tab_id != id
        })
      }
      this.total_items = this.selected_list.length
    }
  }
  selectKol(id, is) {
    this.is_not_chocie = 0;
    if (is) {
      this.selected_list.push(_.find(this.item_list, function(o) { return o.kol_id == id }))
      ++this.cur_tab_select_items
    } else {
      this.selected_list = _.reject(this.selected_list, function(o) { return o.kol_id == id })
      --this.cur_tab_select_items
    }
    this.total_items = this.selected_list.length
    //判断当前标签名单是否全选
    this.isSlected[this.cur_tab_index] = (this.cur_tab_select_items == this.cur_tab_items) ? true : false
  }
  deleteKol(id) {
    this.selected_list = _.reject(this.selected_list, function(o) { return o.kol_id == id })
    // this.item_list
    _.forEach(this.kol_list, function(v) {
      v.kol_id == id && (v.is_checked = false)
    })

    this.total_items = this.selected_list.length
  }
  //kol名单对象数组去重操作
  uniqKol(selected, item) {
    const sel = _.map(selected, 'kol_id')
    item.forEach((val, index) => {
      _.includes(sel, val.kol_id) || this.selected_list.push(val)
    })

  }
  formSelectKol(id) {
    for (let i = 0; i < this.selected_list.length; i++) {
      this.selected_list[i].is_checked = true;
    }
    this.total_items = this.selected_list.length;
  }
  formDeleteKol(x, y) {
    // _.forEach(this.item_list,function(v){
    //  v.kol_id == id && (v.is_checked = false)
    // })
    // for(var s = 0;s<this.item_list.length;s++){
    //   for(var i = 0;i<this.selected_list.length;i++){
    //     this.item_list[s].kol_id == this.selected_list[i].kol_id ? this.item_list[s].is_checked = false : '';
    //   }
    // }
    //      console.log(x)
    //      console.log(y)
    this.total_items = this.selected_list.length;
  }
  ok() {
    if (this.selected_list.length == 0) {
      this.is_not_chocie = 1;
      return;
    }
    const map = _.map(this.selected_list, 'kol_id')
    const p = JSON.stringify(map)
    this.divideTemplateSetting(this.template_id, p);
    this.$uibModalInstance.close(map);
  }

  //模板分配--多商城设置
  divideTemplateSetting: (id, param) => any = (id, param) => {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-divide-template-setting.html'),
      controller: 'modalDivideTemplateSettingController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        template_id: () => id,
        kol_ids: () => param
      }
    })
    return modalInstance.result.then(params => {

    })
  }

  cancel() {
    this.seeModal.confirm('确认提示', '确认要退出模板分配？', () => {
      this.$uibModalInstance.dismiss('cancel')
    })
  }

}

