httpConfig.$inject = ['$httpProvider'];
export function httpConfig($httpProvider) {
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
}
