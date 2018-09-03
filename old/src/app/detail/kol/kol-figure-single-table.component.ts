import { IDataService } from '../../services/data-service/data-service.interface';
import * as moment from 'moment';
import * as md5 from 'md5';;
import * as _ from 'lodash';;
import * as angular from 'angular';

export class kolFigureSingleTableController {
  kolId: string;
  flag: string;
  page: number;
  header: string;
  thead: any;
  tableParam: string;
  tableUrl: string;
  wechatId: string;
  items: any;
  isPercent: boolean;

  static $inject: string[] = ['$q', 'dataService'];
  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
  ) { }

  $onInit() {
    this.flag = this.flag ? this.flag : '1';
    this.items = {
      page: 1,
    };
    //要添加权限，在请求前先处理
    let promises = [];
    this.dataService.kol_mgr_checkUserPri({
      kol_id: this.kolId,
    }).then(res => {
      if (res.result == 1) {
        promises = [this.getKOLTableDetail()];
      }
    });
    return this.$q.all(promises);
  }

  getKOLTableDetail: (page?: number) => ng.IPromise<any> = (page = 1) =>
    this.dataService[this.tableUrl]({
      flag: this.flag,
      page,
      page_size: 10,
      type: this.tableParam,
      wechat_id: this.wechatId,
      token: md5(`see${moment().format('YYYYMMDD')}${page}10${this.tableParam}${this.wechatId}`),
    }).then(res => {
      const offset = (page - 1) * 10;
      _.forEach(res.data.list, (v, i) => {
        v.rank = offset + i + 1;
        if (this.isPercent) v.score *= 100;
        v.score = v.score.toFixed(2);
      });
      _.assign(this.items, res.data);
      return this.items;
    })

}

export const kolFigureSingleTable: ng.IComponentOptions = {
  template: require('./kol-figure-single-table.template.html'),
  controller: kolFigureSingleTableController,
  transclude: true,
  bindings: {
    header: '@',
    thead: '<',
    tableUrl: '@',
    tableParam: '@',
    flag: '<',
    kolId: '<',
    wechatId: '<',
    isPercent: '<',
  },
};
