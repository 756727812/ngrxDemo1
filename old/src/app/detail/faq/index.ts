import * as angular from 'angular';
import { faq } from './index.component';
import { faqLink } from './link.component';
import feedback from '../feedback/containers/feedback-form';

export default angular
  .module('seego.faq', [feedback])
  .component('faq', faq)
  .component('faqLink', faqLink).name;
