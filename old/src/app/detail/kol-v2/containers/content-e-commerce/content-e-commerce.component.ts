import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CookieService } from 'ngx-cookie';
import * as allService from '../../services';
// import { ModalGoodsListComponent } from './modal-goods-list/modal-goods-list.component';
import { ModalArticleGoodsComponent } from '../../components/modal-article-goods/modal-article-goods.component';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Observable, Subscribable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-content-e-commerce',
  templateUrl: './content-e-commerce.component.html',
  styleUrls: ['./content-e-commerce.component.css'],
})
export class ContentECommerceComponent implements OnInit {
  article = { articleName: '' };
  page: number = 1;
  wechat_id: string;
  wechat_name: string;
  id: string;
  search_data = {};
  search: string = '';

  kol: any;
  kol_content: any;
  article_cur: any;
  name_cur: any;
  article_id: any;
  page_url: string;
  collection_id: any;
  article_type: any;
  item_status_type: any;
  article_list: any[] = [];
  goods_list: any[];
  list_mall_class: any[];
  selected_class: any[];
  total_items: number = 0;
  kol_table: {
    hot_head: string[];
    favor_head: string[];
  };

  status: number;

  is_kol: number;
  is_new_brand: number;
  is_inside: number;
  b_show_xiaochengurl: number;
  kol_info: any;

  xiaochengdata: any;

  block_item: number;
  seller_privilege: string;
  init_form_data: {
    title: string;
  };
  showMark: boolean[];
  xdpInfo: any = Object.create(null);

  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = true;
  _sortValue = null;
  routeParams;
  queryParams;
  fragment;
  _table_show = true;

  constructor(
    private commonService: allService.CommonService,
    // private observable:Observable<any>,
    // private subscribeble: Subscribable<any>,
    // private $routeParams: ng.route.IRouteParamsService,
    // private $location: ng.ILocationService,
    private cookies: CookieService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private modalService: NzModalService,
  ) {}

  getAvatarUrl() {
    return _.result(
      this,
      'kol.avatar',
      '//static.seecsee.com/seego_plus/images/icons/logo.png',
    );
  }

  ngOnInit() {
    this.handleRedirectFromTheme();
    // TODO 注入一个 value，避免每次都调 this.$cookies.get
    this.seller_privilege = this.cookies.get('seller_privilege');

    this.selected_class = [];
    this.list_mall_class = [];

    this.kol_info = [];
    this.is_kol =
      this.cookies.get('seller_privilege') === '24' ||
      this.cookies.get('seller_privilege') === '30'
        ? 1
        : 0;
    this.is_new_brand = this.cookies.get('seller_privilege') === '30' ? 1 : 0;
    this.is_inside =
      this.cookies.get('seller_privilege') === '7' ||
      this.cookies.get('seller_privilege') === '10'
        ? 1
        : 0;
    this.block_item = 1;
    this.b_show_xiaochengurl = 0;
    this.xiaochengdata = null;
    if (this.is_new_brand) {
      this.commonService.shop_checkCurrentStatus({}).subscribe(res => {
        this.xiaochengdata = res.data;
        console.log(this.xiaochengdata);
        if (Number(this.xiaochengdata.type) === 3) {
          this.block_item = 0;
        }
        if (
          Number(this.xiaochengdata.type) === 3 &&
          Number(this.xiaochengdata.manager_status) === 80
        ) {
          this.b_show_xiaochengurl = 1;
        }
      });
    }

    // this.page_url = this.$location.url();
    this.page_url = this.location.path();
    this.page_url = encodeURIComponent(this.page_url);
    console.log(this.route);
    console.log(this.location);

    this.route.params.subscribe(params => {
      this.routeParams = params;
    });
    this.route.queryParams.subscribe(queryParams => {
      this.queryParams = queryParams;
      // this.search_data.keyword = queryParams.hasOwnProperty('keyword') && this.queryParams.keyword;
    });
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log(fragment);
    });
    const routeParams = this.queryParams;

    this.page = routeParams['page'] || 1;
    this.id = this.routeParams.kolId;

    this.wechat_id = routeParams['wechat_id'] || '';
    this.status = routeParams['status'] || '1';

    // 获取微信号
    if (Number(this.id) > 0) {
      this.commonService.seller_getSellerDetail(false).subscribe(({ data }) => {
        // wx_official_name; // 名称
        // wx_official_account; // 公众号微信号
        const { wx_official_name, wx_official_account } = data.seller_info;
        this.wechat_id = wx_official_account;
        this.wechat_name = wx_official_name;
      });
    }

    if (Number(this.id) === -1) {
      return;
    }

    // this.search_data = {
    //   keyword: routeParams['keyword'],
    //   article_id: routeParams['article_id'],
    //   collection_id: routeParams['collection_id'] || 0,
    //   act_type: routeParams['act_type'] || '',
    //   rank_type: routeParams['rank_type'] || '0',
    // };

    this.kol_table = {
      hot_head: ['排名', '品牌名', '评分'],
      favor_head: ['排名', '品类', '百分比'],
    };

    let promises = [];
    // 要添加权限，在请求前先处理
    this.commonService
      .getKolInfo({
        kol_id: this.id,
      })
      .subscribe(res => {
        if (res.result === 1) {
          const xdpInfo = _.get(
            res.data,
            'kol_info.xdp_info',
            Object.create(null),
          );
          this.xdpInfo = xdpInfo;
          promises = [this.getArticleList()];
          if (this.wechat_id !== '') {
            // promises.push(this.getKOLDetailBase());
          }
          this.kol_info = res.data.kol_info;
        } else {
        }
      });
  }

  /*
  主题商品列表 ---售卖--> 内容电商
  确认公众号填写->选择文章
  */
  handleRedirectFromTheme() {
    // if (GoodsListCtrl.isComeFromTheme()) {
    //   this.confirmWechatAccountInfo().then(data => {
    //     // TODO 此时刷新页面会重复打开文章选择，是否要通过 sessionstorage
    //     ArticelPickerController.openForAddThemeAllGoods(
    //       this.$routeParams.themeId,
    //     ) //
    //       .then(({ article }) => {
    //         this.$window.location.href = this.getArticleGoodsHref(article);
    //       });
    //   });
    // }
  }

  private getArticleList: (
    page_size?: number,
    all?: number,
    article_id?: number,
  ) => void = (size = 10, all = 0, article_id = 0) => {
    let cur_page = this.page;
    if (size >= 999) {
      cur_page = 1;
    }
    this.commonService
      .kol_mgr_articleList_v2({
        size,
        page: cur_page,
        kolId: this.id,
        ...this.search_data,
      })
      .subscribe(res => {
        this._loading = false;
        // this._pageSize = res.data.page_size;
        this.total_items = res.count;
        this.article_list = res.data;
        // this.article_list=[]; // 演示空数据用
        this.controlContentVisible();
        return this.article_list;
      });
  };

  refreshData(reset = false) {
    if (reset) {
      this.page = 1;
    }
    this._loading = true;
    this.getArticleList(this._pageSize);
  }

  // 搜索
  submitSearch() {
    this._table_show = true;
    this.search_data = {
      search: this.search,
    };

    // this.router.navigate(['/kol-v2/kol-cooperation-management/' + this.id], {
    //   queryParams: this.search_data,
    // });

    this._loading = true;
    this.page === 1 ? this.getArticleList(this._pageSize) : (this.page = 1);
  }

  showSteps() {
    this.isVisibleMiddle = true;
  }

  isVisibleMiddle = false;

  stepData = [
    {
      id: 1,
      step: '第一步',
      title: '获取商品链接',
      description: '在“商品管理”栏目下获取商品链接',
    },
    {
      id: 2,
      step: '第二步',
      title: '文中插入商品链接',
      description: '将获取的商品链接放入你的公众号推文中',
    },
    {
      id: 3,
      step: '第三步',
      title: '发文后查看数据',
      description: '公众号发文后，点击“刷新文章”查看文章商品售卖数据',
    },
  ];

  handleCancelMiddle = () => {
    this.isVisibleMiddle = false;
  };

  controlContentVisible() {
    if (this.page === 1) {
      if (this.search || this.queryParams.search) {
        this._table_show = true;
        // this._table_show=this.article_list.length>0;
      } else {
        this._table_show = this.article_list.length > 0;
      }
    } else {
      this._table_show = true;
    }
  }

  showGoodsList(item) {
    // const option = {
    //   kol_id: item.kol_id,
    //   filter_class_id:
    //     (this.selected_class.length &&
    //       JSON.stringify(this.selected_class.map(o => o.class_id))) ||
    //     undefined,
    //   filter_info: JSON.stringify({
    //     item_status_type: '1',
    //     article_id: item.article_id,
    //     article_type: this.article_type,
    //     collection_id: this.xdpInfo.collection_id,
    //     rank_type: this.queryParams['rank_type'] || '0',
    //   }),
    // };
    const subscription = this.modalService.open({
      title: '文章中商品',
      content: ModalArticleGoodsComponent,
      componentParams: { articleId: item.article_id },
      width: '900px',
      footer: false,
      maskClosable: true,
    });
  }

  showGoodsLink() {
    this.router.navigate(['/goods/all']);
  }
}
