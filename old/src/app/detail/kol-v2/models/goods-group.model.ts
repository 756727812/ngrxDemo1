export interface GoodsGroup {
  /** 分组类型 1 - 自动  2 - 手动 */
  type: 1 | 2;
  /** 是否是 系统默认 1 - 是 */
  isSystem: 1 | 0;
  /** 分组名称 */
  categoryName: string;
  /** 分组ID */
  categoryId: number;
  /** 商品数 */
  commodityCount: number;
  /** 创建时间 */
  createTime: number;
}

export interface GoodsGroups {
  /** 微页面列表 */
  list: GoodsGroup[];
  count: number;
}

export interface GoodsGroupSearch {
  kolId?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface GoodsAddOrRemoveInCategoryParams {
  categoryId: number;
  commodityId: number;
  kolId?: number;
}

export interface GroupGoods {
  /** 商品 ID */
  itemId: number;
  /** 商品图 */
  imgUrl: string;
  /** 商品名 */
  commodityName: string;
  /** 品牌 */
  brandName: string;
  /** 价格 */
  price: number;
  /** 是否已添加到当前分组 */
  selected: boolean;
}

export interface GroupGoodsData {
  list: GroupGoods[];
  count: number;
}
