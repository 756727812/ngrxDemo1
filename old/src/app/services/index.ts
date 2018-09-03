import * as angular from 'angular';

import { applicationService } from './application/application.service';
import { seeUpload } from './see-upload/see-upload.service';
import { assertService } from './assert-service/assert.service';
import { DataService } from './data-service/data-service';
import { Notification } from './notification/notification.service';
import { pluginsService } from './plugins-service/plugins.service';
import { seeModal } from './see-modal/see-modal.service';
import { modalConfirmController, modalReasonController } from './see-modal/see-modal.controller';
import { ReportService } from './report-service/report-service';

export const NAME = {
  ASSERT_SERVICE:'assertService',
  PLUGINS_SERVICE:'pluginsService',
  APPLICATION_SERVICE:'applicationService',
  NOTIFICATION:'Notification',
  DATA_SERVICE:'dataService',
  SEE_MODAL:'seeModal',
  SEE_UPLOAD:'seeUpload',
  REPORT_SERVICE:'reportService',
};

export default
  angular
    .module('seego.services', [])
    .factory(NAME.ASSERT_SERVICE, assertService)
    .factory(NAME.PLUGINS_SERVICE, pluginsService)
    .factory(NAME.APPLICATION_SERVICE, applicationService)
    .service(NAME.NOTIFICATION, Notification)
    .service(NAME.DATA_SERVICE, DataService)
    .service(NAME.SEE_MODAL, seeModal)
    .service(NAME.SEE_UPLOAD, seeUpload)
    .service(NAME.REPORT_SERVICE, ReportService)
    .controller('modalConfirmController', modalConfirmController)
    .controller('modalReasonController', modalReasonController)
    .name;
