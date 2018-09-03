import * as angular from 'angular'

import { xiaoeTech } from './xiaoe-tech.component'
import { modalcreateUrlController } from './modal-create-url.controller'
import { openService } from './open.service'

export default
  angular
    .module('seego.open', [])
    .component('xiaoeTech', xiaoeTech)
    .controller('modalcreateUrlController', modalcreateUrlController)
    .service('openService', openService)
    .name
