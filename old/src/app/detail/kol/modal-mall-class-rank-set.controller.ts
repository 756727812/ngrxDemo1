import { IDataService } from '../../services/data-service/data-service.interface'
import * as angular from 'angular'

export class mallClassRankSetController {
  private
  set_info: any

  static $inject = ['$uibModalInstance', '$routeParams', 'collection_id', 'dataService']
  constructor(
    private $uibModalInstance: any,
    private $routeParams: any,
    private collection_id: number,
    private dataService: IDataService
  ) {
    collection_id && this.mallClassGetListWithArticle()
  }

  changePos() {
    //冒泡排序
    var list = angular.copy(this.set_info.list);
    for (var i = 0; i < list.length; i++) {
      for (var j = 1; j < list.length - i; j++) {
        var tmp_i = list[j - 1], tmp_j = list[j];
        if (Number(tmp_j.rank) > Number(tmp_i.rank)
          || (
            Number(tmp_i.rank) == Number(tmp_j.rank)
            && Number(tmp_j.mall_class_id) > Number(tmp_i.mall_class_id)
          )
        ) {
          list[j - 1] = tmp_j;
          list[j] = tmp_i;
        }
      }
    }
    for (var i = 0; i < list.length; i++) {
      list[i].pos = i + 1;
    }

    for (var i = 0; i < this.set_info.list.length; i++) {
      for (var j = 0; j < list.length; j++) {
        if (Number(this.set_info.list[i].mall_class_id) == Number(list[j].mall_class_id)) {
          this.set_info.list[i].pos = list[j].pos;
          break;
        }
      }
    }
  }


  ok() {
    this.mallClassSetRank();
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel')
  }

  private mallClassGetListWithArticle() {
    this.dataService.mall_mallClassGetListWithArticle({
      collection_id: this.collection_id
    }).then(res => {
      this.set_info = res.data;
      this.changePos();
    })
  }

  private mallClassSetRank() {
    this.dataService.mall_mallClassSetRank({
      set_info: JSON.stringify(this.set_info)
    }).then(res => {
      this.$uibModalInstance.close({});
    })
  }

}

