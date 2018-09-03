import * as angular from 'angular'

import { publishArticle } from './publish-article.component'
import { myCircleList } from './my-circle-list.component'
import { circleInfo } from './circle-info.component'
import { createCollection } from './create-collection.component'
import { editCollection } from './edit-collection.component'

import { relateCircle } from './relate-circle.component'
import { editTopic } from './edit-topic.component'
import { editTopicPublished } from './edit-topic-published.component'

import { collectionItemList } from './collection-item-list.component'
import { editCollectionItem } from './edit-collection-item.component'
import { addGoodsTags } from './add-goods-tags.component'
import { pgcCircle } from './pgc-circle.component'
import { createCircle } from './create-circle.component'
import { themeList } from './theme-list.component'
import { themeAnswer } from './theme-answer.component'
import { themeClassified } from './theme-classified.component'
import { pgcContentAnswer } from './pgc-content-answer.component'
import { replyList } from './reply-list.component'
import { addReply } from './add-reply.component'
import { commentDetail } from './comment-detail.component'
import { pgcPart } from './pgc-part.component'
import { addAnswer } from './add-answer.component'
import { createTopic } from './create-topic.componet'
import { selectGoods } from './select-goods.component'

import { topicListController } from './topic-list.controller'
import { selectGoodsPopupController } from './select-goods-popup.controller'
import { pgcThemeListController } from './pgc-theme-list.controller'
import { myPgcTopicAnswerController } from './my-pgc-topic-answer.controller'
import { modalAddPGCCircleController } from './pgc-part.component'

export default
  angular
    .module('seego.wanted', [])
    .controller('selectGoodsPopupController', selectGoodsPopupController)
    .controller('pgcThemeListController', pgcThemeListController)
    .controller('myPgcTopicAnswerController', myPgcTopicAnswerController)
    .controller('modalAddPGCCircleController', modalAddPGCCircleController)
    .controller('topicListController', topicListController)
    .component('publishArticle', publishArticle)
    .component('myCircleList', myCircleList)
    .component('circleInfo', circleInfo)
    .component('createCollection', createCollection)
    .component('editCollection', editCollection)
    .component('collectionItemList', collectionItemList)
    .component('editCollectionItem', editCollectionItem)
    .component('addGoodsTags', addGoodsTags)
    .component('pgcCircle', pgcCircle)
    .component('createCircle', createCircle)
    .component('themeList', themeList)
    .component('themeAnswer', themeAnswer)
    .component('themeClassified', themeClassified)
    .component('pgcContentAnswer', pgcContentAnswer)
    .component('replyList', replyList)
    .component('addReply', addReply)
    .component('commentDetail', commentDetail)
    .component('pgcPart', pgcPart)
    .component('addAnswer', addAnswer)
    .component('createTopic', createTopic)
    .component('relateCircle', relateCircle)
    .component('editTopic', editTopic)
    .component('editTopicPublished', editTopicPublished)
    .component('selectGoods', selectGoods)
    .factory('selectGoodsData', () => [])
    .name
