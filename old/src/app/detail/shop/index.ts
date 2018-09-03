import * as angular from 'angular'

import { shopCreate } from './shop-create.component'
import { shopManage } from './shop-manage.component'
import { shopApply } from './shop-apply.component'
import { shopGuide } from './shop-guide.component'
import { modalCheckApplyController } from './modal-check-apply.controller'
import { modalApplyInfoController } from './modal-apply-info.controller'
import { modalCheckApplyInfoController } from './modal-check-apply-info.controller'
import { shopService } from './shop.service'
import shopInfoMod from './shop-info'
import shopOperate from './shop-operate';
import { modalModifySettlementController } from './modal/modal-modify-settlement'
import { modalModifyLogsController } from './modal/modal-logs'

import './shop.less'

export default
  angular
    .module('seego.shop', [
      shopInfoMod,
      shopOperate
    ])
    .component('shopCreate', shopCreate)
    .component('shopManage', shopManage)
    .component('shopApply', shopApply)
    .component('shopGuide', shopGuide)
    .controller('modalCheckApplyController', modalCheckApplyController)
    .controller('modalApplyInfoController', modalApplyInfoController)
    .controller('modalCheckApplyInfoController', modalCheckApplyInfoController)
    .controller('modalModifySettlementController', modalModifySettlementController)
    .controller('modalModifyLogsController', modalModifyLogsController)
    .service('shopService', shopService)
    .filter('authStatus', () => (str, type) => {
      switch (str) {
        case '1':
          return '未认证'
        case '2':
          if (type == 1) {
            return '首次待审核'
          } else {
            return '再次待审核'
          }
        case '3':
          return '已认证'
        case '4':
          return '认证未通过'
        default:
          return '无需认证'
      }
    })
    .name
