import * as _ from 'lodash';
import { IDataService } from '../../services/data-service/data-service.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import './dashboard.style.less';

import { show as showMobileTips } from '../../utils/mobile-tip';

export class DashboardController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService', '$location', 'Notification', 'seeModal', '$timeout', '$echarts', '$uibModal', 'applicationService', '$cookies'];

  chartTheme: string = 'vintage';
  chartInstance: any;
  header: any;
  newData: any;
  profit: any;
  lastUpdated: any;
  data: any;
  applyData: any;
  tradeDistribution: any = {};
  currentChartType: string;
  xiaodianpuList: any;
  b_get_header: boolean;
  b_get_data: boolean;
  is_open_todo: boolean;

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private $location: ng.ILocationService,
    private Notification: INotificationService,
    private seeModal: ISeeModalService,
    private $timeout: ng.ITimeoutService,
    private $echarts: any,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private applicationService: any,
    private $cookies: ng.cookies.ICookiesService,
  ) { }

  $onInit() {
    showMobileTips();
    this.is_open_todo = false;
    this.b_get_data = false;
    this.b_get_header = false;
    this.shopItemAddPos(1000);
    const promises = [
      this.getHeader(),
      this.getNewData(),
      this.accountProfile(),
      this.applyWithdrawalQuery(),
      this.getLastUpdated(),
      this.getTradeDistribution(),
      this.getList(),
    ];
    this.$q.all(promises).then(() => {
      const leaded = this.$cookies.get('leadDashboard');
      if (!leaded && !this.xiaodianpuList.length && this.b_get_data && this.b_get_header) {
        this.showCover();
      }
    });
    $(window).resize(() => this.shopItemAddPos(0));
    this.chartInstance = this.$echarts.create(this.chartTheme, { height: 200, width: 300 });
    this.chartInstance.showLoading();
  }
  showCover() {
    setTimeout(() => {
      this.applicationService.coverGuide(
        document.getElementById('lead-cover'),
        document.getElementById('lead_dashboard'),
        '需要先创建小电铺，才能正常使用所有功能哟~', function () {
          $('.lead-cover,.lead-info').hide();
          const expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 60);
          this.$cookies.put('leadDashboard', 1, { expires: expireDate });
        });
    }, 500);
  }
  gotoCreateXdp() {
    if (!this.xiaodianpuList.length) {
      this.$location.url('/shop/create');
    } else {
      this.seeModal.confirmP(
        '新增小电铺',
        '创建多个小电铺的功能即将上线，敬请期待=￣ω￣=',
        '知道了',
        '',
      );
    }
  }
  cancelApply: (id: number) => ng.IPromise<any> = id =>
    this.seeModal.confirmP('取消申请', '<p>确定取消申请？</p>')
      .then(() =>
        this.dataService.xiaodianpu_delApply({ id })
          .then(res => {
            this.Notification.success('取消申请成功！');
            this.getList();
          }),
    )

  delApply: (id: number) => ng.IPromise<any> = id =>
    this.seeModal.confirmP('删除', '<p>确定删除？</p>')
      .then(() =>
        this.dataService.xiaodianpu_delApply({ id })
          .then(res => {
            this.Notification.success('删除成功！');
            this.getList();
          })
          .catch(res => this.Notification.dataError(res.msg)),
    )
  reApply: (id: number) => ng.IPromise<any> = id =>
    this.seeModal.confirmP('终止申请', '<p>是否要终止该小电铺的申请流程？</p>')
      .then(() =>
        this.dataService.shop_reApply({ id })
          .then(res => {
            this.Notification.success('已重新申请!');
            this.getList();
          })
          .catch(res => this.Notification.dataError(res.msg)),
    )
  openShopAccessInfo() {
    this.dataService.shop_getXiaoDianPuUser()//
      .then(({ data }) => {
        this.$uibModal.open({
          animation: true,
          size: 'shop-access-info',
          component: 'modalShopAccessInfo',
          resolve: {
            data: () => data,
          },
        });
      });

  }
  setGetProgressBarWidth: (key: string) => any = key => {
    if (_.keys(this.tradeDistribution).length === 0) { return; }
    const curMap = this.tradeDistribution[this.currentChartType];
    const sum = (<any>_.chain(curMap).values().sum());
    return _.reduce(curMap, (acc, value: number, key) => {
      acc[key] = {
        width: `${value * 100 / sum}%`,
        value,
      };
      return acc;
    }, [])[key];
  }

  setEchartOption: (key: string) => any = key => {
    if (this.currentChartType === key) { return; }
    this.currentChartType = key;
    this.chartInstance.showLoading();
    const nameMap = {
      user_info: '用户',
      order_info: '订单',
      gmv_info: 'GMV',
    };
    this.$timeout(() => {
      this.chartInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        series: [
          {
            name: nameMap[key],
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '30',
                  fontWeight: 'bold',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: [
              {
                value: this.tradeDistribution[key].self_support_num,
                name: '自营',
                itemStyle: {
                  normal: {
                    color: '#5971e8',
                  },
                },
              },
              {
                value: this.tradeDistribution[key].supply_num,
                name: '供货',
                itemStyle: {
                  normal: {
                    color: '#76ddfb',
                  },
                },
              },
              {
                value: this.tradeDistribution[key].dispatch_num,
                name: '分销',
                itemStyle: {
                  normal: {
                    color: '#dbecf8',
                  },
                },
              },
            ],
          },
        ],
      }).hideLoading();
    }, 600);
  }

  private getList: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getList({ page: 1, page_size: 999 })
      .then(res => {
        this.xiaodianpuList = res.data.list;
        this.b_get_data = true;
      })// .filter(o => o.app_title))

  private getHeader: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getHeader()
      .then(res => {
        this.header = res.data;
        this.b_get_header = true;
        // 专业版，并且审核通过才显示
        if (this.header.xdp_info.type == 3 && this.header.xdp_info.manager_status > 20) {
          this.is_open_todo = true;
        }
      })

  private getNewData: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getNewData()
      .then(res => this.newData = res.data)

  // private getProfit: () => ng.IPromise<any> = () =>
  //   this.dataService.xiaodianpu_getProfit()
  //     .then(res => this.profit = res.data)

  // 资产模块
  private accountProfile: () => ng.IPromise<any> = () =>
    this.dataService.api_fms_accountProfile().then(res => {
      this.data = res.data;
    })

  private applyWithdrawalQuery: () => ng.IPromise<any> = () =>
    this.dataService.api_fms_withdrawal_apply_query().then(res => {
      this.applyData = res.data;
    }).catch(err => { })

  private applyWithdrawals: () => any = () => {
    if (!this.applyData.account || !this.applyData.withdrawalType) {
      // TODO 后台去掉判断
      this.seeModal.confirm('提醒', '请联系SEE管理员设置提现方式与账户', null, null, '确定', '');
    } else if (this.data.availableAmount > 0) {
      this.$location.path('/assetNew/withdrawals');
    } else {
      this.seeModal.confirm('提醒', '抱歉，您的余额不足，不可提现', null, null, '确定', '');
    }
  }

  private getLastUpdated: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getLastUpdated()
      .then(res => this.lastUpdated = res.data)

  private getTradeDistribution: () => ng.IPromise<any> = () =>
    this.dataService.xiaodianpu_getTradeDistribution()
      .then(res => {
        this.tradeDistribution = res.data;
        this.setEchartOption('user_info');
      })

  private shopItemAddPos(seconds: number) {
    this.$timeout(() => {
      const shopItemHeight = $('.shop-item:not(.shop-item-add)').height();
      $('.shop-item-add').height(shopItemHeight);
    }, seconds);
  }

}


export const dashboard: ng.IComponentOptions = {
  template: require('./dashboard.template.html'),
  controller: DashboardController,
};

