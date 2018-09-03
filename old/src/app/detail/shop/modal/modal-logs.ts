export class modalModifyLogsController {
    static $inject: string[] = [
        '$uibModalInstance',
    ];
    constructor(private $uibModalInstance: any){

    }
    lists:any[];
    total_items: any;
    cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');
}