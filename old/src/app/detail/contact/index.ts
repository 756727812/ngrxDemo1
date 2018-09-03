import * as angular from 'angular'

import { contactCenter } from './contact-center.component'
import { contactDaily } from './contact-daily.component'
import { contactLogistic } from './contact-logistic.component'
import { contactShop } from './contact-shop.component'
import './contact.less'

export default
  angular
    .module('seego.contact', [])
    .component('contactCenter', contactCenter)
    .component('contactDaily', contactDaily)
    .component('contactLogistic', contactLogistic)
    .component('contactShop', contactShop)
    .name
