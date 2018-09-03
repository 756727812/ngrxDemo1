export interface MicroPage {
  /** 页面 ID */
  id: number;
  /** 页面名称 */
  name: string;
  /** 创建日期 */
  createTime: string;
  /** 页面标签 0=未关联文章 1=已关联 */
  link: number;
  /** 是否是首页 0=主页 1=非主页 */
  type: number;
  /** 小店铺 ID */
  xdpId: number;
  /** 主题 ID */
  theme: number;
}

export interface MicroPages {
  /** 微页面列表 */
  list: MicroPage[];
  count: number;
}

export interface IPathsTypes {
  [key: string]: any;
}
