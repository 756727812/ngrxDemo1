import * as urlParse from 'url-parse';
import { isEmpty, result } from 'lodash';
import Injector from '../../../../utils/injector';
import { confirmImgHost } from '../../../../utils';

import './link-info.less';

interface XdpInfo {
  type: string;
  id: string; // 小电铺 id
  xdp_id: string; // 小电铺 id
}

type IQrData = {
  publicNumberPath: string; //  公众号路径
  articlePath: string; // 小程序路径（文章）
  xcxCardImgUrl: string; // 小程序卡片配图

  articleAcodeUrl: string; //  文章-小程序URL ,
  articleQrcodeUrl: string; // 文章-二维码URL ,

  wxGroupAcodeUrl: string; //  微信群-小程序URL ,
  wxGroupQrcodeUrl: string; // 微信群-二维码URL

  scanAcodeUrl: string; // ("扫一扫-小程序URL")
  scanQrcodeUrl: string; //  扫一扫-二维码URL ,

  wxGroupShareAcodeUrl: string; // 微信群-分享-小程序URL
  wxGroupShareQrcodeUrl: string; // 微信群-分享-二维码URL

  webUrl: string; // 网页商品链接
  webQrcodeUrl: string; // 网页商品二维码
};

export class GoodsLinkInfoController {
  static $inject: string[] = [
    '$scope',
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
  ];

  resolve: {
    data: IQrData;
    xdpInfo?: XdpInfo;
    kolId: string;
  };

  static open(
    data: IQrData,
    options: {
      preventMallPath?: boolean;
      onlyXcx?: boolean;
      kolId?: string;
      xdpInfo?: XdpInfo;
      tabs?: any;
    } = {},
  ) {
    if (process.env.NODE_ENV === 'development') {
      if (!options.kolId && !options.xdpInfo) {
        console.error('至少要有 kolId 或者 xdpInfo');
      }
    }
    const tabs = options.tabs || [{}, {}];
    return Injector.getUibModal().open({
      animation: true,
      backdrop: 'static',
      size: 'kol-article-goods-link-info',
      component: 'kolArticleGoodsLinkInfo',
      resolve: {
        data: () => data,
        onlyXcx: () => options.onlyXcx || false,
        kolId: () => options.kolId,
        xdpInfo: () => options.xdpInfo,
        preventMallPath: () => options.preventMallPath,
        tabs: () => tabs,
      },
    });
  }

  isXdpApproved: boolean;
  shopType: number;
  hideXcxCard: boolean;
  ready = false;
  shouldAdviceUpgrade = false;
  hasXdpApplied = false;
  queen: {
    item_type: any,
    qr_img: string,
    group_id: string,

  }

  constructor(
    private $scope: ng.IScope,
    private assertService: see.IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: any,
    private $element: any,
  ) {
    this.queen = {
      item_type: '',
      qr_img: '',
      group_id: '',
    }
  }

  get data() {
    return this.resolve.data;
  }

  $onInit() {
    this.getXdpInfo().then((data: XdpInfo) => {
      console.log('xdpInfo', data)
      if (data) {
        if (~~data.type < 2) {
          this.hideXcxCard = true;
        }
        this.isXdpApproved = ~~(data.xdp_id || data.id) > 0; // 审核通过
        this.shopType = ~~data.type;
        this.shouldAdviceUpgrade = this.shopType < 2;
      }
      this.getQueenQr();
      this.$scope.$applyAsync(() => {
        this.ready = true;
      });
    });
  }

  getXdpInfo() {
    // 如果是指定了小电铺信息，就是用指定的，否则使用当前登录用户的
    return new Promise(resolve => {
      if (this.resolve.xdpInfo) {
        resolve(this.resolve.xdpInfo);
      } else if (this.resolve.kolId) {
        this.dataService
          .kol_mgr_checkUserPri({
            kol_id: this.resolve.kolId,
          })
          .then(({ data }) => {
            resolve(result(data, 'kol_info.xdp_info'));
          });
      }
      // else {
      //   this.dataService.shop_checkCurrentStatus().then(({ data }) => {
      //     resolve(data);
      //   });
      // }
    });
  }

  get XCXCardImg(): string {
    if (Boolean(this.data.xcxCardImgUrl)) {
      const imgURL = urlParse(this.data.xcxCardImgUrl);
      return `${confirmImgHost(
        imgURL.pathname,
      )}?imageMogr2/thumbnail/!1080x864r/gravity/Center/crop/1080x864/format/jpg`;
    }
    return '';
  }
  getQueenQr() {
    this.dataService.get_queen_qrcode({
      itemType: 1,
      articleId: this.data['articleId'],
      itemId: this.data['itemId'],
      kolId: this.resolve.xdpInfo['kol_id'],
    }).then((data) => {
      this.queen.qr_img = data.data
    })
  }

  onCopySuccess() {
    this.Notification.success('复制成功');
  }
}

export const kolArticleGoodsLinkInfo: ng.IComponentOptions = {
  template: require('./link-info.template.html'),
  controller: GoodsLinkInfoController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
