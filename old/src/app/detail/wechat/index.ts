import * as angular from 'angular'

import { wechatArticle } from './wechat-article.component'
import { wechatYuqing } from "./wechat-yuqing.component";
import { wechatMediaDashboard } from './wechat-media-dashboard.component'
import { wechatMedia } from './wechat-media.component'
import { wechatArticleDashboard } from './wechat-article-dashboard.component'

export default
  angular
    .module('seego.wechat', [])
    .component('wechatArticle', wechatArticle)
    .component('wechatYuqing', wechatYuqing)
    .component('wechatMediaDashboard', wechatMediaDashboard)
    .component('wechatMedia', wechatMedia)
    .component('wechatArticleDashboard', wechatArticleDashboard)
    .name
