import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

import './steps.less';

export class ArticleGoodsStepsController {
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

  resolve: { stepNum: Number };
  close: Function;
  dismiss: Function;
  steps: any;

  static open(stepNum) {
    const $uibModal: any = angular
      .element(document.body)
      .injector()
      .get('$uibModal');
    return $uibModal.open({
      animation: true,
      backdrop: 'static',
      size: 'kol-article-goods-steps',
      component: 'kolArticleGoodsSteps',
      windowClass: `step-${stepNum}`,
      resolve: {
        stepNum: () => stepNum,
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
  ) {}
  $onInit() {
    const STEPS = {
      COPY_ARTICLE: { summary: '复制文章', desc: '在当前页面，点击预览模板文章，复制全文至微信公众平台' },
      GET_GOODS_HREF: { summary: '获取商品链接', desc: '在当前页面获取对应商品的二维码或链接' },
      INSERT_GOODS_HREF: { summary: '文中插入商品链接', desc: '将获取的商品二维码或链接放入复制的文章' },
      INSERT_GOODS_HREF_STEP2: {
        summary: '文中插入商品链接',
        desc: '将获取的商品二维码或链接放入你的公众号推文中',
      },
    };
    if (this.resolve.stepNum === 2) {
      this.steps = [STEPS.GET_GOODS_HREF, STEPS.INSERT_GOODS_HREF_STEP2];
    } else if (this.resolve.stepNum === 3) {
      this.steps = [
        STEPS.COPY_ARTICLE,
        STEPS.GET_GOODS_HREF,
        STEPS.INSERT_GOODS_HREF,
      ];
    }
  }

  getNoStepCn(index) {
    const arr = ['一', '二', '三'];
    return `第${arr[index]}步`;
  }
}

export const kolArticleGoodsSteps: ng.IComponentOptions = {
  template: require('./steps.template.html'),
  controller: ArticleGoodsStepsController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};
