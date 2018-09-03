
export class modalReviewTheRefundController {
  origin_refund_fee: number;
  form_data: {
    refund_fee: number,
  };
  static $inject: string[] = ['$uibModalInstance', 'refund_fee', 'is_withdraw'];
  constructor(
    private $uibModalInstance: any,
    refund_fee: number,
    is_withdraw: number,
  ) {
    this.form_data = { refund_fee };
  }

  ok: () => void = () => this.$uibModalInstance.close(this.form_data);

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}
