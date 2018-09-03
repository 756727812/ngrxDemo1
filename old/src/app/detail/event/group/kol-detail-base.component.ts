import * as moment from 'moment';
import * as md5 from 'md5';;

export interface IKol {
  avatar?: string;
  wechat_name: string;
  wechat_id: string;
  wechat_desc?: string;
  kqi: number;
  influence: string;
}

export class KolDetailBaseController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService'];

  kol: IKol;
  wechatId: string;

  constructor(
    private $q: ng.IQService,
    private dataService: see.IDataService,
  ) {}

  $onInit(): void {
    this.$q.all([
      this.getKOLDetailBase(),
    ]);
  }

  private getKOLDetailBase: () => ng.IPromise<any> = () => {
    if (!this.wechatId) {
      return this.$q.reject();
    }
    return this.dataService.da_portrait_detail_base({
      wechat_id: this.wechatId,
      token: md5(`see${moment().format('YYYYMMDD')}${this.wechatId}`),
    }).then(res => {
      this.kol = res.data;
      return this.kol;
    });
  }
}

export const KolDetailBase: ng.IComponentOptions = {
  template: require('./kol-detail-base.template.html'),
  controller: KolDetailBaseController,
  bindings: {
    wechatId: '<',
  },
};
