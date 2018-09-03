import { MicroPageEffects } from './micro-page.effect';
import { CommonEffects } from './common.effect';
import { ArticleEffects } from './article.effect';
import { GoodsGroupEffects } from './goods-group.effect';

export const effects = [
  MicroPageEffects,
  CommonEffects,
  ArticleEffects,
  GoodsGroupEffects,
];

export * from './micro-page.effect';
export * from './common.effect';
export * from './article.effect';
export * from './goods-group.effect';
