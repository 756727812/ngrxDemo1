export interface ISeeModalService {
  /**
   * 确认模态框
   *
   * @param {string} title - 模态框标题
   * @param {string} body - 模态框内容
   * @param {function} ok - 点击确定回调函数
   * @param {function} cancel - 点击取消/关闭回调函数
   * @param {string} confirm_text - 确定按钮文字
   * @param {string} cancel_text - 取消按钮文字
   */
  confirm: (title: string, body: string, ok?: Function, cancel?: Function, confirm_text?: string, cancel_text?: string | boolean) => ng.IPromise<any>;

  /**
   * 确认模态框的Promise实现
   *
   * @param {string} title - 模态框标题
   * @param {string} body - 模态框内容
   * @param {string} confirm_text - 确定按钮文字
   * @param {string} cancel_text - 取消按钮文字
   * @return {Promise} 包裹执行结果的Promise
   */
  confirmP: (title: string, body: string, confirm_text?: string | boolean, cancel_text?: string | boolean, backdrop?: string | boolean) => ng.IPromise<any>;

  /**
   * 提示模态框
   *
   * @param {string} title - 模态框标题
   * @param {string} body - 模态框内容
   * @param {function} ok - 点击确定回调函数
   * @param {string} ok_text - 确定按钮文字
   */
  alert: (title: string, body: string, ok?: Function, ok_text?: string) => ng.IPromise<any>;

  /**
   * 提示模态框的Promise实现
   *
   * @param {string} title - 模态框标题
   * @param {string} body - 模态框内容
   * @param {string} ok_text - 确定按钮文字
   * @return {Promise} 包裹执行结果的Promise
   */
  alertP: (title: string, body: string, ok_text?: string | boolean, backdrop?: string | boolean) => ng.IPromise<any>;

  needReasonP: (title: string) => ng.IPromise<any>;

}
