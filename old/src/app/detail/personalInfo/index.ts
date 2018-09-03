import * as angular from 'angular'

import { indexAccount } from './index-account.component'
import { indexCircle } from './index-circle.component'
import { indexFlow } from './index-flow.component'
import { indexIm } from './index-im.component'
import { modifyInfo } from './modify-info.component'
import { modifyKolInfo } from './modify-kol-info.component'
import { modifyPwd } from './modify-pwd.component'
import { modifyUser } from './modify-user.component'
import { modifyAccount } from './modify-account.component'
import { modifyLoginInfo } from './modify-login-info.component'
import { msgCenter } from './msg-center.component'
import { verificationList } from './verification/verification-list.component'
import { verificationImgUploader } from './verification/img-uploader.component'


export default
  angular
    .module('seego.personalInfo', [])
    .component('indexAccount', indexAccount)
    .component('indexCircle', indexCircle)
    .component('indexFlow', indexFlow)
    .component('indexIm', indexIm)
    .component('msgCenter', msgCenter)
    .component('modifyInfo', modifyInfo)
    .component('modifyKolInfo', modifyKolInfo)
    .component('modifyPwd', modifyPwd)
    .component('modifyUser', modifyUser)
    .component('modifyAccount', modifyAccount)
    .component('modifyLoginInfo', modifyLoginInfo)
    .component('verificationList', verificationList)
    .component('verificationImgUploader', verificationImgUploader)
    .name
