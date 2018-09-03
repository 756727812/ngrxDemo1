import { MicroPageService } from './micro-page.service';
import { CommonService } from './common.service';
import { ArticleService } from './article.service';
import { GoodsGroupService } from './goods-group.service';
import { StoreConfigService } from './store-config.service';
import { CateNavService } from './cate-nav.service';
import { BaseInfoService } from './base-info.service';
import { ModalLinkService } from './modal-link.service';
import { GoodsManageService } from './goods-manage.service';
export const services = [
  MicroPageService,
  CommonService,
  ArticleService,
  GoodsGroupService,
  StoreConfigService,
  CateNavService,
  BaseInfoService,
  ModalLinkService,
  GoodsManageService,
];

export * from './micro-page.service';
export * from './common.service';
export * from './article.service';
export * from './goods-group.service';
export * from './store-config.service';
export * from './cate-nav.service';
export * from './base-info.service';
export * from './modal-link.service';
export * from './goods-manage.service';
