export interface RulesData {
  /**满减类型 0.满额减 1.满件折 */
  thresholdType: number;

  /**规则数组 */
  rules: any[];

  /**上不封顶 0.是 1否*/
  capping: number;

  /**是否禁止修改满减数据 */
  isEdit: boolean;
}
