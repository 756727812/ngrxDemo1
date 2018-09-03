import { confirmImgHost } from '../../utils'

export default function seeImg() {
  // Usage:
  // <img width="100" class="img-viewer" ng-src="{{good.item_imgurl}}" see-img alt="{{good.item_name}}">
  // Creates:
  //
  var directive = {
    link: link,
    restrict: 'A',
    scope: {
      seeImg: '<'
    }
  };
  return directive;

  function link(scope, element, attrs) {
    attrs.$observe('src', function(value) {
      let src = confirmImgHost(value)
      if (src !== value) {
        attrs.$set('src', src);
      }
    })
  }
}
