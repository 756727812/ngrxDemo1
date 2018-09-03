export class indexFlowController {
  seller_info;

  static $inject: string[] = ['$scope', 'dataService'];
  constructor(
    private $scope: ng.IScope,
    private dataService: any,
  ) { }

  $onInit() {
    this.getSellerDetail();
  }

  private getSellerDetail: () => ng.IPromise<any> = () =>
    this.dataService.seller_getSellerDetail().then(res => this.seller_info = res.data.seller_info)

}

export const indexFlow: ng.IComponentOptions = {
  template: require('./index-flow.template.html'),
  controller: indexFlowController,
};
