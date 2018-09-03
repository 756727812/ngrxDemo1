export default function seeGoods() {
  // Usage:
  // <a class="btn btn-sm btn-primary" see-goods="good.item_id" target="_blank">预览</a>
  // Creates:
  //
  const directive = {
    link,
    restrict: 'A',
    scope: {
      seeGoods: '=',
    },
  };
  return directive;

  function link(scope, element, attrs) {
    const item_id = scope.seeGoods;
    const is_dev =
      !window.location.href.match('//backend.seecsee.com/') &&
      !window.location.href.match('//portal.xiaodianpu.com/');

    const url =
      (is_dev
        ? '//see-test.seecsee.com/static/wechat/detail/commodity.html?item_id='
        : '//m.seeapp.com/see/static_wechat/detail/commodity.html?item_id=') +
      item_id +
      '';
    attrs.$set('href', url);
  }
}
