import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { ArticleService } from '../../services';
import { Article } from '../../models';
import { ModalArticleGoodsComponent } from '../../components';

@Component({
  selector: 'kol-article-management',
  templateUrl: 'article-management.component.html',
})
export class ArticleManagementV2 implements OnInit {
  form: FormGroup = this.fb.group({
    search: [null],
  });
  page: number = 1;
  pageSize: number = 10;
  articlesList = [];
  count: number = 0;
  loading: boolean = false;
  kolInfo: fromStore.IKolData;

  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private notificationService: NzNotificationService,
    private articleService: ArticleService,
  ) {}

  ngOnInit() {
    this.store
      .select(fromStore.getCurrentKolDataSelector)
      .subscribe(data => (this.kolInfo = data));
    this.getSeeDataArticles();
  }

  getSeeDataArticles() {
    this.loading = true;
    this.articleService
      .getSeeDataArticleList({
        page: this.page,
        size: this.pageSize,
        kolId: this.kolInfo.kolId,
        authType: 1,
        ...this.form.value,
      })
      .subscribe(
        (res: any) => {
          this.loading = false;
          this.articlesList = res.data;
          this.count = res.count;
        },
        () => {
          this.loading = false;
        },
      );
  }

  submitForm($event: UIEvent, value: any) {
    $event.preventDefault();
    this.page = 1;
    this.getSeeDataArticles();
  }

  resetForm() {
    this.form.reset();
    this.page = 1;
    this.getSeeDataArticles();
  }

  changePage() {
    this.getSeeDataArticles();
  }

  getArticleGoodsHref(item: Article) {
    this.modalService.open({
      title: '文章中的商品',
      componentParams: { articleId: item.article_id },
      wrapClassName: 'see-modal-lg',
      content: ModalArticleGoodsComponent,
      footer: false,
      maskClosable: false,
    });
  }

  isNewVersion(item) {
    return item.create_time > new Date('20180501').getTime() / 1000;
  }
}
