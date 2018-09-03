export class EventSeckillListV2Controller implements ng.IComponentController {
  static $inject: string[] = ['$routeParams'];
  wechatId: string = this.$routeParams['wechat_id'];

  constructor(private $routeParams: ng.route.IRouteParamsService) {}

  $onInit(): void {}
}
export const EventSeckillListV2: ng.IComponentOptions = {
  template: require('./event-seckill-list-v2.template.html'),
  controller: EventSeckillListV2Controller,
};
