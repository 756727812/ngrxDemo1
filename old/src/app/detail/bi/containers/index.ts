import './index.less';
import { BiSummaryComponent } from './summary/summary.component';
import { BiSummaryTradeBlockComponent } from './summary/trade/trade-block.component';
import { BiSummaryTopSaleBlockComponent } from './summary/top-sale/top-sale-block.component';
import { BiSummaryArticleBlockComponent } from './summary/article/article-block.component';

import { BiTradeComponent } from './trade/trade.component';
import { BiTradeDistBlockComponent } from './trade/dist-block/dist-block.component';
import { BiTradeRebuyBlockComponent } from './trade/rebuy-block/rebuy-block.component';
import { BiTradeAsBlockComponent } from './trade/as-block/as-block.component';

import { BiGoodsComponent } from './goods/goods.component';
import { BiGoodsOverviewBlockComponent } from './goods/overview/overview-block.component';
import { BiGoodsDetailBlockComponent } from './goods/detail/detail-block.component';
import { BiGoodsTrendChartComponent } from './goods/detail/chart.component';

import { BiAdminComponent } from './admin/admin.component';

export const containers: any[] = [
  BiSummaryComponent,
  BiTradeComponent,
  BiTradeDistBlockComponent,
  BiTradeRebuyBlockComponent,
  BiTradeAsBlockComponent,
  BiSummaryTradeBlockComponent,
  BiSummaryTopSaleBlockComponent,
  BiSummaryArticleBlockComponent,
  BiGoodsComponent,
  BiGoodsOverviewBlockComponent,
  BiGoodsDetailBlockComponent,
  BiGoodsTrendChartComponent,

  BiAdminComponent,
];

export * from './summary/summary.component';
export * from './trade/trade.component';
export * from './trade/dist-block/dist-block.component';
export * from './trade/rebuy-block/rebuy-block.component';
export * from './trade/as-block/as-block.component';
export * from './summary/trade/trade-block.component';
export * from './summary/top-sale/top-sale-block.component';
export * from './summary/article/article-block.component';
export * from './goods/goods.component';
export * from './goods/overview/overview-block.component';
export * from './goods/detail/detail-block.component';
export * from './goods/detail/chart.component';
export * from './admin/admin.component';
