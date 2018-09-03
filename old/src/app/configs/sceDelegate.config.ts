sceDelegateConfig.$inject = ['$sceDelegateProvider']
export function sceDelegateConfig($sceDelegateProvider: ng.ISCEDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://seecsee.com/**',
    'https://open.weixin.qq.com/**'
  ])
}
