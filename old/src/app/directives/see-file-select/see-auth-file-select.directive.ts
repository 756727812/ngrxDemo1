seeAuthFileSelect.$inject = ['$rootScope', '$http']
export default function seeAuthFileSelect($rootScope, $http) {
  // Usage:
  // <input type="file" class="hidden" see-auth-file-select="upload" accept="image/*" />
  // Creates:
  //
  var directive = {
    link: link,
    restrict: 'A',
  }
  return directive;

  function link(scope, element, attrs) {
    element.bind('change', function(e) {
      var fn = attrs.seeAuthFileSelect;//回调方法，本例为$scope中的upload()方法
      var file = e.target.files[0];

      if (file == undefined) {//没选择文件
        return false;
      }
      var form = new FormData();
      form.append("image", file);
      $http.post('/api/auth/upload', form, {
        headers: {
          'Content-Type': undefined//如果不设置Content-Type,默认为application/json,七牛会报错
        }
      }).then(function(data) {
        scope[fn](data.data);//上传回调，将url传到upload方法中
      })
    })
  }
}
