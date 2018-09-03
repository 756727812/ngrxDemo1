export interface ModalLink {
  /** 小店铺的Id*/
  xdpId: string | number;

  /** 类型 0.商品 1.微页面 2.首页 */
  type: number;

  /** 商品Id or 微页面Id or首页Id*/
  typeId: number;

  /** kolId*/
  kolId: string | number;

  /** 0 日常内容推文  1.广告内容推文  2.日常贴片推文  3.广告贴片推文*/
  usageType: string | number;
}
