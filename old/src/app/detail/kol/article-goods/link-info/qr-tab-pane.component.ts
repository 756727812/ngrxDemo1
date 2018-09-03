import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';

/*
publicNumberPath  公众号路径
private String articlePath 小程序路径（文章）
xiaochengxuCardimgUrl 小程序卡片配图

articleAcodeUrl  文章-小程序URL ,
articleQrcodeUrl  文章-二维码URL ,

wxGroupAcodeUrl  微信群-小程序URL ,
wxGroupQrcodeUrl  微信群-二维码URL

scanAcodeUrl; ("扫一扫-小程序URL")
scanQrcodeUrl  扫一扫-二维码URL ,

wxGroupShareAcodeUrl 微信群-分享-小程序URL
wxGroupShareQrcodeUrl 微信群-分享-二维码URL


*/
export class Controller {
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
  ];

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
  ) {}

  $onInit() {
    console.log('>>qr tab pane init');
  }
}

export const kolArticleGoodsLinkInfoQrTabPane: ng.IComponentOptions = {
  template: `<kol-article-goods-link-info-tab-pane  title="{{$ctrl.title}}">
<div class="top-title">
  将商品详情页面以小程序码/二维码的形式进行传播
</div>
<ul class="qr">
  <li ng-repeat="item in $ctrl.items">
    <div class="img-ct">
      <img see-src="item.imgUrl">
    </div>
    <div class="qr-note">微信扫码预览商品</div>
    <a class="btn-download"
    ngclipboard data-clipboard-text="{{item.imgUrl}}" ng-click="$ctrl.onCopySuccess()">
    {{$index === 0 ? '下载小程序码' : '下载二维码'}}</a>
  </li>
</ul></kol-article-goods-link-info-tab-pane>`,
  controller: Controller,
  bindings: {
    items: '<',
    title: '@',
  },
};
