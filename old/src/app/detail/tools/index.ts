import * as angular from 'angular';

import { qrcCreate } from './qrc-create.component';
import { virtualOrder } from './virtual-order.component';
import { modalAddVirtualOrderController } from './modal-add-virtual-order.controller';
import { toolsService } from './tools.service';
import { dataCrawling } from './data-crawling.component';

export default angular
  .module('seego.tools', [])
  .component('qrcCreate', qrcCreate)
  .component('craw', dataCrawling)
  .component('virtualOrder', virtualOrder)
  .controller('modalAddVirtualOrderController', modalAddVirtualOrderController)

  .service('toolsService', toolsService).name;
