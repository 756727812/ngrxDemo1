import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';

import * as fromRoot from 'app/store';
import * as articleActions from '../actions/article.action';
import * as fromServices from '../../services';
import * as fromSelectors from '../selectors';

@Injectable()
export class ArticleEffects {
  constructor(
    private store: Store<fromRoot.State>,
    private actions$: Actions,
    private articleService: fromServices.ArticleService,
    private message: NzMessageService,
  ) {}

  @Effect()
  loadArticles$ = this.actions$.ofType(articleActions.LOAD_ARTICLES).pipe(
    map((action: articleActions.LoadArticles) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([search, { kolId }]) => {
      return this.articleService
        .getArticlesList({
          ...search,
          kolId,
        })
        .pipe(
          map(articles => new articleActions.LoadArticlesSuccess(articles)),
          catchError(error => of(new articleActions.LoadArticlesFail(error))),
        );
    }),
  );

  @Effect()
  createArticle$ = this.actions$.ofType(articleActions.CREATE_ARTICLE).pipe(
    map((action: articleActions.CreateArticle) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([formdata, { kolId: kol_id }]) => {
      return this.articleService
        .addArticle({ ...formdata, kol_id })
        .pipe(
          map(res => new articleActions.CreateArticleSuccess()),
          catchError(error => of(new articleActions.CreateArticleFail(error))),
        );
    }),
  );

  @Effect()
  updateArticle$ = this.actions$.ofType(articleActions.UPDATE_ARTICLE).pipe(
    map((action: articleActions.UpdateArticle) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([formdata, { kolId: kol_id }]) => {
      return this.articleService
        .editArticle({ ...formdata, kol_id })
        .pipe(
          map(res => new articleActions.UpdateArticleSuccess(res.data)),
          catchError(error => of(new articleActions.UpdateArticleFail(error))),
        );
    }),
  );

  @Effect()
  linkMicroPage$ = this.actions$.ofType(articleActions.LINK_MICROPAGE).pipe(
    map((action: articleActions.LinkMicroPage) => action.payload),
    withLatestFrom(this.store.select(fromSelectors.getCurrentKolDataSelector)),
    switchMap(([body, { kolId }]) => {
      return this.articleService
        .linkMicropage({ ...body, kolId })
        .pipe(
          map(() => new articleActions.LinkMicroPageSuccess()),
          catchError(error => of(new articleActions.LinkMicroPageFail(error))),
        );
    }),
  );

  @Effect()
  handleOperationSuccess$ = this.actions$
    .ofType(
      articleActions.CREATE_ARTICLE_SUCCESS,
      articleActions.UPDATE_ARTICLE_SUCCESS,
      articleActions.LINK_MICROPAGE_SUCCESS,
    )
    .pipe(
      withLatestFrom(this.store.select(fromRoot.getRouterState)),
      map(
        ([
          action,
          { state: { queryParams: { keyword, page = 1, pageSize = 30 } } },
        ]) => {
          this.message.success('操作成功！');
          return new articleActions.LoadArticles({
            keyword,
            page,
            pageSize,
          });
        },
      ),
    );
}
