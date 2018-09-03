import * as fromArticles from '../actions/article.action';
import { Article } from '../../models';

export interface ArticleState {
  list: Article[];
  count: number;
  loading: boolean;
}

export const initialState: ArticleState = {
  list: [],
  count: 0,
  loading: false,
};

export function reducer(
  state = initialState,
  action: fromArticles.ArticlesAction,
): ArticleState {
  switch (action.type) {
    case fromArticles.LOAD_ARTICLES: {
      return {
        ...state,
        loading: true,
      };
    }

    case fromArticles.LOAD_ARTICLES_SUCCESS: {
      const { list, count } = action.payload;

      return {
        ...state,
        list,
        count,
        loading: false,
      };
    }

    case fromArticles.LOAD_ARTICLES_FAIL: {
      return {
        ...state,
        loading: false,
      };
    }
  }

  return state;
}

export const getArticlesList = (state: ArticleState) => state.list;
export const getArticlesLoading = (state: ArticleState) => state.loading;
export const getArticlesCount = (state: ArticleState) => state.count;
