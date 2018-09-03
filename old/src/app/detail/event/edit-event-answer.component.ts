import { IDataService } from '../../services/data-service/data-service.interface';

export const editEventAnswer: ng.IComponentOptions = {
  template: require('./edit-event-answer.template.html'),
  controller: editEventAnswerController,
};

editEventAnswerController.$inject = ['$scope', '$location', '$routeParams', 'dataService', 'Notification'];
function editEventAnswerController($scope, $location, $routeParams, dataService: IDataService, Notification) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  $scope.fid = $routeParams.fid;
  $scope.formData = {};
  if (typeof $routeParams.item_id !== 'undefined') {
    dataService.wanted_getItemDetail({
      item_id: $routeParams.item_id,
    }).then(res => {
      $scope.item = res.data;
      $scope.formData.f_imgurl = $scope.item.item_imgurl;
      $scope.formData.f_price = $scope.item.price;
      $scope.formData.f_buyurl = $scope.buyurl;
      $scope.formData.f_brand = $scope.item.brand_info.brand_name;
      $scope.formData.item_id = $routeParams.item_id;
      $scope.formData.f_comment = $scope.item.item_name;
    });
  }

  dataService.seller_getSellerMajia().then(res => {
    $scope.users = res.data;
    let rand_idx = Math.floor(Math.random() * ($scope.users.length));
    $scope.formData.u_id = $scope.users[rand_idx].u_id;
  });

  $scope.editAnswer = function (formData) {
    if (typeof formData.f_imgurl == 'undefined') {
      Notification.warn('请上传图片');
      return;
    }
    formData.f_ispublic = 1;
    formData.f_id = $routeParams.fid;
    dataService.event_editAnswer(formData).then(res => {
      Notification.success();
      $location.path('/event/index-event');
    });
  };
}
