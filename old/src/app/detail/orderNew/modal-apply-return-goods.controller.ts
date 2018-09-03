export class modalApplyReturnGoodsController {
  form_data: {
    choice: string,
    refund_fee?: number,
  };
  errors: string[];

  static $inject: string[] = ['$uibModalInstance'];
  constructor(private $uibModalInstance: any) {
    this.errors = [];
    this.form_data = {
      choice: 'A',
    };
  }

  setAbs: () => void = () => {
    this.form_data.refund_fee = Math.abs(this.form_data.refund_fee);
  }

  ok: () => void = () => {
    if (this.form_data.choice === 'B' && !this.form_data.refund_fee) this.errors.push('请输入扣除款项的金额');
    if (this.errors.length) return;
    if (this.form_data.choice === 'A') this.form_data.refund_fee = 0;
    this.$uibModalInstance.close(this.form_data.refund_fee);
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}
