import { forEach, isFunction } from 'lodash';

seeFileSelect.$inject = ['$http'];
export default function seeFileSelect($http) {
  // Usage:
  // <input type="file" min-size="640x640" see-file-select="upload" class="hidden" accept="image/*">
  // Creates:
  //
  const directive = {
    link,
    restrict: 'A',
  };
  return directive;

  function link(scope, element, attrs) {
    const preventSpinner = typeof attrs.preventSpinner !== 'undefined';
    element.bind('change', e => {
      // 上传
      const fn = attrs.seeFileSelect; // 回调方法，本例为$scope中的upload()方法
      forEach(e.target.files, file => {
        if (typeof attrs.format !== 'undefined') {
          const ext = file.name.match(/\.([^\.]+)$/)[1];
          if (!attrs.format.split(',').some(fmt => fmt === ext)) {
            alert(
              `图片格式不合适，仅支持 ${attrs.format.replace(/,/g, '、')} 格式`,
            );
            return;
          }
        }

        const form = new FormData();
        form.append('image', file);
        readImageData(file, data => {
          let size;
          if (typeof attrs.size !== 'undefined') {
            const w = attrs.size.split('x')[0];
            const h = attrs.size.split('x')[1];
            if (data.w !== Number(w) && data.h !== Number(h)) {
              alert('图片尺寸不对！');
              return;
            }
          }
          if (typeof attrs.ratio !== 'undefined') {
            const w = attrs.ratio.split(':')[0];
            const h = attrs.ratio.split(':')[1];
            if (data.w / data.h !== Number(w) / Number(h)) {
              alert('图片比例不对！');
              return;
            }
          }
          if (typeof attrs.minSize !== 'undefined') {
            const w = attrs.minSize.split('x')[0];
            const h = attrs.minSize.split('x')[1];
            if (!h && data.w < w) {
              alert('图片宽度不得低于' + w + '!');
              return;
            }
            if (data.w < w || data.h < h) {
              alert('图片尺寸不得低于' + w + 'x' + h + '！');
              return;
            }
          }
          if (typeof attrs.minWidth !== 'undefined') {
            const mw = +attrs.minWidth;
            if (mw > data.w) {
              alert('图片宽度最少为' + mw + '像素！');
              return;
            }
          }
          if (attrs.maxWidth) {
            const mw = +attrs.maxWidth;
            if (mw < data.w) {
              alert('图片宽度最多为' + mw + '像素！');
              return;
            }
          }
          if (typeof attrs.minHeight !== 'undefined') {
            const mh = +attrs.minHeight;
            if (mh > data.h) {
              alert('图片高度最少为' + mh + '像素！');
              return;
            }
          }
          if (attrs.maxHeight) {
            const mh = +attrs.maxHeight;
            if (mh < data.h) {
              alert('图片高度最多为' + mh + '像素！');
              return;
            }
          }
          if (typeof attrs.savesize !== 'undefined') {
            size = data.w + 'x' + data.h;
          }
          uploadImage(form, size);
        });
      });

      function uploadImage(form, size) {
        if (attrs.onBeforeUpload) {
          const onBeforeUpload = scope.$eval(attrs.onBeforeUpload);
          onBeforeUpload && onBeforeUpload();
        }
        $http
          .post('/api/item/upload', form, {
            _noSpinner: true,
            headers: {
              'Content-Type': undefined, // 如果不设置Content-Type,默认为application/json,七牛会报错
              // 'Content-Type': 'application/json'
            },
          })
          .then(data => {
            // 支持 “fn=vm.upload" 的写法
            if (fn.split('.').length > 0) {
              fn.split('.').reduce((acc, val) => {
                if (isFunction(acc[val])) {
                  acc[val](data.data, size); // 找到上传方法
                }
                return acc[val];
              }, scope);
            } else {
              scope[fn](data.data, size); // 上传回调，将url传到upload方法中
            }
          });
      }

      function readImageData(file, fn) {
        const reader = new FileReader();
        const image = new Image();
        reader.readAsDataURL(file);
        reader.onload = function(_file) {
          image.src = _file.target['result'];
          image.onload = function() {
            const data = {
              w: Number((<any>this).width),
              h: Number((<any>this).height),
              t: file.type,
              n: file.name,
              s: ~~(file.size / 1024) + 'KB',
            };
            fn(data);
          };
          image.onerror = function() {
            alert('不正确的格式: ' + file.type);
          };
        };
      }
    });
  }
}
