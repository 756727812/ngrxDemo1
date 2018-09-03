function script() {
  // Usage:
  // <script type='text/javascript-lazy' src='async.js'></script>
  // Creates:
  //
  var directive = {
    restrict: 'E',
    scope: false,
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.type === 'text/javascript-lazy') {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      var src = element.attr('src');
      if (src !== undefined) {
        s.src = src;
      }
      else {
        var code = element.text();
        s.text = code;
      }
      var s1 = document.getElementsByTagName('script')[0];
      s1.parentNode.insertBefore(s, s1);
      element.remove();
    }
  }
}

export default script
