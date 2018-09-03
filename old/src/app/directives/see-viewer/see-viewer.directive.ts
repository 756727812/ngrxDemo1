import Viewer from 'viewerjs/dist/viewer.esm';
import 'viewerjs/dist/viewer.min.css';
import { formatSrc } from '../../utils';

seeViewer.$inject = ['$http'];
export default function seeViewer($http: ng.IHttpService) {
  // Usage:
  //  <img src="" alt="" see-viewer data-original="{{item.itemImgurl}}">
  // Creates:
  //
  const directive = {
    link,
    restrict: 'A',
  };
  return directive;

  function link(
    scope: ng.IScope,
    element: ng.IAugmentedJQuery,
    attrs: ng.IAttributes,
  ) {
    if (element.is('img')) {
      element.addClass('img-viewer');
    }
    const watching = scope.$watch(
      () => $http.pendingRequests.length,
      (length: number) => {
        if (length === 0) {
          const el = new Viewer(element.get()[0], {
            // 使用原始图片地址做预览
            url: () =>
              attrs['data-original']
                ? formatSrc(
                    attrs['data-original'],
                    !!~~localStorage.getItem('hasWebP'),
                  )
                : attrs['src'],
          });
          watching();
        }
      },
      true,
    );
    scope.$on('$destroy', watching);
  }
}
