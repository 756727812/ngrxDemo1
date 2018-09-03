let scrolltotop = {
  // startline: Integer. Number of pixels from top of doc scrollbar is scrolled before showing control
  // scrollto: Keyword (Integer, or "Scroll_to_Element_ID"). How far to scroll document up when control is clicked on (0=top).
  setting: {
    startline: 100,
    scrollto: 0,
    scrollduration: 1000,
    fadeduration: [500, 100],
  },
  controlHTML:
    '<img src="//static.seecsee.com/seego_backend/images/top.png" style="width:40px; height:40px" />', // HTML for control, which is auto wrapped in DIV w/ ID="topcontrol"
  controlattrs: { offsetx: 10, offsety: 10 }, // offset of control relative to right/ bottom of window corner
  anchorkeyword: '#top', // Enter href value of HTML anchors on the page that should also act as "Scroll Up" links

  state: { isvisible: false, shouldvisible: false },

  scrollup() {
    if (!this.cssfixedsupport)
      // if control is positioned using JavaScript
      this.$control.css({ opacity: 0 }); // hide control immediately after clicking it
    let dest = isNaN(this.setting.scrollto)
      ? this.setting.scrollto
      : parseInt(this.setting.scrollto, 10);
    if (typeof dest === 'string' && jQuery('#' + dest).length === 1)
      // check element set by string exists
      dest = jQuery('#' + dest).offset().top;
    else dest = 0;
    this.$body.animate({ scrollTop: dest }, this.setting.scrollduration);
  },

  keepfixed() {
    const $window = jQuery(window);
    const controlx =
      $window.scrollLeft() +
      $window.width() -
      this.$control.width() -
      this.controlattrs.offsetx;
    const controly =
      $window.scrollTop() +
      $window.height() -
      this.$control.height() -
      this.controlattrs.offsety;
    this.$control.css({ left: controlx + 'px', top: controly + 'px' });
  },

  togglecontrol() {
    const scrolltop = jQuery(window).scrollTop();
    if (!this.cssfixedsupport) this.keepfixed();
    this.state.shouldvisible =
      scrolltop >= this.setting.startline ? true : false;
    if (this.state.shouldvisible && !this.state.isvisible) {
      this.$control
        .stop()
        .animate({ opacity: 1 }, this.setting.fadeduration[0]);
      this.state.isvisible = true;
    } else if (this.state.shouldvisible === false && this.state.isvisible) {
      this.$control
        .stop()
        .animate({ opacity: 0 }, this.setting.fadeduration[1]);
      this.state.isvisible = false;
    }
  },

  init() {
    jQuery(document).ready($ => {
      const mainobj = <any>scrolltotop;
      const iebrws = document.all;
      mainobj.cssfixedsupport =
        !iebrws ||
        (iebrws &&
          document.compatMode === 'CSS1Compat' &&
          (<any>window).XMLHttpRequest); // not IE or IE7+ browsers in standards mode
      mainobj.$body = (<any>window).opera
        ? document.compatMode === 'CSS1Compat' ? $('html') : $('body')
        : $('html,body');
      mainobj.$control = $(
        '<div id="topcontrol">' + mainobj.controlHTML + '</div>',
      )
        .css({
          position: mainobj.cssfixedsupport ? 'fixed' : 'absolute',
          bottom: mainobj.controlattrs.offsety,
          right: mainobj.controlattrs.offsetx,
          opacity: 0,
          'z-index': 10,
          cursor: 'pointer',
        })
        .attr({ title: 'Scroll Back to Top' })
        .click(() => {
          mainobj.scrollup();
          return false;
        })
        .appendTo('body');
      if (
        document.all &&
        !(<any>window).XMLHttpRequest &&
        mainobj.$control.text() !== ''
      )
        // loose check for IE6 and below, plus whether control contains any text
        mainobj.$control.css({ width: mainobj.$control.width() }); // IE6- seems to require an explicit width on a DIV containing text
      mainobj.togglecontrol();
      $('a[href="' + mainobj.anchorkeyword + '"]').click(() => {
        mainobj.scrollup();
        return false;
      });
      $(window).bind('scroll resize', e => {
        mainobj.togglecontrol();
      });
    });
  },
};

scrolltotop.init();
