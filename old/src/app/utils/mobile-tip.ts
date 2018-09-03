import * as bowser from 'bowser';

export const show = () => {

  // TODO 手机端有个安慰提示
  $(function () {
    const STORAGE_HIDE_KEY = '__hideMobileTopTips__'
    if (bowser.mobile && localStorage.getItem(STORAGE_HIDE_KEY) !== '1') {
      let $tips = $(`<div id="mobile-top-tips">
  <span>推荐电脑端登录小电铺后台，以获得更好体验</span><span class="btn-close">&#x2715;</span>
  </div>`)
        .css({
          'line-height': 1,
          display: 'flex',
          'justify-content': 'space-between',
          width: '100%',
          position: 'fixed',
          'z-index': '9999',
          'font-size': `${($(window).width() / 320 * 12).toFixed(2)}px`,
          top: '0',
          color: '#fff',
          background: '#f2c037',
          'font-weight': 'bold',
          padding: '6px 16px'
        })
      $tips.find('span').css({ display: 'inline-block' })
      $tips.find('.btn-close').on('click', function () {
        $tips.remove()
        $tips = null
        localStorage.setItem(STORAGE_HIDE_KEY, '1')
      })
      $tips.prependTo(document.body)
    }
  });

}
