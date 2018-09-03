import { IDataService } from '../../services/data-service/data-service.interface';

export const seegoPartnerList: ng.IComponentOptions = {
  template: require('./seego-partner-list.template.html'),
  controller: seegoPartnerController,
};

seegoPartnerController.$inject = ['$scope', '$routeParams', 'dataService'];
export function seegoPartnerController($scope, $routeParams, dataService: IDataService) {
  // var vm = this;

  // activate();

  // ////////////////

  // function activate() { }

  let page = $routeParams.page || 1;

  /**
   * 获取seego合伙人列表信息
   */
  function getPartnerList(page) {
    dataService.seego_partner_getSeegoPartnerSummary({
      page,
      page_size: 20,
    }).then(res => {
      $scope.partnerList = res.data.list;
      $scope.total_items = res.data.count;
    });
  }

  this.$onInit = activate;

  function activate() {
    getPartnerList(page);
  }
}
