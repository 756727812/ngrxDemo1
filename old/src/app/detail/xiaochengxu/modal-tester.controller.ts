import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import * as angular from 'angular';
import * as _ from 'lodash';;

export class modalTesterController {
  static $inject = ['$uibModalInstance', '$q', '$routeParams', 'authorizer_appid', 'dataService', 'seeModal'];

  list: Array<any>;
  index: number;

  static open = (authorizer_appid) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      template: require('./modal-tester.html'),
      controller: modalTesterController,
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        authorizer_appid: () => authorizer_appid,
      },
    });
  }

  constructor(
    private $uibModalInstance: any,
    private $q: ng.IQService,
    private $routeParams: any,
    private authorizer_appid: string,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
  ) {
    this.index = 0;
    this.list = [];

    let promises: ng.IPromise<any>[];
    promises = [this.weixin_getBindList()];
    this.$q.all(promises);
  }

  weixin_getBindList() {
    return this.dataService.weixin_getBindList({
      authorizer_appid: this.authorizer_appid,
    }).then(res => {
      this.list = res.data.list;
      this.index = 0;

      _.forEach(this.list, (v, i) => {
        this.list[i].index = this.index++;
      });

    });
  }

  deleteTester(wechatid) {
    this.seeModal.confirm('确认提示', '确认要删除该体验者', () => {
      return this.weixin_unBindTester(wechatid);
    },                    () => {

    });
  }

  weixin_bindTester(wechatid) {
    this.dataService.weixin_bindTester({
      authorizer_appid: this.authorizer_appid,
      wechatid,
    }).then(res => {
      return this.weixin_getBindList();
    });
  }

  weixin_unBindTester(wechatid) {
    return this.dataService.weixin_unBindTester({
      authorizer_appid: this.authorizer_appid,
      wechatid,
    }).then(res => {
      return this.dataService.weixin_deleteTester({
        authorizer_appid: this.authorizer_appid,
        wechatid,
      }).then(res => {
        return this.weixin_getBindList();
      });
    });
  }

  newBind() {
    this.index++;
    this.list.push(
      {
        id: '0',
        authorizer_appid: this.authorizer_appid,
        wechatid: '',
        status: '0',
      },
    );
  }

  ok() {
    this.$uibModalInstance.close({});
  }


  cancel() {
    this.$uibModalInstance.close({});
  }

}


