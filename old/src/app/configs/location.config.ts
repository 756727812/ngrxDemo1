locationConfig.$inject = ['$locationProvider'];
export function locationConfig($locationProvider: ng.ILocationProvider) {
  $locationProvider.html5Mode(true);
}
