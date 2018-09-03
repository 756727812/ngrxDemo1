import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import * as fromMicroPage from './micro-page.reducer';
import * as fromCommon from './common.reducer';
import * as fromArticle from './article.reducer';
import * as fromGoodsGroup from './goods-group.reducer';

export interface KolState {
  microPage: fromMicroPage.MicroPageState;
  common: fromCommon.CommonState;
  article: fromArticle.ArticleState;
  goodsGroup: fromGoodsGroup.GoodsGroupState;
}

export const reducers: ActionReducerMap<KolState> = {
  microPage: fromMicroPage.reducer,
  common: fromCommon.reducer,
  article: fromArticle.reducer,
  goodsGroup: fromGoodsGroup.reducer,
};

export const getKolState = createFeatureSelector<KolState>('kol');
