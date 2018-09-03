import { IDataService } from '../../services/data-service/data-service.interface';
import * as angular from 'angular';

export class modalViewQrcController {
  static $inject: string[] = ['$scope', '$q', '$uibModalInstance', 'authorizer_appid', 'url', 'dataService'];

  static open = (authorizer_appid, url) => {
    const $uibModal: any = angular.element(document.body).injector().get('$uibModal');
    return $uibModal.open({
      animation: true,
      template: require('./modal-view-qrc.html'),
      controller: modalViewQrcController,
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'md',
      resolve: {
        authorizer_appid: () => authorizer_appid,
        url: () => url,
      },
    });
  }

  constructor(
    private $scope: any,
    private $q: ng.IQService,
    private $uibModalInstance: any,
    private authorizer_appid: any,
    private url: any,
    private dataService: IDataService,
  ) {

  }

  ok: () => void = () => {
    this.$uibModalInstance.close({});
  }

  cancel: () => void = () => this.$uibModalInstance.dismiss('cancel');

}

