import * as angular from 'angular';
import * as moment from 'moment';
import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';


export const goodsModal = {
  goodsModalService,
};

goodsModalService.$inject = ['$uibModal', 'Notification', 'dataService'];
/* @ngInject */
export function goodsModalService($uibModal, Notification, dataService: IDataService) {

  const service = {
    openDistrModal,
  };

  return service;


  function openDistrModal(item: any, type: number) {
    const modalInstance = $uibModal.open({
      animation: true,
      template: require('./modal/modal-distribution-info.html'),
      controller: 'modalDistributionInfoController',
      controllerAs: 'vm',
      backdrop: 'static',
      size: 'distr-size',
      resolve: {
        item: () => item,
        modalType: () => type,
      },
    });
    return modalInstance.result;
  }
}
