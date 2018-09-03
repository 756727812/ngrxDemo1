export class modalConfirmController {

  static $inject: string[] = ['$uibModalInstance', 'title', 'body', 'text_ok', 'text_cancel'];

  constructor(
    private $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance,
    private title: string,
    private body: string,
    private text_ok: string,
    private text_cancel: string,
  ) { }

  ok: () => void = () => this.$uibModalInstance.close(true);

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}

export class modalReasonController {
  reject_reason: string;
  static $inject: string[] = ['$uibModalInstance', 'title'];

  constructor(
    private $uibModalInstance: ng.ui.bootstrap.IModalServiceInstance,
    private title: string,
  ) {}

  ok: () => void = () => this.$uibModalInstance.close({ reason: this.reject_reason });

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}
