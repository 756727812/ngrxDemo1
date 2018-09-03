import { IDataService } from '../../services/data-service/data-service.interface'
import { ISeeModalService } from '../../services/see-modal/see-modal.interface'
import * as _ from 'lodash';
import * as angular from 'angular'

export class modalDivideTemplateSettingController {
  mall_list: Array<any> //对应标签kol
  is_error: number
  static $inject = ['$uibModalInstance', '$routeParams', 'template_id', 'kol_ids', 'seeModal', '$uibModal', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private template_id: number,
    private kol_ids: any,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private dataService: IDataService
  ) {
    this.is_error = 0;
    this.get_choice_mall(this.template_id, this.kol_ids)
  }

  private get_choice_mall: (id, kols) => ng.IPromise<any> = (id, kols) =>
    this.dataService.mall_template_getChoiceMall({
      template_id: id || 0,
      mall_id: 0,
      kol_ids: kols
    }).then(res => {
      this.mall_list = res.data.list_mall
    })

  resetOption(id, pindex) {
    this.mall_list[pindex].kol_info.choice = false
    _.forEach(this.mall_list[pindex].list, function(v) {
      v.choice = v.mall_id == id ? id : false
      // v.kol_id == id && (v.is_checked = false)
    })
  }

  changeName() {
    this.is_error = 0;
  }

  resetName(index) {
    const ml = this.mall_list[index]
    ml.kol_info.choice = true
    _.forEach(ml.list, function(v) {
      v.choice = false
      // v.kol_id == id && (v.is_checked = false)
    })
  }

  popConfirm(mall_list) {
    const from_params = {
      type_distribute: 1,
      type_template_add_item: 0,
      type_template_item_set: 0,
      type_mall_add_item: 0,
      type_mall_set_item: 0
    };

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
        mall_id: () => 0,
        mall_list: () => mall_list,
        item_ids: () => [],
      },
    })
  }


  ok() {
    const map = this.mall_list
    const self = this;
    _.forEach(map, function(v) {
      if (v.kol_info.choice == true && v.kol_info.new_mall_name === '') {
        self.is_error = 1;
        return;
      }
    })
    if (this.is_error == 1) {
      return;
    }
    this.popConfirm(this.mall_list)
    this.$uibModalInstance.close(map)
  }

  cancel() {
    this.seeModal.confirm('确认提示', '确认要退出模板分配？', () => {
      this.$uibModalInstance.dismiss('cancel')
    })
  }

}

