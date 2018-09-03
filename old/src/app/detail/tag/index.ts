import * as angular from 'angular'

import { tagTest } from './tag-test.component'

export default
  angular
    .module('seego.tag', [])
    .component('tagTest', tagTest)
    .name
