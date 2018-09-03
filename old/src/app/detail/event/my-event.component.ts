import { IDataService } from '../../services/data-service/data-service.interface'

export const myEvent: ng.IComponentOptions = {
  template: require('./my-event.template.html'),
  controller: myEventController
}

myEventController.$inject = ['$scope', '$location', '$routeParams', 'dataService'];
export function myEventController($scope, $location, $routeParams, dataService: IDataService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  var hash = $location.hash() || 'theme'
  var page = $routeParams.page || 1;
  var params = [];
  if (hash === 'theme') {
    params['p'] = page;

    dataService.event_getMyEventTheme(params).then(function(res) {
      $scope.themeList = res.data.themes;
      $scope.total_items = res.data.count;
    })
  } else if (hash === 'topic') {

  }
}
