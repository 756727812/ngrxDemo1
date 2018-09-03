import * as angular from 'angular';
import { isEmpty, merge } from 'lodash';
import * as moment from 'moment';
import * as md5 from 'md5';;

import './sell-point.less';

const map = {};

export class SellWayController {
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
    '$timeout',
    '$scope',
  ];

  appendTo: string;
  content: string;
  hideTimer: any;
  isEllipsis: boolean = false;
  unbindWatch: Function;

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
    private $timeout: ng.ITimeoutService,
    private $scope: ng.IScope,
  ) {}
  $onInit() {
    map[this.appendTo] = map[this.appendTo] || {};
  }

  detectEllipsis() {
    this.$timeout(() => {
      const txtCt = this.$element.find('.sell-point');
      const txt = this.$element.find('.txt');
      if (txtCt.length) {
        const innerWidth = txtCt.innerWidth(); // 包含 padding
        this.isEllipsis = innerWidth < txt[0].scrollWidth;
      }
      // tslint:disable-next-line:align
    }, 10);
  }

  $postLink() {
    this.detectEllipsis();
    this.unbindWatch = this.$scope.$watch(
      () => this.content,
      newVal => {
        this.detectEllipsis();
      },
    );
  }

  createHideTimer() {
    const obj = map[this.appendTo];
    if (obj.hideTimer) {
      clearTimeout(obj.hideTimer);
    }
    obj.hideTimer = setTimeout(() => {
      $(`${this.appendTo} .sell-point-tips`).hide();
      // tslint:disable-next-line:align
    }, 500);
  }

  clearHideTimer() {
    if (map[this.appendTo].hideTimer) {
      clearTimeout(map[this.appendTo].hideTimer);
    }
  }

  onMouseLeave() {
    this.createHideTimer();
  }

  $onDestroy() {
    this.clearHideTimer();
    $(`${this.appendTo} .sell-point-tips`).remove();
    this.unbindWatch && this.unbindWatch();
  }

  getTipsEl() {
    let tipsEl = $(`${this.appendTo} .sell-point-tips`);
    if (!tipsEl.length) {
      tipsEl = $(document.createElement('div'))
        .addClass('sell-point-tips')
        .appendTo(this.appendTo)
        .on('mouseenter', () => {
          this.clearHideTimer();
        })
        .on('mouseleave', () => {
          this.createHideTimer();
        });
    }
    return tipsEl;
  }

  showTips() {
    const tipsEl = this.getTipsEl();
    this.clearHideTimer();
    const elAppendTo = $(this.appendTo);

    const elTarget = this.$element.find('.sell-point');
    tipsEl
      .html(
        this.content
          .split(/\r?\n/)
          .map(p => `<p>${p}</p>`)
          .join(''),
      )
      .scrollTop(0)
      .show();
    const targetOffset = elTarget.offset();
    const ctOffset = elAppendTo.offset();

    // 如果 tips （右侧）越界，调整位置
    const tipsRightOffsetCtRight =
      targetOffset.left +
      tipsEl.outerWidth(true) -
      (ctOffset.left + elAppendTo[0].scrollWidth);

    tipsEl.css({
      left:
        targetOffset.left -
        ctOffset.left -
        (tipsRightOffsetCtRight > 0 ? tipsRightOffsetCtRight : 0),
      top:
        targetOffset.top -
        ctOffset.top -
        tipsEl.height() -
        elTarget.outerHeight(true),
    });
  }

  xxxonMouseEnter($event) {
    const elCt = $(this.appendTo);
    const elTarget = $($event.target);
    const tipsEl = this.getTipsEl();
    try {
      // 如果 tips 内容很少，就不需要 pop 显示
      const width = elTarget.innerWidth();
      if (width && width === $event.target.scrollWidth) {
        tipsEl.hide();
      } else {
        this.clearHideTimer();

        tipsEl
          .html(
            this.content
              .split(/\r?\n/)
              .map(p => `<p>${p}</p>`)
              .join(''),
          )
          .scrollTop(0)
          .show();
        const targetOffset = elTarget.offset();
        const ctOffset = elCt.offset();

        // 如果 tips （右侧）越界，调整位置
        const tipsRightOffsetCtRight =
          targetOffset.left +
          tipsEl.outerWidth(true) -
          (ctOffset.left + elCt[0].scrollWidth);

        tipsEl.css({
          left:
            targetOffset.left -
            ctOffset.left -
            (tipsRightOffsetCtRight > 0 ? tipsRightOffsetCtRight : 0),
          top:
            targetOffset.top -
            ctOffset.top -
            tipsEl.height() -
            elTarget.outerHeight(true),
        });
      }
    } catch (e) {
      tipsEl.hide();
    }
  }
}

export const goodsThemeGoodsListSellPoint: ng.IComponentOptions = {
  template: require('./sell-point.template.html'),
  controller: SellWayController,
  bindings: {
    content: '<',
    appendTo: '@',
    ownerId: '<',
  },
};
