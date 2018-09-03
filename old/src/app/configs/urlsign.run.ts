import { IDataService } from '../services/data-service/data-service.interface';

urlsignRun.$inject = ['$location', '$routeParams', '$rootScope', 'dataService'];
export function urlsignRun($location, $routeParams, $rootScope, dataService: IDataService) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {

  });

  $rootScope.$on('$routeChangeSuccess', function (evt, current, previous) {
    if ($routeParams['urlSign']) {
      let urlSign: string = $routeParams['urlSign'] || '';
      let b = dataService.urlSignCheck($location.path());
      if (!b) {
        let cur_url = encodeURIComponent($location.absUrl());
        $location.url('/error/errorSign?url=' + cur_url);
      }
    }
  });

}
