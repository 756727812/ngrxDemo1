export interface INotificationService {

  /**
   * 信息提示框
   *
   * @param text 提示框中的文字内容
   */
  info: (text: string, timeout?: number | boolean) => void

  /**
   * 成功提示框
   *
   * @param text 提示框中的文字内容
   */
  success: (text?: string, timeout?: number | boolean) => void

  /**
   * 警告提示框
   *
   * @param text 提示框中的文字内容
   */
  warn: (text: string, timeout?: number | boolean) => void

  /**
   * 数据错误提示框，样式同警告提示框，不会自动消失
   *
   * @param text 提示框中的文字内容，格式：抱歉！+文本内容
   */
  error: (text: string, timeout?: number | boolean) => void

  /**
   * 数据错误提示框，样式同警告提示框，不会自动消失
   *
   * @param text 提示框中的文字内容，格式：抱歉！+文本内容
   */
  dataError: (text: string) => void

  /**
   * 服务器错误提示框，不会自动消失
   *
   * @param text 提示框中的文字内容
   */
  serverError: (text?: any) => void

  /**
   * 信息提示框
   *
   * @param text 提示框中的文字内容
   */
}
