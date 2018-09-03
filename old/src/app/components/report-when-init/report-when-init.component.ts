import { IReportService } from '../../services/report-service/report-service.interface';

export class Controller {

  static $inject: string[] = ['reportService'];

  name: string;

  constructor(
    private reportService: IReportService,
  ) {
  }

  $onInit() {
    console.log(this.name);
    this.reportService.reportByKey(this.name);
  }
}


export const reportWhenInit: ng.IComponentOptions = {
  template: `<ng-transclude></ng-transclude>`,
  transclude: true,
  controller: Controller,
  bindings: {
    name: '@',
  },
};
