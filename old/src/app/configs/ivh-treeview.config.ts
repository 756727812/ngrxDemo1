ivhTreeviewConfig.$inject = ['ivhTreeviewOptionsProvider']
export function ivhTreeviewConfig(ivhTreeviewOptionsProvider) {
  ivhTreeviewOptionsProvider.set({
    twistieCollapsedTpl: '<span class="glyphicon glyphicon-chevron-right"></span>',
    twistieExpandedTpl: '<span class="glyphicon glyphicon-chevron-down"></span>',
    twistieLeafTpl: '',
    // nodeTpl: '...'
  })
}
