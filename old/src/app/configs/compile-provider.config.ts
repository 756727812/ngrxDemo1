/**
 * ref: https://docs.angularjs.org/guide/production
 */
compileProvider.$inject = ['$compileProvider'];
export function compileProvider($compileProvider: ng.ICompileProvider) {
  $compileProvider.debugInfoEnabled(process.env.NODE_ENV === 'development');
  $compileProvider.commentDirectivesEnabled(false);
}
