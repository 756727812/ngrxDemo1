import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

export class modalAnnouncementController {
  form_data: any;
  remain_count: number;
  notice_info: any;
  tips_error: string;
  total_items: number;
  selected_list: Array<any> = [];

  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'cur_notice_info', 'list_c2c', 'list_country', 'dataService'];
  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private cur_notice_info: any,
    private list_c2c: any,
    private list_country: any,
    private dataService: IDataService,
  ) {
    this.total_items = 0;
    this.tips_error = '';
    this.notice_info = angular.copy(this.cur_notice_info);
    if (this.notice_info.limit_location === '所有') {
      this.notice_info.limit_location = '';
    }
    if (this.notice_info.start_time > 0) {
      this.notice_info.start_time = new Date(this.notice_info.start_time * 1000);
    }
    if (this.notice_info.end_time > 0) {
      this.notice_info.end_time = new Date(this.notice_info.end_time * 1000);
    }

    const self = this;
    self.selected_list = [];
    _.forEach(self.notice_info.arr_seller_id, function (v) {
      _.forEach(self.list_c2c, function (c2c) {
        if (Number(c2c.seller_id) == Number(v)) {
          self.selected_list.push(c2c);
        }
      });
    });

    /*
    var max_text = 150;

    $scope.formData = {
      date_picker: {
        startDate: '',
        endDate: ''
      }
    }
    $scope.remain_count = max_text;
    
    $scope.$watch('notice_info.content', function (newVal, oldVal) {
      var limit = max_text;
      if (newVal && newVal != oldVal) {
        $scope.remain_count = limit - newVal.length;
        if (newVal.length >= limit) {
          $scope.remain_count = 0
          $scope.notice_info.content = newVal.substr(0, limit);
        }
      } else {
        $scope.remain_count = limit;
      }
    })*/
  }

  deleteC2C(x, y) {
    this.total_items = this.selected_list.length;
    this.changeToLimitBackendId();
  }

  formSelectC2C() {
    for (let i = 0; i < this.selected_list.length; i++) {
      this.selected_list[i].is_checked = true;
    }
    this.total_items = this.selected_list.length;
    this.changeToLimitBackendId();
  }

  changeToLimitBackendId() {
    this.notice_info.limit_seller_id = '';
    if (this.selected_list.length == 0) {
      return;
    }
    let limit_seller_id = '';
    _.forEach(this.selected_list, function (v) {
      if (limit_seller_id !== '') {
        limit_seller_id += ',';
      }
      limit_seller_id += v.seller_id;
    });
    this.notice_info.limit_seller_id = limit_seller_id;
  }

  ok: () => void = () => {
    let limit_location = this.notice_info.limit_location;
    if (limit_location === '' || limit_location == null) {
      limit_location = '';
    }
    if (limit_location === '所有') {
      limit_location = '';
    }

    const start_time = Math.floor(+this.notice_info.start_time / 1000);
    const end_time = Math.floor(+this.notice_info.end_time / 1000);
    if (end_time < start_time) {
      this.tips_error = '结束时间不能小于开始时间';
      return;
    }

    const param = {
      notice_info: JSON.stringify({
        id: this.notice_info.id,
        title: this.notice_info.title,
        content: this.notice_info.content,
        limit_location,
        limit_class: '',
        limit_device: this.notice_info.limit_device,
        start_time,
        end_time,
        limit_seller_id: this.notice_info.limit_seller_id,

      }),
    };

    if (this.notice_info.id === '0') {
      this.dataService.item_notice_noticeAdd(param).then(res => {
        this.$uibModalInstance.close(this.notice_info);
      });
    } else {
      this.dataService.item_notice_noticeSet(param).then(res => {
        this.$uibModalInstance.close(this.notice_info);
      });
    }

  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

