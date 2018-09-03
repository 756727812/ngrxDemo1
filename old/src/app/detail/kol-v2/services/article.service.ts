import { Injectable } from '@angular/core';
import { _HttpClient, getData, throwObservableError } from '@shared/services';
import { MicroPages, Articles, Article, IPathsTypes } from '../models';

import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ArticleService {
  get loading() {
    return this.http.loading;
  }

  constructor(private http: _HttpClient) {}

  getArticlesList({
    page,
    pageSize: page_size,
    keyword,
    kolId: kol_id,
  }): Observable<Articles> {
    return this.http
      .post('api/kol_mgr/articleList', {
        formdata: {
          page,
          page_size,
          kol_id,
          filter_info: JSON.stringify({ keyword, article_type: 1 }),
          is_get_key: 0,
        },
      })
      .pipe(
        map(getData),
        catchError(throwObservableError),
      );
  }

  getArticleItem(formdata): Observable<Article> {
    return this.http.post('api/kol_mgr/articleGet', { formdata }).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  // article_info: {"title":"标题","start_time":1524153600,"floor_level":"0","url":"http://mp.weixin.qq.com/s/J8r_bs-8DdQl68Tz4SjOkA","article_type":1,"from_type":1,"kol_id":"147"}
  addArticle(formdata): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/kol_mgr/articleAdd', {
        formdata: {
          article_info: JSON.stringify({
            ...formdata,
            article_type: 1,
            from_type: 1,
          }),
        },
      })
      .pipe(catchError(throwObservableError));
  }

  // article_info: {"kol_id":"147","article_id":"722","floor_level":"1","title":"标题1","url":"http://mp.weixin.qq.com/s/OpH5xSf7m6gSblEOXM4grA","from_type":1,"from_collection_id":"0","act_order":"0","act_gmv":"0","from_article_id":"0","start_time":1524240000,"article_type":1}
  editArticle(formdata): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/kol_mgr/articleSet', {
        formdata: {
          article_info: JSON.stringify({
            ...formdata,
            article_type: 1,
            from_type: 1,
          }),
        },
      })
      .pipe(catchError(throwObservableError));
  }

  linkMicropage(body): Observable<see.ICommonResponse<any>> {
    return this.http
      .post('api/ng/article/micropage/link', { body })
      .pipe(catchError(throwObservableError));
  }

  getArticleKolLinks(params): Observable<IPathsTypes> {
    return this.http.get('api/ng/pathAQrUrl/getKolArticle', params).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  getArticleKolLinksOld(params): Observable<IPathsTypes> {
    return this.http.get('api/ng/pathAQrUrl/getKolCollection', params).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }

  getSeeDataArticleList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/ng/data/article/list', params)
      .pipe(catchError(throwObservableError));
  }

  getSeeDataArticleGoodsList(params): Observable<see.ICommonResponse<any>> {
    return this.http
      .get('api/ng/data/article/item/list', params)
      .pipe(catchError(throwObservableError));
  }

  getSeeDataIskolExist(params): Observable<see.ICommonResponse<any>> {
    return this.http.get('/api/ng/data/check/kolExist', params).pipe(
      map(getData),
      catchError(throwObservableError),
    );
  }
}
