import { createSelector } from '@ngrx/store';

import * as fromRoot from 'app/store';
import * as fromFeature from '../reducers';
import * as fromArticle from '../reducers/article.reducer';

export const getArticlesState = createSelector(
  fromFeature.getKolState,
  (state: fromFeature.KolState) => state.article,
);

export const getAllArticles = createSelector(
  getArticlesState,
  fromArticle.getArticlesList,
);

export const getArticlesCount = createSelector(
  getArticlesState,
  fromArticle.getArticlesCount,
);

export const getArticlesLoading = createSelector(
  getArticlesState,
  fromArticle.getArticlesLoading,
);
