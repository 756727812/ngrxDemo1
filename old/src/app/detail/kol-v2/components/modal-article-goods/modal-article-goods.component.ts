import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { ArticleService } from '../../services';

@Component({
  selector: 'modal-article-goods',
  templateUrl: 'modal-article-goods.component.html',
})
export class ModalArticleGoodsComponent implements OnInit {
  @Input() articleId;
  page: number = 1;
  pageSize: number = 30;
  total: number = 0;
  list = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: NzMessageService,
    private articleService: ArticleService,
  ) {}

  ngOnInit() {
    this.getSeeDataArticleGoods();
  }

  getSeeDataArticleGoods(): void {
    this.loading = true;
    this.articleService
      .getSeeDataArticleGoodsList({
        page: this.page,
        size: this.pageSize,
        articleId: this.articleId,
      })
      .subscribe(
        (res: any) => {
          this.loading = false;
          this.list = res.data || [];
          this.total = res.count || 0;
        },
        () => {
          this.loading = false;
        },
      );
  }

  changePage(): void {
    this.getSeeDataArticleGoods();
  }
}
