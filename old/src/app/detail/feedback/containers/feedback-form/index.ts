import * as angular from 'angular';
import { feedbackForm } from './feedback-form.component';
import './feedback.less';

export default angular
  .module('seego.feedback', [])
  .component('feedbackForm', feedbackForm).name;
