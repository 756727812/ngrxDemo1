import { Action } from '@ngrx/store';

import { Article, Articles } from '../../models';

// load Articles list
export const LOAD_ARTICLES = '[Kol] Load Articles';
export const LOAD_ARTICLES_FAIL = '[Kol] Load Articles Fail';
export const LOAD_ARTICLES_SUCCESS = '[Kol] Load Articles Success';

export class LoadArticles implements Action {
  readonly type = LOAD_ARTICLES;
  constructor(public payload: any) {}
}

export class LoadArticlesFail implements Action {
  readonly type = LOAD_ARTICLES_FAIL;
  constructor(public payload: any) {}
}

export class LoadArticlesSuccess implements Action {
  readonly type = LOAD_ARTICLES_SUCCESS;
  constructor(public payload: Articles) {}
}

// create Article
export const CREATE_ARTICLE = '[Kol] Create Article';
export const CREATE_ARTICLE_FAIL = '[Kol] Create Article Fail';
export const CREATE_ARTICLE_SUCCESS = '[Kol] Create Article Success';

export class CreateArticle implements Action {
  readonly type = CREATE_ARTICLE;
  constructor(public payload: any) {}
}

export class CreateArticleFail implements Action {
  readonly type = CREATE_ARTICLE_FAIL;
  constructor(public payload: any) {}
}

export class CreateArticleSuccess implements Action {
  readonly type = CREATE_ARTICLE_SUCCESS;
}

// update article
export const UPDATE_ARTICLE = '[Kol] Update Article';
export const UPDATE_ARTICLE_FAIL = '[Kol] Update Article Fail';
export const UPDATE_ARTICLE_SUCCESS = '[Kol] Update Article Success';

export class UpdateArticle implements Action {
  readonly type = UPDATE_ARTICLE;
  constructor(public payload: any) {}
}

export class UpdateArticleFail implements Action {
  readonly type = UPDATE_ARTICLE_FAIL;
  constructor(public payload: any) {}
}

export class UpdateArticleSuccess implements Action {
  readonly type = UPDATE_ARTICLE_SUCCESS;
  constructor(public payload: any) {}
}

// link microPage
export const LINK_MICROPAGE = '[Kol] Link MicroPage';
export const LINK_MICROPAGE_FAIL = '[Kol] Link MicroPage Fail';
export const LINK_MICROPAGE_SUCCESS = '[Kol] Link MicroPage Success';

export class LinkMicroPage implements Action {
  readonly type = LINK_MICROPAGE;
  constructor(public payload: { articleId: number; micropageId: number }) {}
}

export class LinkMicroPageFail implements Action {
  readonly type = LINK_MICROPAGE_FAIL;
  constructor(public payload: any) {}
}

export class LinkMicroPageSuccess implements Action {
  readonly type = LINK_MICROPAGE_SUCCESS;
}

// action types
export type ArticlesAction =
  | LoadArticles
  | LoadArticlesFail
  | LoadArticlesSuccess
  | CreateArticle
  | CreateArticleFail
  | CreateArticleSuccess
  | UpdateArticle
  | UpdateArticleFail
  | UpdateArticleSuccess
  | LinkMicroPage
  | LinkMicroPageSuccess
  | LinkMicroPageFail;
