import * as angular from 'angular';
import { seedata } from './index.component';

export default angular.module('seego.seedata', []).component('seedata', seedata)
  .name;
