export interface UserIdentifyInfo {
  /** 用户 ID */
  userId: string | number;
  /**真实姓名 */
  realName: string;
  /**性别 */
  gender: string;
  /**身份证号码 */
  identifyNumber: number;
  /**身份证正面照片 */
  frontUrl: string;
  /**身份证反面照片*/
  backendUrl: string;
}
