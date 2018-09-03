import * as angular from 'angular';
import { modalEditServiceController } from '../../../xiaochengxu/modal-edit-service.controller';
import { modalEditInfoController } from '../../../xiaochengxu/modal-edit-info.controller';
import { modalTesterController } from '../../../xiaochengxu/modal-tester.controller';
import { modalEditLogoController } from '../../../xiaochengxu/modal-edit-logo.controller';
import { modalViewQrcController } from '../../../xiaochengxu/modal-view-qrc.controller';
import { pick } from 'lodash';
import { Controller as ModalInfoConfigCtrl } from './info-config/dialog.component';
// import { Controller as OneKeyCtrl } from './one-key.component';
import { Controller as QrCtrl } from './qr.component';
import { NzModalService } from 'ng-zorro-antd';
import { ModalOneKeyComponent } from '../../../goods/modal/modal-one-key.component';

import './list.less';
import { catchError } from 'rxjs/operators';

const SUBMIT_STATUS_CN_MAP = {
  ONLINE: '已上线',
};
const SUBMIT_STATUS_MAP = {
  '-2': '全部',
  '-1': '待上传代码（首次）',
  3: '已上传代码',
  0: '审核成功',
  1: '审核失败',
  2: '审核中',
  4: SUBMIT_STATUS_CN_MAP.ONLINE,
};

const SUBMIT_STATUS_OPTIONS = [-2, -1, 3, 2, 0, 1, 4].map(id => ({
  id,
  name: SUBMIT_STATUS_MAP[id],
}));

export class Controller {
  static $inject: string[] = [
    '$q',
    '$routeParams',
    '$location',
    'dataService',
    'Notification',
    'seeModal',
    '$uibModal',
    'NzModalService',
  ];

  pageData = {
    page: 1,
    list: [],
    pageSize: 20,
    count: 0,
    totalPageNum: 0,
  };
  page: string;
  total_items: number;
  frame_url: string;

  template_list: [any];
  reset_info: any;
  release_info: any;
  filter = {
    submit_status: SUBMIT_STATUS_OPTIONS[0],
    keyword: '',
  };
  submitStatusOptions = SUBMIT_STATUS_OPTIONS;
  _hackCanSearch: any;
  cancelProgress: boolean = false;

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private seeModal: see.ISeeModalService,
    private $uibModal: any,
    private modalService: NzModalService,
  ) {
    this.pageData.page = $routeParams['page'] || '1';

    let promises: ng.IPromise<any>[];
    promises = [this.weixin_getList()];
    this.$q.all(promises);
  }

  $onInit() {
    setTimeout(() => {
      this.filter = {
        submit_status: SUBMIT_STATUS_OPTIONS[0],
        keyword: '',
      };
      this._hackCanSearch = true;
      // tslint:disable-next-line:align
    }, 1);
  }

  canItemSubmit(item) {
    // tslint:disable-next-line:triple-equals
    return item.submit_status == 3;
  }

  toOnePress() {
    const modal = this.modalService.open({
      title: '一键操作',
      content: ModalOneKeyComponent,
      footer: false,
      maskClosable: false,
      width: 600,
      componentParams: {},
    });
    modal.subscribe(result => {
      if (result && result.hasUpdated) {
        console.log('done........');
        this.weixin_getList();
      }
      if (result && result.filterKol) {
        console.log('name===', result.name);
        this.filter = {
          submit_status: SUBMIT_STATUS_OPTIONS[0],
          keyword: result.name,
        };
        modal.destroy('onOk');
        this.search();
      }
    });
    // OneKeyCtrl.open().result.then(result => {
    //   if (result && result.hasUpdated) {
    //     this.weixin_getList();
    //   }
    // });
  }

  changeApplyOpen(id, btn_apply_open) {
    const _btn_apply_open = btn_apply_open === '0' ? 1 : 0;
    return this.dataService
      .xiaodianpu_updateBtnApply({
        id,
        btn_apply_open: _btn_apply_open,
      })
      .then(res => {
        this.Notification.success('修改配置成功');
        return this.weixin_getList();
      });
  }

  changeSearchOpen(id, btn_search_open) {
    const _btn_search_open = btn_search_open === '0' ? 1 : 0;
    return this.dataService
      .xiaodianpu_updateBtnSearch({
        id,
        open: _btn_search_open,
      })
      .then(res => {
        this.Notification.success('修改配置成功');
        return this.weixin_getList();
      });
  }

  setDomain(authorizer_appid) {
    this.seeModal.confirm(
      '确认提示',
      '配置后你可立即上传代码获得体验二维码，确认配置？',
      () => {
        return this.dataService
          .weixin_setDomain({
            authorizer_appid,
          })
          .then(res => {
            this.Notification.success('配置服务器成功');
            return this.weixin_getList();
          });
      },
    );
  }

  codeSubmitViewBatch() {
    this.seeModal.confirm('确认提示', this.reset_info.tips, () => {
      return this.dataService.weixin_codeSubmitViewBatch({}).then(res => {
        this.Notification.success('一键刷新成功');
        return this.weixin_getList();
      });
    });
  }

  codeReleateBatch() {
    this.seeModal.confirm('确认提示', this.release_info.tips, () => {
      return this.dataService.weixin_codeReleateBatch({}).then(res => {
        this.Notification.success('一键发布成功');
        return this.weixin_getList();
      });
    });
  }

  codeSubmit(item) {
    this.seeModal.confirm('确认提示', item.str_submit || '确认进行提审', () => {
      return this.dataService
        .weixin_codeSubmit({
          authorizer_appid: item.authorizer_appid,
        })
        .then(res => {
          this.Notification.success('提审审核成功');
          return this.weixin_getList();
        });
    });
  }

  codeRollback(item) {
    const { version_online } = item;
    const desc = `确认将以下代码回滚吗?
    <br/>模板ID: ${version_online.template_id || ''}
    <br/>版本号: ${version_online.user_version || ''}
    <br/>描述: ${version_online.user_desc || ''}`;

    this.seeModal.confirm('确认提示', desc, () => {
      return this.dataService
        .weixin_codeRollbackBatch({ xiaodianpuIds: item.id })
        .then(res => {
          const patchId = res.data;
          this.Notification.warn('正在处理, 请稍后...', 4000);
          setTimeout(() => {
            this.getBatchResult(patchId, item.id);
          }, 2000);

          // this.Notification.success('代码回滚成功');
          // return this.weixin_getList();
        });
    });
  }

  // handleProcess(patchId,xdpId){
  //   const modal = this.seeModal.confirm('确认提示', "正在处理, 请稍后...");
  //   //this.seeModal.
  //   setTimeout(()=>{
  //     this.getBatchResult(patchId,xdpId);
  //   },2000)
  // }

  // 批量操作当前进度
  //
  getBatchResult(batchId, xdpId) {
    if (!batchId) {
      return this.Notification.error('操作失败, 无法获取批量操作ID.', 4000);
    }

    if (this.cancelProgress) {
      return; // 不再查询进度
    }
    // const status = { '1': '成功', '0': '失败', '-1': '进行中' };
    // 数据格式: "data":{"209":"0_SEE小店铺测试", '208':"1_店铺名字"}
    this.dataService.weixin_BatchProgress({ batchId }).then(res => {
      const data = res.data;
      console.log('data====', data);
      const status_name = data[xdpId];
      if (!status_name) {
        return this.Notification.error('当前操作无数据.' + res.data, 4000);
      }
      const arrValue = status_name.split('_');
      const curStatus = status[arrValue[0]];
      if (curStatus === '-1') {
        setTimeout(() => {
          this.getBatchResult(batchId, xdpId);
        }, 3000);
      } else if (curStatus === '1') {
        this.Notification.success('回滚代码成功');
        return this.weixin_getList();
      } else {
        this.Notification.error('回滚代码失败', 4000);
      }
    });
  }

  codeSubmitView(item) {
    this.dataService
      .weixin_codeSubmitView({
        authorizer_appid: item.authorizer_appid,
      })
      .then(res => {
        this.Notification.success('刷新审核状态成功');
        this.weixin_getList();
      });
  }

  codeReleate(item) {
    this.seeModal.confirm('确认提示', '确认要发布当前审核通过的版本？', () => {
      this.dataService
        .weixin_codeReleate({
          authorizer_appid: item.authorizer_appid,
        })
        .then(res => {
          this.Notification.success('发布成功');
          this.weixin_getList();
        });
    });
  }

  resestAudit(item) {
    this.seeModal.confirm(
      '确认提示',
      '确认要重置审核状态？重置后你需要重新上传代码审核。',
      () => {
        this.dataService
          .weixin_resestAudit({
            authorizer_appid: item.authorizer_appid,
          })
          .then(res => {
            this.Notification.success('重置成功');
            this.weixin_getList();
          });
      },
    );
  }

  codePost(item) {
    this.seeModal.confirm('确认提示', '确认要上传代码？', () => {
      return this.dataService
        .weixin_codePost({
          authorizer_appid: item.authorizer_appid,
        })
        .then(res => {
          this.Notification.success('上传代码成功');
          return this.weixin_getList();
        });
    });
  }

  managerTester(authorizer_appid) {
    modalTesterController.open(authorizer_appid);
  }

  openInfoConfig(item) {
    ModalInfoConfigCtrl.open(item) //
      .result.then(
        result => result && result.hasUpdated && this.weixin_getList(),
      );
  }

  managerLogo(info) {
    const modalInstance = modalEditLogoController.open(info);
    return modalInstance.result.then(params => {
      const param = {
        json_config: JSON.stringify(params.info.json_config),
        id: params.info.id,
      };
      this.dataService.weixin_updateJsonConfig(param).then(res => {
        this.Notification.success('Logo配置成功');
        this.weixin_getList();
      });
    });
  }

  editService(info) {
    const modalInstance = modalEditServiceController.open(info);
    return modalInstance.result.then(params => {
      const param = {
        service_config: JSON.stringify(params.info.service_config),
        id: params.info.id,
      };
      this.dataService.weixin_updateServiceConfig(param).then(res => {
        this.Notification.success('客服配置成功');
        this.weixin_getList();
      });
    });
  }

  viewQrc(authorizer_appid, url) {
    modalViewQrcController.open(authorizer_appid, url);
  }

  toViewQrc(item) {
    QrCtrl.open(item);
  }

  editInfo(item) {
    const info = pick(item, [
      'id',
      'app_id',
      'app_secret',
      'mch_id',
      'mch_sign_key',
      'app_title',
      'collection_id',
    ]);
    const modalInstance = modalEditInfoController.open(info);
    return modalInstance.result.then(
      params => {
        const param = {
          info: JSON.stringify(params.info),
          id: params.info.id,
        };
        this.dataService.weixin_updateInfo(param).then(res => {
          this.Notification.success('补充资料成功');
          this.weixin_getList();
        });
      },
      () => {},
    );
  }

  search() {
    if (!this._hackCanSearch) {
      return;
    }
    // TODO ng-if hash ==1 渲染后，初始化不会更改 this.filter.submit_status
    // 导致触发这里的搜索，不知道为啥
    Object.assign(this.pageData, {
      page: 1,
    });
    this.weixin_getList();
  }

  getSubmitStatusCn(item) {
    /*
    老的 -1 包含了 -1 和 -4
    为了兼容老的「已上线」
    (-1 || 4) && version_online !=false
    version_online 只要是成功上线过一次，就一直 true

    新的 -1 表示首次待上传
    */
    const { submit_status, version_online } = item;
    if ((submit_status === -1 || submit_status === 4) && version_online) {
      return SUBMIT_STATUS_CN_MAP.ONLINE;
    }
    return SUBMIT_STATUS_MAP[item.submit_status];
  }

  private weixin_getList() {
    return this.dataService
      .weixin_getList({
        page: this.pageData.page,
        page_size: this.pageData.pageSize,
        submit_status: this.filter.submit_status.id,
        keyword: this.filter.keyword,
      })
      .then(res => {
        this.pageData.count = res.data.count;
        this.pageData.list = res.data.list;
        this.pageData.totalPageNum = Math.ceil(
          res.data.count / this.pageData.pageSize,
        );
        this.frame_url = res.data.frame_url;
        this.reset_info = res.data.reset_info;
        this.release_info = res.data.release_info;
        return;
      });
  }
}

export const xcxCodeAuthList: ng.IComponentOptions = {
  template: require('./list.template.html'),
  controller: Controller,
};
