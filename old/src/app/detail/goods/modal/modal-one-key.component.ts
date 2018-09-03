import { Component, OnInit, OnDestroy } from '@angular/core';
import { result, isEmpty } from 'lodash';
import { _HttpClient } from '@shared/services';
import { NzModalSubject } from 'ng-zorro-antd'; // NzMessageService

@Component({
  selector: 'app-modal-one-key',
  templateUrl: './modal-one-key.component.html',
  styleUrls: ['./modal-one-key.component.less'],
})
export class ModalOneKeyComponent implements OnInit, OnDestroy {
  constructor(private http: _HttpClient, private subject: NzModalSubject) {}

  list: any;
  data: any;
  busy: boolean;
  hasUpdated: boolean = false;
  showConfirmModal: boolean = false; // 是否显示确认一键操作
  showResultModal: boolean = false; // 是否显示一键操作结果列表
  kolFailed: boolean = false; // 是否有失败kol
  modalTips: string = '';
  curOperation: string = ''; // 当前操作类型
  progressPercent: number = 0; // 当前进度%
  batchStatusList: any[] = [];
  batchErrMsg: string = '';
  cancelProgress: boolean = false; // 是否查询操作进度

  ngOnInit() {
    this.getNums();
  }

  ngOnDestroy() {
    console.log('destroy...');
    this.cancelProgress = true;
  }

  private getNums() {
    this.busy = true;
    this.http.get('api/weixin/getOneStepList').subscribe(res => {
      const { data } = res;
      this.data = data;
      this.list = [
        {
          name: 'post',
          num: result(data, 'post_info.num'),
          title: '一键上传',
          desc:
            '对于有成功上线记录的小程序，可以批量上传最新代码<br/><span class="warning">第一次上传代码的小程序不支持批量操作</span>',
          tips: result(data, 'post_info.tips'),
        },
        {
          name: 'submit',
          num: result(data, 'submit_info.num'),
          title: '一键提审',
          desc: '对于已经上传最新代码的小程序，可以批量提审',
          tips: result(data, 'submit_info.tips'),
        },
        {
          name: 'release',
          num: result(data, 'release_info.num'),
          title: '一键发布',
          desc: '对于审核通过的小程序，可以批量发布新版本',
          tips: result(data, 'release_info.tips'),
        },
        {
          name: 'rollback',
          num: result(data, 'rollback_info.num'),
          title: '一键回滚',
          desc: '针对所有 " 已上线" 的最新版本小程序生效',
          tips: result(data, 'rollback_info.tips'),
        },
      ];
      this.busy = false;
    });
  }

  async onClick(name, num, tips) {
    if (num > 0) {
      if (name === 'rollback') {
        this.modalTips = '' + (await this.getTemplateInfo());
      } else {
        this.modalTips = tips || '确认执行操作吗？';
      }

      this.showConfirmModal = true;
      this.curOperation = name;
    }
    // 旧的方法, 先检查当前是不是在运行, 新方法提交一键操作时后端会先检查当前是不是在运行.
    // if (num > 0) {
    //   this.confirm(name, tips);
    // }
  }
  ConfirmModalCancel() {
    this.showConfirmModal = false;
    this.showResultModal = false;
  }

  // 批量操作modal关闭
  handleCancel() {
    console.log('handleCancel------------');
    this.cancelProgress = true; // 关闭后不再查询进度
    this.showConfirmModal = false;
    this.showResultModal = false;
  }

  resetStatus() {
    this.cancelProgress = false;
    this.showConfirmModal = false;
    this.showResultModal = true;
    this.batchStatusList = []; // 重置结果列表
    this.progressPercent = 0;
    this.kolFailed = false;
    this.batchErrMsg = '';
  }
  // name: post(小程序上传)， submit(小程序提审),  release(小程序发布), rollback(回滚代码)
  handleOk(name) {
    this.resetStatus();
    console.log('type===', name);
    const urlBatch = {
      release: '/api/ng/weixin/xiaochengxu/release',
      post: '/api/ng/weixin/xiaochengxu/postcode',
      submit: '/api/ng/weixin/xiaochengxu/submitaudit',
      rollback: '/api/ng/weixin/xiaochengxu/revert',
    };
    const url = urlBatch[name];
    this.ajaxCodeBatch(url);

    // if (name === 'release') {
    //   this.ajaxCodeReleaseBatch();
    // } else if (name === 'post') {
    //   this.ajaxCodePostBatch();
    // } else if (name === 'submit') {
    //   this.ajaxCodeSubmitBatch();
    // } else if (name === 'rollback') {
    //   this.ajaxCodeRollbackBatch();
    // }
  }

  // 当前的微信小程序模板版本信息
  private getTemplateInfo() {
    return new Promise(resolve =>
      this.http
        .get('/api/ng/weixin/xiaochengxu/templateInfo')
        .subscribe(res => {
          const { data } = res;
          const desc = `确认将模板ID:(${data.templateId}) 版本号:(${
            data.userVersion
          }) 描述:(${data.userDesc}) 回滚吗?`;
          // this.list[3].tips = desc;
          resolve(desc);
        }),
    );
  }
  private ajaxCodeBatch(url) {
    if (!url) {
      return this.batchError();
    }
    this.http.get(url).subscribe(
      res => {
        const patchId = res.data;
        this.getBatchResult(patchId);
      },
      err => {
        console.log('batch err:', err);
        this.batchError();
      },
    );
  }

  // 筛查失败KOL
  filterKol() {
    this.showResultModal = false;
    const arrFailedKol = this.batchStatusList.filter(item => {
      return item.statusVal === '0' || item.statusVal === 0;
    });

    if (arrFailedKol.length > 0) {
      const arrName: string[] = arrFailedKol.map(item => {
        return item.name;
      });
      // 搜索出所有失败的店铺名字
      this.subject.next({ filterKol: true, name: arrName.join(',') });
    }
  }

  // 批量操作完成
  done() {
    this.subject.next({ hasUpdated: true, type: 'ok' });
  }

  // 批量操作当前进度
  getBatchResult(batchId) {
    if (!batchId) {
      return (this.batchErrMsg = '无法获取批量操作ID [batchId is null].');
    }
    if (this.cancelProgress) {
      return; // modal关闭后不再查询进度
    }
    this.http
      .get('/api/ng/weixin/xiaochengxu/progress', { batchId })
      .subscribe(res => {
        const data = res.data;
        const arr = [];
        let incompleteCount = 0;
        const status = { '1': '成功', '0': '失败', '-1': '进行中' };

        if (isEmpty(data)) {
          return (this.batchErrMsg = '当前批量操作没有数据!');
        }

        // 数据格式: "data":{"209":"0_SEE小店铺测试", '208':"1_店铺名字"}
        for (const key in data) {
          const status_name = data[key];
          const arrValue = status_name.split('_');
          const curStatus = status[arrValue[0]];
          arr.push({
            id: key,
            status: curStatus,
            name: arrValue[1],
            statusVal: arrValue[0],
          });
          if (arrValue[0] === '-1') {
            incompleteCount = incompleteCount + 1;
          }
        }

        if (incompleteCount > 0) {
          const total = arr.length;
          const complete = total - incompleteCount;
          this.progressPercent =
            parseFloat((complete / arr.length).toFixed(2)) * 10 * 10;
          setTimeout(() => {
            this.getBatchResult(batchId);
          }, 3000);
        } else {
          this.batchStatusList = this.sortStatus(arr);
          this.progressPercent = 100;
          const hasFailedItem = arr.find(item => {
            return item.statusVal === '0' || item.statusVal === 0;
          });
          if (hasFailedItem) {
            this.kolFailed = true;
          }
          this.getNums();
        }
      });
  }

  // 结果列表排序, 失败的排前面
  private sortStatus(arr) {
    return arr.sort((a, b) => {
      if (a.statusVal === '1' || a.statusVal === 1) {
        return 1;
      }
      return 0;
    });
  }

  private batchError() {
    this.batchErrMsg = '一键操作服务错误, 请稍后再试!';
  }
  /*
  private ajaxCodeReleaseBatch() {
    this.http.get('/api/ng/weixin/xiaochengxu/release').subscribe(
      res => {
        const patchId = res.data;
        this.getBatchResult(patchId);
      },
      err => {
        console.log('batch err:', err);
        this.batchError();
      },
    );
  }

  private ajaxCodeSubmitBatch() {
    return this.http.get('/api/ng/weixin/xiaochengxu/submitaudit').subscribe(
      res => {
        const patchId = res.data;
        this.getBatchResult(patchId);
      },
      err => {
        console.log('batch err:', err);
        this.batchError();
      },
    );
    // return this.dataService.weixin_codeSubmitBatch({}).then(res => {
    //   this.msgService.success('一键提审成功');
    // });
  }

  private ajaxCodePostBatch() {
    return this.http.get('/api/ng/weixin/xiaochengxu/postcode').subscribe(
      res => {
        const patchId = res.data;
        this.getBatchResult(patchId);
      },
      err => {
        console.log('batch err:', err);
        this.batchError();
      },
    );
    // return this.dataService.weixin_codePostBatch({}).then(res => {
    //   this.msgService.success('一键上传成功');
    // });
  }

  // 一键回滚
  private ajaxCodeRollbackBatch() {
    return this.http.get('/api/ng/weixin/xiaochengxu/revert').subscribe(
      res => {
        const patchId = res.data;
        this.getBatchResult(patchId);
      },
      err => {
        console.log('batch err:', err);
        this.batchError();
      },
    );
  }*/
  /*
  // 当前操作是否进行中, 否则弹出确认操作
  async confirm(name, tips): Promise<any> {
    const isRuning = await this.asyncIsTaskRunning(name);
    console.log('检查运行中结束');
    if (isRuning) {
      this.msgService.warning('一键操作正在进行中，请耐心等待...');
    } else {
      console.log('tips===', tips);
      this.modalTips = tips || '确认执行操作吗？';
      this.showConfirmModal = true;
      this.curOperation = name;
    }
  }
  */
  /*
  asyncIsTaskRunning(name) {
    return new Promise(resolve => {
      this.http.get('/api/ng/weixin/xiaochengxu/status').subscribe(res => {
        const data = res.data;
        // 一键提交postcode,发布代码:release,提审审核submitaudit
        const dataName = {
          post: 'postcode',
          release: 'release',
          submit: 'submitaudit',
        }[name];
        const isRuning = data[dataName] === 'ing'; // 是否在运行中
        console.log('is current running =====', isRuning);
        resolve(isRuning);
      });
    });
  }
  */
}
