import * as angular from 'angular'

import { accountCreate } from './account-create.component'
import { accountList } from './account-list.component'
import { ModalInstanceCtrl, accountInfoModalInstanceCtrl } from './account-modal.controller'

export default
  angular
    .module('seego.account', [])
    .component('accountCreate', accountCreate)
    .component('accountList', accountList)
    .controller('ModalInstanceCtrl', ModalInstanceCtrl)
    .controller('accountInfoModalInstanceCtrl', accountInfoModalInstanceCtrl)
    .value('DefaultTags', ['法国时尚买手', '澳洲时尚买手', '欧洲时尚买手', '美国时尚买手', '日本时尚买手', '英国高街推荐', '韩国时尚买手', '运动休闲推荐',
      '少女系推荐', '奢侈品折扣推荐', '包类推荐师', '配饰推荐师', '品牌推荐家', '实力采购家', '搭配达人', '独立设计师', '热心好买手', '明星扒款手', '折扣推荐', '潮牌推荐', '其他'])
    .value('accountList', [
      {
        name: "所有",
        id: -1
      }, {
        name: "新品牌",
        id: 30
      }, {
        name: "兼职",
        id: 4
      }, {
        name: "运营",
        id: 20
      }, {
        name: "电商管理",
        id: 10
      }, {
        name: "内容兼职",
        id: 21
      }, {
        name: "超级管理员",
        id: 7
      }, {
        name: "供货",
        id: 1
      }, {
        name: "B2C",
        id: 3
      }, {
        name: "PGC",
        id: 8
      }, {
        name: "内容运营",
        id: 9
      }, {
        name: '首屏互动兼职',
        id: 23
      }, {
        name: 'KOL',
        id: 24
      }, {
        name: '市场&运营', // '流量组'
        id: 25
      }, {
        name: '投资人',
        id: 26
      }, {
        name: '流量采买',
        id: 40
      }])
    .value('accountListKolAdmin', [
      {
        name: "新品牌",
        id: 30
      }, {
        name: 'KOL',
        id: 24
      }])
    .name
