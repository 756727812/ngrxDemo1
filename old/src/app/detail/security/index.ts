import * as angular from 'angular'

import { securityApi } from './security-api.component'
import { securityLog } from './security-log.component'
import { securityCtrl } from './security-ctrl.component'
import { securityWarn } from './security-warn.component'
import { securityConfig } from './security-config.component'

import { modalConfigController } from './modal-config.controller'

import { securityService } from './security.service'

export default
  angular
    .module('seego.security', [])
    .component('securityApi', securityApi)
    .component('securityLog', securityLog)
    .component('securityCtrl', securityCtrl)
    .component('securityWarn', securityWarn)
    .component('securityConfig', securityConfig)

    .controller('modalConfigController', modalConfigController)

    .service('securityService', securityService)
    .name
