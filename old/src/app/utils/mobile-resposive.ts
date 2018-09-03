const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
const calc = function () {
  const clientWidth = Math.min($(window).width(), 750)
  if (clientWidth) {
    document.documentElement.style.fontSize = `${100 * (clientWidth / 750)}px`
  }
}

export const start = () => {
  calc()
  $(window).bind(`${resizeEvt}.resposive`, calc)
}

export const end = () => {
  $(window).off(`${resizeEvt}.resposive`)
}

export default {
  start,
  end,
}
