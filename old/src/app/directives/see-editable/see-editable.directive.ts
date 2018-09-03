seeEditable.$inject = ['$http'];
export default function seeEditable($http) {
  // Usage:
  // see-editable: inline popup
  // <a href="" data-type="textarea" data-pk="{{smallOrder.order_id}}" data-url="/api/order/addOrderComments"
  //  data-placeholder="备注信息" data-original-title="输入备注信息" class="editable editable-pre-wrapped editable-click"
  //  style="display: inline; background-color: rgba(0, 0, 0, 0);" see-editable="inline" ng-bind="smallOrder.comments"><a>
  // Creates:
  //
  const directive = {
    link,
    restrict: 'A',
    scope: {
    }
  }
  return directive;

  function link(scope, element, attrs) {
    scope.$watch(function() {
      return $http.pendingRequests.length;
    }, function(length) {
      if (length === 0) {
        (<any>(<any>$.fn)).editable.defaults.mode = attrs.seeEditable || 'inline'; //
        (<any>$(element)).editable();
      }
    })
  }
}
