import { confirmImgHost, formatSrc } from '../../utils';

seeSrc.$inject = ['webPService'];
export default function seeSrc(webPService) {
  // usage:
  // <img class="img-viewer" see-src="good.item_imgurl" thumbnail="750x500" alt="{{good.item_name}}">
  // creates:
  //
  const directive = {
    link,
    restrict: 'A',
    scope: {
      seeSrc: '=',
      thumbnail: '@',
      crop: '@',
      gravity: '@',
    },
  };
  return directive;

  function link(
    scope: ng.IScope,
    element: ng.IAugmentedJQuery,
    attrs: ng.IAttributes,
  ) {
    const thumbnail = scope['thumbnail']
      ? `/thumbnail/${scope['thumbnail']}`
      : '';
    const crop = scope['crop'] ? `/crop/${scope['crop']}` : '';
    const gravity = scope['gravity'] ? `/gravity/${scope['gravity']}` : '';
    webPService.webPSupport().then(hasWebp => {
      scope.$watch('seeSrc', (val: string, old_val) => {
        if (!val) {
          attrs.$set(
            'src',
            '//static.seecsee.com/seego_backend/images/placeholder.png',
          );
          return;
        }
        // 记录原图片
        attrs.$set('data-original', val);
        const seeSrc = formatSrc(val, hasWebp, thumbnail, crop, gravity);

        // 记录原始图片宽高
        const image = new Image();
        image.onload = function() {
          attrs.$set('data-width', (<any>this).width);
          attrs.$set('data-height', (<any>this).height);
          attrs.$set('src', seeSrc);
        };
        image.onerror = () => {
          attrs.$set(
            'src',
            '//static.seecsee.com/seego_backend/images/placeholder.png',
          );
          console.warn(new Error(`图片：${seeSrc} 加载错误，已替换为默认图片`));
        };
        image.src = seeSrc;
      });
    });
  }
}
