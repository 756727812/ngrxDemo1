import * as angular from 'angular';
import ngSpinnerLoader from './spinner-loader/spinner-loader.directive';
import iCheck from './i-check/i-check.directive';
import seePaginationConfig from './pagination/see-pagination-config.constant';
import seePaging from './pagination/see-paging.service';
import seePaginationController from './pagination/see-pagination.controller';
import pagination from './pagination/pagination.directive';
import seeTabindexToggle from './pagination/see-tabindex-toggle.directive';
import script from './script/script.directive';
import seeAccess from './see-access/see-access.directive';
import seeHide from './see-access/see-hide.directive';
import seeEditable from './see-editable/see-editable.directive';
import seeGoods from './see-goods/see-goods.directive';
import seeImg from './see-img/see-img.directive';
import webPService from './see-src/webP.service';
import seeSrc from './see-src/see-src.directive';
import seeTab from './see-tab/see-tab.directive';
import seeTabset from './see-tab/see-tabset.directive';
import seeViewer from './see-viewer/see-viewer.directive';
import seeFileSelect from './see-file-select/see-file-select.directive';
import { datetime as datetimeService } from './datetime/datetime.service';
import { datetime as datetimeDirective } from './datetime/datetime.directive';
import seeAuthFileSelect from './see-file-select/see-auth-file-select.directive';
import ueditor from './ueditor/ueditor.directive';
import seeUrlSign from './see-url-sign/see-url-sign.directive';
import formValidator from './formValidator/formValidator';
import seeCheckbox from './see-checkbox/see-checkbox.directive';
import seeMulCheck from './see-checkbox/see-mul-check.directive';
import seeRadioGroup from './see-checkbox/see-radio-group.directive';
import inputMask from './input-mask/input-mask.directive';
import seeSelect from './see-select/see-select.directive';
import dateRangePickerDirty from './date-range-picker-dirty/date-range-picker-dirty.directive';
import inputFileDirty from './input-file-dirty/input-file-dirty.directive';
import textareaAutosize from './textarea-autosize/textarea-autosize.directive';
import loadingMask from './loading-mask/loading-mask.directive';
import inputClear from './input-clear/input-clear.directive';
import highlightKeyword from './highlight-keyword/highlight-keyword.directive';
import seeDateRangePicker from './see-date-range-picker/see-date-range-picker.directive';
import report from './report/report.directive';
import nonNegativeOnly from './non-negative-only';
import integerOnly from './integer-only';
import numbersOnly from './numbers-only/numbers-only.directive';
import {
  dateRangePickerConfig,
  dateRangePicker,
} from './daterangepicker/daterangepicker.directive';

export default angular
  .module('seego.directives', [formValidator])
  .directive('inputFileDirty', inputFileDirty)
  .directive('dateRangePickerDirty', dateRangePickerDirty)
  .directive('inputMask', inputMask)
  .directive('seeSelect', seeSelect)
  .directive('ngSpinnerLoader', ngSpinnerLoader)
  .directive('icheck', iCheck)
  .constant('seePaginationConfig', seePaginationConfig)
  .factory('seePaging', seePaging)
  .controller('seePaginationController', seePaginationController)
  .directive('pagination', pagination)
  .directive('seeTabindexToggle', seeTabindexToggle)
  .directive('script', script)
  .directive('seeAccess', seeAccess)
  .directive('seeHide', seeHide)
  .directive('seeEditable', seeEditable)
  .directive('seeGoods', seeGoods)
  .factory('webPService', webPService)
  .directive('seeSrc', seeSrc)
  .directive('seeImg', seeImg)
  .directive('seeTab', seeTab)
  .directive('seeTabset', seeTabset)
  .directive('seeViewer', seeViewer)
  .directive('seeFileSelect', seeFileSelect)
  .directive('seeAuthFileSelect', seeAuthFileSelect)
  .factory('datetime', datetimeService)
  .directive('datetime', datetimeDirective)
  .directive('ueditor', ueditor)
  .directive('seeUrlSign', seeUrlSign)
  .directive('seeCheckbox', seeCheckbox)
  .directive('seeDateRangePicker', seeDateRangePicker)
  .directive('seeMulCheck', seeMulCheck)
  .directive('seeRadioGroup', seeRadioGroup)
  .directive('textareaAutosize', textareaAutosize)
  .directive('loadingMask', loadingMask)
  .directive('inputClear', inputClear)
  .directive('highlightKeyword', highlightKeyword)
  .directive('report', report)
  .directive('nonNegativeOnly', nonNegativeOnly)
  .directive('integerOnly', integerOnly)
  .directive('numbersOnly', numbersOnly)
  .constant('dateRangePickerConfig', dateRangePickerConfig)
  .directive('dateRangePicker', dateRangePicker).name;
