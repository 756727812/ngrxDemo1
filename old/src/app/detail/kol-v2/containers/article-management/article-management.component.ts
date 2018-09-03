import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { ArticleService } from '../../services';
import { Article } from '../../models';
import {
  ModalArticleModelComponent,
  ModalLinksComponent,
} from '../../components';
import { ModalArticleLinkToMicroPageComponent } from '../modal-article-link-to-micro-page/modal-article-link-to-micro-page.component';

@Component({
  selector: 'kol-article-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'article-management.component.html',
})
export class ArticleManagement implements OnInit {
  form: FormGroup = this.fb.group({
    keyword: [null],
  });
  page: number = 1;
  pageSize: number = 30;
  articles$: Observable<Article[]>;
  count$: Observable<number>;
  loading$: Observable<boolean>;
  kolInfo: fromStore.IKolData;

  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit() {
    this.articles$ = this.store.select(fromStore.getAllArticles);
    this.count$ = this.store.select(fromStore.getArticlesCount);
    this.loading$ = this.store.select(fromStore.getArticlesLoading);
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));

    this.route.queryParams.subscribe((params: Params) => {
      const { keyword, page = 1, pageSize = 30 } = params;
      this.page = page >>> 0;
      this.pageSize = pageSize >>> 0;
      this.form.patchValue({
        keyword,
      });
      this.store.dispatch(
        new fromStore.LoadArticles({
          keyword,
          page,
          pageSize,
        }),
      );
    });
  }

  submitForm($event: UIEvent, value: any) {
    $event.preventDefault();

    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: {
        ...this.form.value,
        page: 1,
        pageSize: this.pageSize,
      },
    });
  }

  resetForm() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: 1, pageSize: this.pageSize },
    });
  }

  changePage() {
    this.router.navigate(['.'], {
      relativeTo: this.route,
      queryParams: { page: this.page, pageSize: this.pageSize },
      queryParamsHandling: 'merge',
    });
  }

  add() {
    this.openModal('创建文章').subscribe(result => {
      if (result.action === 'add') {
        this.store.dispatch(new fromStore.CreateArticle(result.value));
      }
    });
  }

  edit(item: Article) {
    this.openModal('编辑文章', { item }).subscribe(result => {
      if (result.action === 'edit') {
        this.store.dispatch(
          new fromStore.UpdateArticle({
            ...result.value,
            article_id: item.article_id,
          }),
        );
      }
    });
  }

  links(article: Article) {
    if (!article.micropage_id && Number(article.article_flag) === 1) {
      this.notificationService.warning('警告', '请先将文章关联页面！');
      return;
    }
    this.modalService.open({
      title: '微页面链接',
      componentParams: { article },
      content: ModalLinksComponent,
      wrapClassName: 'see-modal-lg',
      maskClosable: false,
    });
  }

  linkTo(item: Article) {
    let selectedId;
    this.modalService
      .open({
        title: '关联页面',
        componentParams: { microPageId: Number(item.micropage_id) },
        content: ModalArticleLinkToMicroPageComponent,
        maskClosable: false,
        onOk: () => {
          this.store.dispatch(
            new fromStore.LinkMicroPage({
              articleId: item.article_id,
              micropageId: selectedId,
            }),
          );
        },
      })
      .subscribe(data => {
        if (data.action === 'SELECT') {
          selectedId = data.id;
        }
      });
  }

  getArticleGoodsHref(item: Article) {
    const map = {
      wechat_id: this.kolInfo.wechatId,
      article_id: item.article_id,
      article_type: item.article_type,
      collection_id: item.collection_id,
      page: 1,
    };
    const qs = Object.entries(map)
      .map(e => e.join('='))
      .join('&');
    return `/kol/kol-cooperation-management/${this.kolInfo.kolId}?${qs}#2`;
  }

  isNewVersion(item) {
    return item.create_time > new Date('20180501').getTime() / 1000;
  }

  private openModal(title: string, componentParams?: { [key: string]: any }) {
    return this.modalService.open({
      title,
      componentParams,
      content: ModalArticleModelComponent,
      footer: false,
      maskClosable: false,
    });
  }
}
