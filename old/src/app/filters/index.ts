import * as angular from 'angular'

import { dateFormat } from './date-format/date-format.filter'
import { findDataInArray } from './find-data-in-array/find-data-in-array.filter'
import { fixdata } from './fixdata/fixdata.filter'
import { formatArray } from './format-array/format-array.filter'
import { isEmptyObject } from './is-empty-object/is-empty-object.filter'
import { moreContent } from './more-content/more-content.filter'
import { percentage } from './percentage/percentage.filter'
import { propsFilter } from './props-filter/props-filter.filter'
import { RMBmoney } from './RMBmoney/RMBmoney.filter'
import { trustHtml } from './trust-html/trust-html.filter'
import { httpUrl } from './http.filter'
import { deviceType } from './deviceType.filter'
import { dateConstructor } from './date-constructor/date-constructor.filter'

export default
  angular
    .module('seego.filters', [])
    .filter('fixdata', fixdata)
    .filter('dateFormat', dateFormat)
    .filter('RMBmoney', RMBmoney)
    .filter('findDataInArray', findDataInArray)
    .filter('formatArray', formatArray)
    .filter('isEmptyObject', isEmptyObject)
    .filter('moreContent', moreContent)
    .filter('percentage', percentage)
    .filter('propsFilter', propsFilter)
    .filter('trustHtml', trustHtml)
    .filter('httpUrl', httpUrl)
    .filter('deviceType', deviceType)
    .filter('dateConstructor', dateConstructor)
    .name
