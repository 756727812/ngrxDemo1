import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { accessChecker } from '@utils';

const TABS = [
  {
    heading: '页面装修',
    children: [
      {
        heading: '微页面',
        path: 'micro-page',
      },
      {
        heading: '商品分组',
        path: 'goods-group',
      },
      {
        heading: '店铺配置',
        path: 'store-config',
      },
      {
        heading: '分类导航',
        path: 'cate-nav',
      },
    ],
  },
  {
    heading: '文章管理',
    path: 'article',
  },
  {
    heading: '商品管理',
    path: 'goods',
  },
  {
    heading: '营销工具',
    path: 'marketing-tools',
  },
  {
    heading: '数据中心',
    path: 'bi',
    queryParams: ['kolId'],
  },
];

@Component({
  selector: 'kol-cooperation-management',
  templateUrl: 'cooperation-management.component.html',
  styleUrls: ['cooperation-management.component.less'],
})
export class CooperationManagementComponent implements OnInit {
  tabs = TABS;
  kolInfo: fromStore.IKolData;
  articleCount$: Observable<number>;
  get isAdmin() {
    return accessChecker.isAdmin();
  }

  constructor(private store: Store<fromStore.KolState>) {}

  ngOnInit() {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
    // this.getIsShowArticleMenu();
  }

  isSubMenuOpen(...paths: string[]) {
    return paths.some(path => window.location.pathname.includes(path));
  }

  getIsShowArticleMenu() {
    this.articleCount$ = this.store.select(fromStore.getArticlesCount);
    this.store.dispatch(
      new fromStore.LoadArticles({
        keyword: '',
        page: 1,
        pageSize: 30,
      }),
    );
  }
  getQueryParams(tabOrPath) {
    let tab = tabOrPath;
    if (typeof tab === 'string') {
      tab = (TABS as any).find(t => t.path === tab);
    }
    if (!tab.queryParams) {
      return null;
    }
    return tab.queryParams.reduce(
      (acc, value) => ({
        ...acc,
        [value]: this.kolInfo[value],
      }),
      Object.create(null),
    );
  }
}
