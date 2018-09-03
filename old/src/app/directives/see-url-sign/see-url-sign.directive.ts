import { IDataService } from '../../services/data-service/data-service.interface'
import * as md5 from 'md5';
import * as angular from 'angular';

// Usage:
// <a see-url-sign href="/kol/kol-cooperation-management/{{kol_info.kol_id}}?wechat_id={{kol_info.weixin_id}}#1">
// Creates:
//

seeUrlSign.$inject = ['$location', 'dataService']
function seeUrlSign($location: ng.ILocationService, dataService: IDataService) {
  const directive = {
    link,
    restrict: 'A',
    scope: {
      seeUrlSign: '<'
    }
  };
  return directive;

  function link(scope, element, attrs) {
    if (scope.seeUrlSign !== false) {
      attrs.$observe('href', function(value) {
        if (attrs.href && attrs.href !== '' && attrs.href.indexOf('/SEE') < 0) {
          attrs.$set('href', dataService.urlSignGet(attrs.href) + attrs.href)
        }
      })
    }
  }
}


export default seeUrlSign
