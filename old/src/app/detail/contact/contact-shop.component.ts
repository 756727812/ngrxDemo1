import * as angular from 'angular';

export class contactShopController {
  type: any;
  tabNum: any;
  static $inject: string[] = ['$q', '$routeParams', '$location', '$anchorScroll', '$timeout'];

  constructor(
    private $q: ng.IQService,
    private $routeParams: ng.route.IRouteParamsService,
    private $location: ng.ILocationService,
    private $anchorScroll: any,
    private $timeout: any,
  ) {
    this.type = this.$location.hash() || '1';
    this.tabNum = ~~this.type.split('-')[0];

  }
  $onInit() {
    if (this.type.split('-')[1]) {
      this.goToItem(this.type);
    }
  }
  choiceTab(item) {
    this.$location.hash(item);
  }
  goToItem(item) {
    this.$timeout(function () {
      const top = $('#' + item).offset().top - 80;
      $('html,body').scrollTop(top);
      console.log(top);
    },            1000, false);

    // this.$location.hash(item)
    // this.$anchorScroll.yOffset = 50
    // this.$anchorScroll()
  }
}
export const contactShop = {
  template: require('./contact-shop.template.html'),
  controller: contactShopController,
};
