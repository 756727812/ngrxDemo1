export const stepBar: ng.IComponentOptions = {
  template: require('./stepBar.template.html'),
  bindings: {
    size: '@',
    active: '<',
    steps: '<'
  }
}
