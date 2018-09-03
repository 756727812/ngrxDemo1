import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { IReportService } from '../../services/report-service/report-service.interface';
import { applicationService } from 'app/services/application/application.service';


import * as moment from 'moment';
import * as angular from 'angular';

export class shopCreateController {
  step: number;
  navStep: number;
  baseStep: number;
  shopType: number;
  shopTitle: string = '开通小电铺';
  mainBody: number;
  prev: object;
  payInfo: any;
  navStepStatus: any;
  navList: Array<any>;
  navListSee: Array<any>;
  seller_info: object;
  payFormData: any;
  applyFormData: any;
  applyBaseFormData: any;
  id: any;
  fileName: string;

  static $inject: string[] = [
    'reportService',
    '$q', '$routeParams', '$location', 'dataService', 'Notification', 'seeModal', '$uibModal', 'shopService', 'Upload'];

  constructor(
    private reportService: IReportService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $uibModal: any,
    private shopService: any,
    private Upload: any,
  ) {
    if (!$('body').hasClass('sidebar-collapsed')) {
      applicationService().createCollapsedSidebar();
    }
    this.step = 1;
    this.shopType = 1; //1：基础版，2：进阶版，3：专业版
    this.mainBody = 0; //1：自媒体或品牌，2：SEE
    this.prev = {
      isReg: 0,
      isAll: 0,
      isOpen: 0,
    };
    this.id = this.$routeParams.id;
    this.navStepStatus = {
      step2: false,
      step3: false,
    };
    this.applyFormData = {};
    this.applyBaseFormData = {};
    this.navStep = 1;
    this.baseStep = 1;
    this.navList = [{ status: 1, text: '开通小电铺前期准备' }, { status: 0, text: '一键申请小电铺' }, { status: 0, text: '授权小电铺开发' }, { status: 0, text: '完善小电铺支付相关信息' }];
    this.navListSee = [{ status: 1, text: '一键申请小电铺' }, { status: 0, text: '申请等待' }, { status: 0, text: '申请通过预备上线' }];
    let promises: ng.IPromise<any>[];
    promises = [this.getInfoById()];
    this.$q.all(promises);
  }

  private getInfoById() {
    const param: any = {
      id: this.id,
    };
    if (this.id) {
      return this.dataService.shop_getInfoById(param).then(res => {
        if (res.result == 1) {
          console.log(res.data);
          this.shopType = res.data.type;
          this.mainBody = res.data.main_body;
          this.step = this.shopType != 1 ? 3 : 2;
          this.stepStatus(res.data.xiaodianpu_info.status);
        }
      });
    }
  }
  private getPayInfo() {
    const param: any = {
      id: this.id,
    };
    return this.dataService.shop_getPayInfo(param).then(res => {
      if (res.result == 1) {
        this.payFormData = res.data.pay_info;
      }
    });
  }
  private editPayInfo() {//完善信息
    const pay_info = {
      ...this.payFormData,
      id: this.id,
    };
    const param: any = {
      pay_info: JSON.stringify(pay_info),
    };
    if (!this.fileName) {
      this.Notification.dataError('必需上传退款证书才能进行下一步操作');
      return false;
    }
    this.seeModal.confirmP('确认提交', '<p>支付信息填写错误可能会影响小电铺的微信支付功能，确定支付信息全部填写正确？</p>')
      .then(() =>
        this.dataService.shop_editPayInfo(param).then(res => {
          if (res.result == 1) {
            this.Notification.success('支付信息提交成功');
            this.navStep = 5;
            this.navList = [{ status: 2, text: '开通小电铺前期准备' }, { status: 2, text: '一键申请小电铺' }, { status: 2, text: '授权小电铺开发' }, { status: 2, text: '完善小电铺支付相关信息' }];
          }
        }),
    );
  }
  private uploadCET: (file: File) => ng.IPromise<any> = file => {
    return file ?
      this.Upload.upload({
        url: 'api/upload/weixinPayCert',
        data: { file, id: this.id },
      }).then(res => {
        this.fileName = `--${file.name}`;
        if (res.data.result == 0) {
          // this.Notification.dataError(res.data && res.data.msg)
          this.seeModal.confirm('提示', res.data && res.data.msg, () => { }, () => { }, '确认', '');
        }
      })
      :
      this.$q.reject('没有选择上传文件！');
  }
  private getSellerDetail: () => ng.IPromise<any> = () =>
    this.dataService.seller_getSellerDetail().then(res => this.seller_info = res.data.seller_info)

  stepStatus(item) {//注册步骤状态显示
    switch (item) {
      case 30:
        if (this.shopType == 1) {
          this.baseStep = 2;
        } else {
          if (this.mainBody == 2) {
            this.navStep = 3;
            this.navListSee[0].status = 2;
            this.navListSee[1].status = 2;
            this.navListSee[2].status = 1;
          } else {
            this.navStep = 2;
            this.navStepStatus.step2 = true;
            this.navList[0].status = 2;
            this.navList[1].status = 1;
          }
        }
        break;
      case 40:
        this.navStep = 3;
        this.navList = [{ status: 2, text: '开通小电铺前期准备' }, { status: 2, text: '一键申请小电铺' }, { status: 1, text: '授权小电铺开发' }, { status: 0, text: '完善小电铺支付相关信息' }];
        break;
      case 50:
      case 80:
        this.getPayInfo();
        this.navStep = 4;
        this.navList = [{ status: 2, text: '开通小电铺前期准备' }, { status: 2, text: '一键申请小电铺' }, { status: 2, text: '授权小电铺开发' }, { status: 1, text: '完善小电铺支付相关信息' }];
        break;
      case 60:
      case 70:
        this.navStep = 5;
        this.navList = [{ status: 2, text: '开通小电铺前期准备' }, { status: 2, text: '一键申请小电铺' }, { status: 2, text: '授权小电铺开发' }, { status: 2, text: '完善小电铺支付相关信息' }];
        break;
    }
  }

  selectShopType(item) {
    // this.getSellerDetail();
    this.dataService.seller_getSellerDetail().then(res => {
      this.seller_info = res.data.seller_info
      const type = item == 1 ? '基础' : (item == 2 ? '进阶' : '专业');
      this.shopTitle = item == 1 ? '开通基础版小电铺' : '主体选择';
      // this.seeModal.confirm('确认提示', `你确定要创建${type}版小电铺吗？`, () => {
      //   console.log(this.seller_info);
      if (item == 3 && this.seller_info['is_skip_main_body'] == 1) {
        // code...
        this.step = 3;
        this.mainBody = 2;
      } else {
        this.step = 2;
      }
      this.shopType = item;
      // },                    () => {

      // });
    })

  }
  selectMainBody() {
    if (this.mainBody) {
      const type = this.mainBody == 1 ? '自己' : ' SEE ';
      const reportKey = this.mainBody == 1
        ? 'PAGE_CREATE_SHOP.SEL_SUBJECT_OWN'
        : 'PAGE_CREATE_SHOP.SEL_SUBJECT_SEE';
      this.seeModal.confirm('确认提示', `你确定要选择${type}作为小电铺主体？`, () => {
        this.step = 3;
        this.reportService.reportByKey(reportKey);
        // this.mainBody = item
      }, () => {
        this.mainBody = 0;
      });
    } else {

    }
  }
  toPrev(item) {
    if (item == 1) {
      this.seeModal.confirm('确认提示', `你确放弃本次的小电铺申请？`, () => {
        this.step = item;
      }, () => {

      });
    } else {
      this.step = item;
    }
  }
  goToConcatPage(hash) {
    this.$location.path('/concat/shop/#' + hash);
  }
  confirmApply() {
    return this.dataService.shop_confirmApply({ id: this.id }).then(res => {
      this.navStep = 3;
      this.navStepStatus.step2 = false;
      this.navList = [{ status: 2, text: '开通小电铺前期准备' }, { status: 2, text: '一键申请小电铺' }, { status: 1, text: '授权小电铺开发' }, { status: 0, text: '完善小电铺支付相关信息' }];
    });
  }
  newApply() {//一键申请操作
    const param = {
      type: this.shopType,
      main_body: this.mainBody,
    };
    if (this.mainBody == 2) {
      param['xiaodianpu_info'] = JSON.stringify(this.applyFormData);
    }
    return this.dataService.shop_newApply(param).then(res => {
      console.log(res);
      this.id = res.data.id;
      this.navStepStatus.step2 = false;
      this.navStep = 2;
      if (this.mainBody == 2) {
        this.navListSee[0].status = 2;
        this.navListSee[1].status = 1;
      } else {
        this.navList[0].status = 2;
        this.navList[1].status = 1;
      }
    });
  }
  newBaseApply() {//基础版一键申请操作
    const param = {
      type: this.shopType,
      main_body: 2,
      xiaodianpu_info: JSON.stringify(this.applyBaseFormData),
    };
    return this.dataService.shop_newApply(param).then(res => {
      this.id = res.data.id;
      this.baseStep = 2;
    });
  }
  accredit() {//授权操作
    this.seeModal.confirm('确认提示', `即将前往小程序授权页面，确认授权？`, () => {
      return this.dataService.shop_getUrlWeinxinAuth({ id: this.id }).then(res => {
        if (res.result == 1) {
          window.location.href = res.data.url;
        }
      });
    });
  }
  /*------
  -----主体为see的流程---
  ---*/
  uploadSizeImg(res) {
    if (res.result == 1) {
      if (this.shopType == 1) {
        this.applyBaseFormData.heading = res.data;
      } else {
        this.applyFormData.heading = res.data;
      }
    }
    else this.Notification.dataError(res);
  }
}


export const shopCreate: ng.IComponentOptions = {
  template: require('./shop-create.template.html'),
  controller: shopCreateController,
};

