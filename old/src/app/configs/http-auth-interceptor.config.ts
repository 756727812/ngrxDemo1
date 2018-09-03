import { ReportService } from '../services/report-service/report-service';


httpAuthInterceptor.$inject = ['$httpProvider'];
export function httpAuthInterceptor($httpProvider: ng.IHttpProvider) {
  $httpProvider.interceptors.push(['$rootScope', '$q', '$routeParams',
    function ($rootScope: ng.IRootScopeService, $q: ng.IQService, $routeParams: ng.route.IRouteParamsService) {

      const redirectToLogin = () => {
        const seller_from = ReportService.getReferSellerFrom();
        window.location.href = `/auth.html#!/login${seller_from ? `?seller_from=${seller_from}` : ''}`;
      };
      return {
        response(res) {
          console.dir(res);
        // if (res.data['data'] && res.data['data']['result']) {
        //   console.dir(res)
        // }
        // if (res.config.url.startsWith('api') && res.data['data']['result'] === 101) {
        //   console.log('loginRequired')
        //   redirectToLogin()
        //   return $q.reject(res)
        // }
          return res;
        },
        responseError(rejection) {
          switch (rejection.status) {
          case 401:
            $rootScope.$broadcast('event:auth-loginRequired', rejection);
            redirectToLogin();
            break;
          case 403:
            $rootScope.$broadcast('event:auth-forbidden', rejection);
            redirectToLogin();
            break;
          default:
        }
          return $q.reject(rejection);
        },
      };
    }]);
}
