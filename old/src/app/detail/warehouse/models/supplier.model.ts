export interface Suppliers {
  list: Supplier[];
  count: number;
}

export interface Supplier {
  /** 供应商id,编辑的时候填写 */
  id?: number;
  /** 公司名字,必填 */
  companyName: string;
  /** 类型 0=品牌商,1=一级代理商,2=二级代理商,3=贸易商,必填 */
  type: 0 | 1 | 2 | 3;
  /** 联系人,必填 */
  contact: string;
  /** 联系方式,必填 */
  contactInfo: string;
  /** 地址,选填 */
  address?: string;
  /** 0=支付宝,1=银行,必填 */
  paymentMethod: 0 | 1;
  /** 支付宝账号,必填 */
  alipayAccount?: string;
  /** 开户名,必填 */
  bankAccountName?: string;
  /** 开户支行,必填 */
  bankName?: string;
  /** 开户行地址,选填 */
  bankAddress?: string;
  /** 银行卡号,必填 */
  bankAccountNo?: string;
  /** 海外账户的swift code,选填 */
  swiftCode?: string;
  /** see对接人,必填 */
  seeAccesser: string;
  /** 备注,选填 */
  remark?: string;
}
