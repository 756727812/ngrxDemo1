export interface Article {
  /** 文章ID */
  article_id: number;
  /** 文章标题 */
  title: string;
  /** 楼层 */
  floor_level: number;
  /** 上线时间 */
  start_time: number;
  /** 关联的微页面 ID */
  micropage_id: number;
  url_xiaochengxu: string;
  collection_id: number;
  kol_id: number;
  article_type: number;
  /** 是否是微页面之后创建的逻辑 1 - 是； 0 - 否 */
  article_flag: number;
}

export interface Articles {
  /** 微页面列表 */
  list: Article[];
  count: number;
}
