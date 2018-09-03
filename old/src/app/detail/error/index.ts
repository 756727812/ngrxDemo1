import * as angular from 'angular'

import { errorSign } from './error-sign.component'

import { errorService } from './error.service'

export default
  angular
    .module('seego.error', [])
    .component('errorSign', errorSign)

    .service('errorService', errorService)
    .name
