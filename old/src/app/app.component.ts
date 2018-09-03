import {
  Component,
  OnInit,
  Inject,
  AfterViewInit,
  HostBinding,
} from '@angular/core';

import { _HttpClient } from '@shared/services';
import { getItem } from '@utils/storage';
import { applicationService } from './services/application/application.service';
import { pluginsService } from './services/plugins-service/plugins.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit, AfterViewInit {
  operateOrderCount: any = {};
  userName: string = '';
  showPhoto: boolean;
  headimg: string;
  isYuqing: boolean;
  isWeKOL: boolean;
  isKolHome: boolean;
  isHotItem: boolean;
  isFashion: boolean;
  isOldC2C: boolean = false;
  isNewBrand: boolean = false;
  isShowOrder: boolean = false;
  isSeedataVip: boolean = false;
  pri_spe_kol: number = 0;
  list_kol: any[];
  list_kol_super: any[];
  isRuHan: boolean = getItem('seller_name') === '如涵';
  hideTopicItemNav: boolean = false;
  hideHotItemNav: boolean = false;
  favorCount: number;
  xdpId: number;
  userType: number;
  kolInfo: any = {};
  isQuhaodian: boolean;
  isShowSide: boolean = false;
  isInit: boolean = false;

  private userPrivilege: string = getItem('seller_privilege');

  constructor(private http: _HttpClient, private activeRoute: ActivatedRoute) {}

  refreshParentMenuActiveByActiveSubMenu() {
    // 先这么地，日后重写 sidebar-nav
    setTimeout(() => {
      $('.nav.nav-sidebar .nav-active').removeClass('nav-active active');
      $('.nav.nav-sidebar .active:not(.nav-parent):not(span)')
        .closest('.nav-parent')
        .addClass('nav-active active');
      // .fa.arrow 有 active class 情况
      // $('.nav-parent:not(.active)').find('ul.collapse').each(function() {
      //   $(this).css('display', 'none')
      // })
    }, 3000);
  }

  ngOnInit() {
    Promise.all([
      this.getUserHeadImg(),
      this.getOperateOrderCount(),
      this.getSellerKolInfo(),
      this.getFavourCount(),
    ]).then(() => this.refreshParentMenuActiveByActiveSubMenu());

    if (Number(this.userPrivilege) === 30) {
      this.isNewBrand = true;

      this.http.get('api/xiaodianpu/checkCurrentStatus').subscribe(res => {
        const data = res.data;
        this.kolInfo = data;
        this.xdpId = data.xdp_id;
        this.userType = data.user_type;
        if (Number(data.xdp_id) > 0 && Number(data.type) > 2) {
          this.isShowOrder = true;
        }
        localStorage.setItem('seller_xdpType', String(data.type));
        this.isQuhaodian = data.is_quhaodian;
        localStorage.setItem('is_quhaodian', data.is_quhaodian);
      });
    } else {
      localStorage.removeItem('seller_xdpType');
      localStorage.removeItem('is_quhaodian');
    }

    /**
     * 打印安全提示
     */
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%c \u5b89\u5168\u8b66\u544a\uff01',
        'font-size:50px;color:red;-webkit-text-fill-color:red;-webkit-text-stroke: 1px black;',
      );
      console.log(
        '%c \u6b64\u6d4f\u89c8\u5668\u529f\u80fd\u4e13\u4f9b\u5f00\u53d1\u8005\u4f7f\u7528\u3002' +
          '\u82e5\u67d0\u4eba\u8ba9\u60a8\u5728\u6b64\u590d\u5236\u7c98\u8d34\u67d0\u5185\u5bb9' +
          '\u4ee5\u542f\u7528\u67d0\u0020\u0053\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u529f' +
          '\u80fd\u6216\u201c\u5165\u4fb5\u201d\u67d0\u4eba\u5e10\u6237\uff0c\u6b64\u4e3a\u6b3a' +
          '\u8bc8\uff0c\u4f1a\u4f7f\u5bf9\u65b9\u83b7\u6743\u8fdb\u5165\u60a8\u7684\u0020\u0053' +
          '\u0065\u0065\u0067\u006f\u0020\u540e\u53f0\u5e10\u6237\uff0c\u7ed9\u60a8\u9020\u6210' +
          '\u635f\u5931\u3002',
        'font-size: 20px;color:#333',
      );
    }
  }

  ngAfterViewInit() {
    // 这里当做普通函数用
    this.init();
  }

  init() {
    // 侧边栏展示再初始化滚动条相关
    if (!this.isShowSide || this.isInit) {
      return;
    }
    this.isInit = true;
    setTimeout(() => {
      applicationService().init();
      pluginsService().init();
      setTimeout(() => {
        $('.loader-overlay').addClass('loaded');
        $('body > section').animate({ opacity: 1 }, 400);
      });
    }, 0);
  }

  get showStoreConstructionDemo(): boolean {
    return location.host !== 'portal.xiaodianpu.com';
  }

  isActive: (viewLocation: string) => boolean = (...locationArr) => {
    //   // 兼容下不同页面的选中效果
    // let forceActiveTab = this.$routeParams['force_active_tab'];
    const type = this.activeRoute.snapshot.queryParamMap.get('type') || '';
    if (type) {
      return locationArr.some(l => !!type.match(l));
    }
    let forceActiveTab;
    if (forceActiveTab) {
      forceActiveTab = decodeURI(forceActiveTab);
      return locationArr.some(l => !!forceActiveTab.match(l));
    }
    return locationArr.some(l => !!location.pathname.match(l));
  };

  goToAccountPage(event: Event) {
    event.preventDefault();
    location.href = '/personalInfo/account';
  }

  logout(event: Event): void {
    event.preventDefault();
    this.http.get('api/auth/logout').subscribe(() => {
      location.href = '/auth.html#!/entry?from=logout';
      localStorage.clear();
    });
  }

  // 更新选品库数字
  private getFavourCount() {
    return this.http
      .get('api/data_api/getFavourCount')
      .subscribe(({ data }) => {
        this.favorCount = data.count;
      });
  }

  /**
   * 获取KOL的账号信息
   */
  private getSellerKolInfo() {
    return this.http
      .post('api/kol_mgr/kolGetListWithSeller', {
        formdata: {
          platform_id: 1,
        },
      })
      .subscribe(({ data }) => {
        this.list_kol = data.list_kol;
        this.list_kol_super = data.list_kol_super;
        localStorage.setItem('kolId', this.list_kol[0].kol_id);
        if (Number(this.userPrivilege) === 30) {
          this.http.get('api/ng/seedata/authorizedVIP').subscribe(data => {
            this.isSeedataVip = data.data.authorizedVip;
          });
        }
      });
  }

  /**
   * 获取待操作订单计数
   */
  private getOperateOrderCount() {
    if ([1, 5, 7, 10, 30].includes(Number(this.userPrivilege))) {
      return this.http
        .get('api/orderv2/getOperateOrderCount')
        .subscribe(({ data }) => {
          this.operateOrderCount = data;
        });
    }
  }

  /**
   * 获取用户信息
   */
  private getUserHeadImg() {
    return this.http
      .get('api/seller/getSellerDetail')
      .subscribe(
        ({ data: { seller_info: sellerInfo, user_info: userInfo } }) => {
          this.userPrivilege = sellerInfo.seller_privilege;
          this.showPhoto = !!sellerInfo.show_photo_match_id || false;
          this.headimg = userInfo.u_headimg
            ? userInfo.u_headimg.indexOf('http') === -1
              ? '//img-qn.seecsee.com/' + userInfo.u_headimg
              : userInfo.u_headimg
            : '//static.seecsee.com/seego_backend/global/images/avatars/avatar.png';
          this.userName = sellerInfo.seller_name;
          if (sellerInfo.seller_privilege === '24') {
            this.isWeKOL = !sellerInfo.block_weiqushi_for_24;
            this.isFashion = !sellerInfo.block_fashion;
            this.isYuqing = !sellerInfo.block_yuqing;
            this.isKolHome = !sellerInfo.block_kolhome;
            this.isHotItem = !sellerInfo.block_hotitem;
            this.pri_spe_kol = Number(sellerInfo.pri_spe_kol);
            if (this.pri_spe_kol === 1) {
              location.href = '/fashion/material';
            }
          } else {
            this.isWeKOL = true;
            this.isFashion = true;
            this.isYuqing = true;
            this.isKolHome = true;
            this.isHotItem = true;
          }
          this.isOldC2C = sellerInfo.isOldC2C;
          if (Number(this.userPrivilege) === 30) {
            const { topic_item_flag, hot_item_flag } = sellerInfo;
            this.hideHotItemNav = Number(hot_item_flag) === 0;
            this.hideTopicItemNav = Number(topic_item_flag) === 0;
          }
          // 新扫码登录时跳过了主动登录接口调用，导致没保存这些变量
          const { seller_name, seller_privilege, seller_email } = sellerInfo;
          document.cookie = `seller_name=${seller_name}`;
          document.cookie = `seller_privilege=${seller_privilege}`;
          document.cookie = `seller_email=${seller_email}`;
          localStorage.setItem('seller_email', seller_email);
          localStorage.setItem('seller_name', seller_name);
          localStorage.setItem('seller_privilege', seller_privilege);
          this.isShowSide = true;
          this.init();
        },
      );
  }
}
