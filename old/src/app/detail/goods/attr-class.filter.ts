/**
 * 根据查询的一级类目ID返回对应的名称
 */
import * as angular from 'angular';
import * as _ from 'lodash';;
import { IDataService } from '../../services/data-service/data-service.interface';

export const goodsAttrClass = {
  attrClass,
};
// angular
//   .module('seego.goods')
//   .filter('attrClass', attrClass);

attrClass.$inject = ['goodsService'];
function attrClass(goodsService) {
  let data = null, serviceInvoked = false;
  filterStub['$stateful'] = true;
  return filterStub;


  function realFilter(value) {
    const result = [];
    angular.forEach(value, function (val) {
      angular.forEach(data, function (_val) {
        if (val == _val.id) result.push(_val.title);
      });
    });
    return result.join(',');
  }


  function filterStub(value) {
    if (data === null) {
      if (!serviceInvoked) {
        serviceInvoked = true;
        goodsService.getClass(function (classes) {
          data = classes;
        });
      }
      return '-';
    } else return realFilter(value);
  }

}
