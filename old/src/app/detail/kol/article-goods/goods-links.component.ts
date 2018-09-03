import * as angular from 'angular';
import { isEmpty, merge, filter, find, result } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;
import { confirmImgHost } from '../../../utils';
import { accessChecker } from '../../../utils/permission-helper';

import './goods-links.less';

const H_TAB_TYPE = {
  XCX: 1,
  WEB: 2,
};
const V_TAB_4_WEB = [
  { txt: '商品二维码', type: 1, group: H_TAB_TYPE.WEB },
  { txt: '商品链接', type: 2, group: H_TAB_TYPE.WEB },
];
const V_TAB_4_XCX = [
  { txt: '小程序卡片', type: 1, group: H_TAB_TYPE.XCX, recommend: true },
  { txt: '小程序码', type: 2, group: H_TAB_TYPE.XCX },
  { txt: '小程序二维码', type: 3, group: H_TAB_TYPE.XCX },
];

interface XdpInfo {
  type: string;
  id: string; // 小电铺 id
  xdp_id: string; // 小电铺 id
}
export class ArticleGoodsGoodsLinksController {
  static $inject: string[] = [
    'assertService',
    '$q',
    '$routeParams',
    '$location',
    'seeModal',
    'dataService',
    'Notification',
    '$uibModal',
    '$element',
    '$scope',
  ];

  resolve: { item: number; xdpInfo: { type } };
  close: Function;
  dismiss: Function;
  vTabs: any;
  hTabs: any;
  vCurMap: any;
  curGroup: number;
  ready = false;
  hasXDP = false;
  xcxInfo: any;
  shopType: number;

  static open(item, xdpInfo?: { type }) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'kol-article-goods-goods-links',
      component: 'kolArticleGoodsGoodsLinks',
      resolve: {
        item: () => item,
        xdpInfo: () => xdpInfo,
      },
    });
  }

  constructor(
    private assertService: see.IAssertService,
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private seeModal: see.ISeeModalService,
    private dataService: see.IDataService,
    private Notification: see.INotificationService,
    private $uibModal: any,
    private $element: any,
    private $scope: ng.IScope,
  ) {}

  get item(): any {
    return this.resolve.item;
  }

  get compVal() {
    return `${this.curGroup}-${this.vCurMap[this.curGroup]}`;
  }

  getXdpInfo() {
    // 如果是指定了小电铺信息，就是用指定的，否则使用当前登录用户的
    return new Promise(resolve => {
      if (this.resolve.xdpInfo) {
        resolve(this.resolve.xdpInfo);
      } else {
        this.dataService.shop_checkCurrentStatus().then(({ data }) => {
          resolve(data);
        });
      }
    });
  }

  $onInit() {
    this.curGroup = H_TAB_TYPE.XCX;
    this.vCurMap = this.getDefaultVTabValMap();
    this.hTabs = [
      { txt: '微信小程序', type: H_TAB_TYPE.XCX, recommend: true },
      { txt: '网页', type: H_TAB_TYPE.WEB },
    ];

    this.vTabs = [...V_TAB_4_WEB, ...V_TAB_4_XCX];

    Promise.all([
      this.getXdpInfo().then((data: XdpInfo) => {
        if (data) {
          if (~~data.type < 2) {
            this.vTabs = [...V_TAB_4_WEB, ...V_TAB_4_XCX.slice(1)];
          }
          this.hasXDP = ~~(data.xdp_id || data.id) > 0; // 审核通过
          this.shopType = ~~data.type;
          this.checkVal();
        }
      }),
      this.dataService
        .articel_content_itemLink({
          params: {
            kolId: this.item.kol_id,
            articleId: this.item.article_id,
            itemId: this.item.item_id,
          },
        }) //
        .then(({ data }) => {
          this.xcxInfo = data;
        }),
    ]).then(() => {
      this.$scope.$applyAsync(() => {
        this.ready = true;
      });
    });
  }

  getXCXCardImg() {
    return this.xcxInfo.xiaochengxuCardImgUrl
      ? `${confirmImgHost(
          this.xcxInfo.xiaochengxuCardImgUrl,
        )}?imageMogr2/thumbnail/!1080x864r/gravity/Center/crop/1080x864/format/jpg`
      : null;
  }

  getDefaultVTabValMap() {
    return {
      [H_TAB_TYPE.XCX]: V_TAB_4_WEB[0].type,
      [H_TAB_TYPE.WEB]: V_TAB_4_XCX[0].type,
    };
  }

  isTopTabActive(item) {
    return this.curGroup === item.type;
  }

  switchGroup(item) {
    this.curGroup = item.type;
  }

  checkVal() {
    const vTabsUnderGroup: any = filter(this.vTabs, { group: this.curGroup });
    if (!find(vTabsUnderGroup, { type: this.vCurMap[this.curGroup] })) {
      this.vCurMap[this.curGroup] = vTabsUnderGroup[0].type;
    }
    this.curGroup = this.hasXDPVersion() ? H_TAB_TYPE.XCX : H_TAB_TYPE.WEB;
  }

  isVTabActive(item) {
    return this.vCurMap[this.curGroup] === item.type;
  }

  switchVTab(item) {
    this.vCurMap[this.curGroup] = item.type;
  }

  shouldVTabShow(item) {
    return item.group === this.curGroup;
  }

  onCopySuccess() {
    this.Notification.success('复制成功');
  }

  hasXDPVersion() {
    return this.shopType && ~~this.shopType > 1;
  }
}

export const kolArticleGoodsGoodsLinks: ng.IComponentOptions = {
  template: require('./goods-links.template.html'),
  controller: ArticleGoodsGoodsLinksController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
