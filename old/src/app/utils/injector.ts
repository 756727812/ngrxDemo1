import * as angular from 'angular';
import { NAME as SERVICE_NAME } from '../services';

const getInjector = () => angular.element(document.body).injector();

export const getInjectInstance: (string) => any = name =>
  getInjector().get(name);

export const getDataService: () => see.IDataService = () =>
  getInjectInstance(SERVICE_NAME.DATA_SERVICE);

export const getUibModal: () => ng.ui.bootstrap.IModalService = () =>
  getInjectInstance('$uibModal');

export const getSeeModal: () => see.seeModal = () =>
  getInjectInstance('seeModal');

export const getNotifcation: () => see.INotificationService = () =>
  getInjectInstance('Notification');

export const getNgLocation: () => ng.ILocationService = () =>
  getInjectInstance('$location');

export default {
  getInjectInstance,
  getDataService,
  getUibModal,
  getSeeModal,
  getNotifcation,
  getNgLocation,
};
