export function applicationService() {
  let doc = document;
  let docEl = document.documentElement;
  let $body = $('body');
  let $sidebar = $('.sidebar');
  let $sidebarFooter = $('.sidebar .sidebar-footer');
  let $mainContent = $('.main-content');
  let $pageContent = $('.page-content');
  let $topbar = $('.topbar');
  let $logopanel = $('.logopanel');
  let $sidebarWidth = $('.sidebar').width();
  let content = document.querySelector('.page-content');
  let $loader = $('#preloader');
  let docHeight = $(document).height();
  let windowWidth = $(window).width();
  let windowHeight = $(window).height();
  let topbarWidth = $('.topbar').width();
  let headerLeftWidth = $('.header-left').width();
  let headerRightWidth = $('.header-right').width();
  let start = 0;
  let delta = 0;
  let end = 0;

  /* ==========================================================*/
  /* LAYOUTS API                                                */
  /* ========================================================= */

  /* Create Sidebar Fixed */
  function handleSidebarFixed() {
    // removeSidebarHover();
    $('#switch-sidebar').prop('checked', true);
    $('#switch-submenu').prop('checked', false);
    if ($('body').hasClass('sidebar-top')) {
      $('body')
        .removeClass('fixed-topbar')
        .addClass('fixed-topbar');
      $('#switch-topbar').prop('checked', true);
    }
    $('body')
      .removeClass('fixed-sidebar')
      .addClass('fixed-sidebar');
    $('.sidebar').height('');
    handleboxedLayout();
    if (!$('body').hasClass('sidebar-collapsed')) removeSubmenuHover();
    createSideScroll();
  }

  /* Create Sidebar Fluid / Remove Sidebar Fixed */
  function handleSidebarFluid() {
    $('#switch-sidebar').prop('checked', false);
    if ($('body').hasClass('sidebar-hover')) {
      removeSidebarHover();
      $('#switch-sidebar-hover').prop('checked', false);
    }
    $('body').removeClass('fixed-sidebar');
    handleboxedLayout();
    destroySideScroll();
  }

  /* Toggle Sidebar Fixed / Fluid */
  function toggleSidebar() {
    if ($('body').hasClass('fixed-sidebar')) handleSidebarFluid();
    else handleSidebarFixed();
  }

  /* Create Sidebar only visible on Hover */
  function createSidebarHover() {
    $('body').addClass('sidebar-hover');
    $('body')
      .removeClass('fixed-sidebar')
      .addClass('fixed-sidebar');
    $('.main-content')
      .css('margin-left', '')
      .css('margin-right', '');
    $('.topbar')
      .css('left', '')
      .css('right', '');
    $('body').removeClass('sidebar-top');
    removeSubmenuHover();
    removeBoxedLayout();
    removeCollapsedSidebar();
    // sidebarHover();
    handleSidebarFixed();
    $('#switch-sidebar-hover').prop('checked', true);
    $('#switch-sidebar').prop('checked', true);
    $('#switch-sidebar-top').prop('checked', false);
    $('#switch-boxed').prop('checked', false);
  }

  /* Remove Sidebar on Hover */
  function removeSidebarHover() {
    $('#switch-sidebar-hover').prop('checked', false);
    $('body').removeClass('sidebar-hover');
    if (!$('body').hasClass('boxed'))
      $('.sidebar, .sidebar-footer').attr('style', '');
    $('.logopanel2').remove();
  }

  /* Toggle Sidebar on Top */
  function toggleSidebarHover() {
    if ($('body').hasClass('sidebar-hover')) removeSidebarHover();
    else createSidebarHover();
  }

  /* Create Sidebar Submenu visible on Hover */
  function createSubmenuHover() {
    removeSidebarHover();
    handleSidebarFluid();
    $('#switch-submenu-hover').prop('checked', true);
    $('body').addClass('submenu-hover');
    $('.nav-sidebar .children').css('display', '');
    $('#switch-sidebar').prop('checked', false);
  }

  /* Remove Submenu on Hover */
  function removeSubmenuHover() {
    $('#switch-submenu-hover').prop('checked', false);
    $('body').removeClass('submenu-hover');
    $('.nav-sidebar .nav-parent.active .children').css('display', 'block');
  }

  /* Toggle Submenu on Hover */
  function toggleSubmenuHover() {
    if ($('body').hasClass('submenu-hover')) removeSubmenuHover();
    else createSubmenuHover();
  }

  /* Create Topbar Fixed */
  function handleTopbarFixed() {
    $('#switch-topbar').prop('checked', true);
    $('body')
      .removeClass('fixed-topbar')
      .addClass('fixed-topbar');
  }

  /* Create Topbar Fluid / Remove Topbar Fixed */
  function handleTopbarFluid() {
    $('#switch-topbar').prop('checked', false);
    $('body').removeClass('fixed-topbar');
    if (
      $('body').hasClass('sidebar-top') &&
      $('body').hasClass('fixed-sidebar')
    ) {
      $('body').removeClass('fixed-sidebar');
      $('#switch-sidebar').prop('checked', false);
    }
  }

  /* Toggle Topbar Fixed / Fluid */
  function toggleTopbar() {
    if ($('body').hasClass('fixed-topbar')) handleTopbarFluid();
    else handleTopbarFixed();
  }

  /* Adjust margin of content for boxed layout */
  function handleboxedLayout() {
    if ($('body').hasClass('builder-admin')) return;
    $logopanel.css('left', '').css('right', '');
    $topbar.css('width', '');
    $sidebar.css('margin-left', '').css('margin-right', '');
    $sidebarFooter.css('left', '').css('right', '');
    if ($('body').hasClass('boxed')) {
      windowWidth = $(window).width();
      windowHeight = $(window).height();
      const pageContentHeight = $('.page-content').height();
      const container = 1200;
      topbarWidth = container - $sidebarWidth;
      const margin = (windowWidth - 1200) / 2;
      if (!$('body').hasClass('sidebar-top') && windowWidth > 1220) {
        $logopanel.css('left', margin);
        if ($('body').hasClass('sidebar-collapsed')) {
          $topbar.css('width', 1200);
        } else {
          if ($('body').hasClass('fixed-sidebar')) {
            $sidebar.css('margin-left', margin);
            topbarWidth = 1200 - $sidebarWidth;
            $('.topbar').css('width', topbarWidth);
          }
          $sidebarFooter.css('left', margin);
          $topbar.css('width', topbarWidth);
        }
      }
    }
  }

  /* Create Boxed Layout */
  function createBoxedLayout() {
    removeSidebarHover();
    $('body').addClass('boxed');
    handleboxedLayout();
    $('#switch-boxed').prop('checked', true);
  }

  /* Remove boxed layout */
  function removeBoxedLayout() {
    if ($('body').hasClass('boxed')) {
      $('body').removeClass('boxed');
      $logopanel.css('left', '').css('right', '');
      $topbar.css('width', '');
      $sidebar.css('margin-left', '').css('margin-right', '');
      $sidebarFooter.css('left', '').css('right', '');
      $('#switch-boxed').prop('checked', false);
    }
  }

  function toggleboxedLayout() {
    if ($('body').hasClass('boxed')) removeBoxedLayout();
    else createBoxedLayout();
  }

  /* Toggle Sidebar Collapsed */
  function collapsedSidebar() {
    if ($body.css('position') != 'relative') {
      if (!$body.hasClass('sidebar-collapsed')) createCollapsedSidebar();
      else removeCollapsedSidebar();
    } else {
      if ($body.hasClass('sidebar-show')) $body.removeClass('sidebar-show');
      else $body.addClass('sidebar-show');
    }
    handleboxedLayout();
  }

  function createCollapsedSidebar() {
    $body.addClass('sidebar-collapsed');
    (<any>$('.sidebar'))
      .css('width', '')
      .resizable()
      .resizable('destroy');
    $('.nav-sidebar ul').attr('style', '');
    $(this).addClass('menu-collapsed');
    destroySideScroll();
    $('#switch-sidebar').prop('checked');
  }

  function removeCollapsedSidebar() {
    $body.removeClass('sidebar-collapsed');
    if (!$body.hasClass('submenu-hover'))
      $('.nav-sidebar li.active ul').css({
        display: 'block',
      });
    $(this).removeClass('menu-collapsed');
    if ($body.hasClass('sidebar-light') && !$body.hasClass('sidebar-fixed')) {
      $('.sidebar').height('');
    }
    createSideScroll();
  }

  /* Reset to Default Style, remove all cookie and custom layouts */
  function resetStyle() {
    $('#reset-style').on('click', function(event) {
      event.preventDefault();
      removeBoxedLayout();
      removeSidebarHover();
      removeSubmenuHover();
      removeCollapsedSidebar();
      $('body').removeClass(function(index, css) {
        return (css.match(/(^|\s)bg-\S+/g) || []).join(' ');
      });
      $('body').removeClass(function(index, css) {
        return (css.match(/(^|\s)color-\S+/g) || []).join(' ');
      });
      $('body').removeClass(function(index, css) {
        return (css.match(/(^|\s)theme-\S+/g) || []).join(' ');
      });
      $('body')
        .addClass('theme-sdtl')
        .addClass('color-default');
      $('.builder .theme-color').removeClass('active');
      $('.theme-color').each(function() {
        if ($(this).data('color') == '#319DB5') $(this).addClass('active');
      });
      $('.builder .theme').removeClass('active');
      $('.builder .theme-default').addClass('active');
      $('.builder .sp-replacer').removeClass('active');
    });
  }

  /******************** END LAYOUT API  ************************/
  /* ========================================================= */
  /****  Full Screen Toggle  ****/
  function toggleFullScreen() {
    if (
      !doc.fullscreenElement &&
      !doc['msFullscreenElement'] &&
      !doc.webkitIsFullScreen &&
      !doc['mozFullScreenElement']
    ) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullScreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.webkitRequestFullScreen) {
        docEl.webkitRequestFullScreen();
      } else if (docEl['msRequestFullscreen']) {
        (<any>docEl).msRequestFullscreen();
      } else if (docEl['mozRequestFullScreen']) {
        (<any>docEl).mozRequestFullScreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.webkitCancelFullScreen) {
        doc.webkitCancelFullScreen();
      } else if ((<any>docEl).msExitFullscreen) {
        (<any>docEl).msExitFullscreen();
      } else if ((<any>docEl).mozCancelFullScreen) {
        (<any>docEl).mozCancelFullScreen();
      }
    }
  }

  /* Simulate Ajax call on Panel with reload effect */
  function blockUI(item) {
    (<any>$(item)).block({
      message:
        '<svg class="circular"><circle class="path" cx="40" cy="40" r="10" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>',
      css: {
        border: 'none',
        width: '14px',
        backgroundColor: 'none',
      },
      overlayCSS: {
        backgroundColor: '#fff',
        opacity: 0.6,
        cursor: 'wait',
      },
    });
  }

  function unblockUI(item) {
    (<any>$(item)).unblock();
  }

  /**** PANEL ACTIONS ****/
  /* Create Portlets Controls automatically: reload, fullscreen, toggle, remove, popout */
  function handlePanelControls() {
    $('.panel-controls').each(function() {
      const controls_html =
        '<div class="control-btn">' +
        '<a href="#" class="panel-reload hidden"><i class="icon-reload"></i></a>' +
        '<a class="hidden" id="dropdownMenu1" data-toggle="dropdown">' +
        '<i class="icon-settings"></i>' +
        '</a>' +
        '<ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu1">' +
        '<li><a href="#">Action</a>' +
        '</li>' +
        '<li><a href="#">Another action</a>' +
        '</li>' +
        '<li><a href="#">Something else here</a>' +
        '</li>' +
        '</ul>' +
        '<a href="#" class="panel-popout hidden tt" title="Pop Out/In"><i class="icons-office-58"></i></a>' +
        '<a href="#" class="panel-maximize hidden"><i class="icon-size-fullscreen"></i></a>' +
        '<a href="#" class="panel-toggle"><i class="fa fa-angle-down"></i></a>' +
        '<a href="#" class="panel-close"><i class="icon-trash"></i></a>' +
        '</div>';
      $(this).append(controls_html);
    });
  }

  function handlePanelAction() {
    handlePanelControls();
    // Toggle Panel Content
    $('.panel-header .panel-toggle').click(function(event) {
      event.preventDefault();
      $(this)
        .toggleClass('closed')
        .parents('.panel:first')
        .find('.panel-content')
        .slideToggle();
    });
    // Popout / Popin Panel
    $('.panel-header .panel-popout').click(function(event) {
      event.preventDefault();
      const panel = $(this).parents('.panel:first');
      if (panel.hasClass('modal-panel')) {
        $('i', this)
          .removeClass('icons-office-55')
          .addClass('icons-office-58');
        panel.removeAttr('style').removeClass('modal-panel');
        panel.find('.panel-maximize,.panel-toggle').removeClass('nevershow');
        (<any>panel).draggable('destroy').resizable('destroy');
      } else {
        panel.removeClass('maximized');
        panel.find('.panel-maximize,.panel-toggle').addClass('nevershow');
        $('i', this)
          .removeClass('icons-office-58')
          .addClass('icons-office-55');
        const w = panel.width();
        const h = panel.height();
        panel
          .addClass('modal-panel')
          .removeAttr('style')
          .width(w)
          .height(h);
        (<any>$(panel))
          .draggable({
            handle: '.panel-header',
            containment: '.page-content',
          })
          .css({
            left: panel.position().left - 10,
            top: panel.position().top + 2,
          })
          .resizable({
            minHeight: 150,
            minWidth: 200,
          });
      }
      window.setTimeout(function() {
        $('body').trigger('resize');
      }, 300);
    });
    // Reload Panel Content
    $('.panel-header .panel-reload').click(function(event) {
      event.preventDefault();
      event.stopPropagation();
      const el = $(this).parents('.panel:first');
      blockUI(el);
      window.setTimeout(function() {
        unblockUI(el);
      }, 1800);
    });
    // Maximize Panel Dimension
    $('.panel-header .panel-maximize').click(function(event) {
      event.preventDefault();
      const panel = $(this).parents('.panel:first');
      $body.toggleClass('maximized-panel');
      panel.removeAttr('style').toggleClass('maximized');
      maximizePanel();
      if (panel.hasClass('maximized')) {
        (<any>panel).parents('.portlets:first').sortable('destroy');
        $(window).trigger('resize');
      } else {
        $(window).trigger('resize');
        panel.parent().height('');
      }
      $('i', this)
        .toggleClass('icon-size-fullscreen')
        .toggleClass('icon-size-actual');
      panel.find('.panel-toggle').toggleClass('nevershow');
      $('body').trigger('resize');
      return false;
    });
  }

  function maximizePanel() {
    if ($('.maximized').length) {
      const panel = $('.maximized');
      const windowHeight = $(window).height() - 2;
      const panelHeight =
        panel.find('.panel-header').height() +
        panel.find('.panel-content').height() +
        100;
      if (panel.hasClass('maximized')) {
        if (windowHeight > panelHeight) panel.parent().height(windowHeight);
        else {
          if ($('.main-content').height() > panelHeight) {
            panel.parent().height($('.main-content').height());
          } else {
            panel.parent().height(panelHeight);
          }
        }
      } else {
        panel.parent().height('');
      }
    }
  }

  /****  Custom Scrollbar  ****/
  /* Create Custom Scroll for elements like Portlets or Dropdown menu */
  function customScroll() {
    if ((<any>(<any>$.fn)).mCustomScrollbar) {
      $('.withScroll').each(function() {
        (<any>$(this)).mCustomScrollbar('destroy');
        let scroll_height = $(this).data('height')
          ? $(this).data('height')
          : 'auto';
        const data_padding = $(this).data('padding')
          ? $(this).data('padding')
          : 0;
        if ($(this).data('height') == 'window') {
          const thisHeight = $(this).height();
          windowHeight = $(window).height() - data_padding - 50;
          if (thisHeight < windowHeight) scroll_height = thisHeight;
          else scroll_height = windowHeight;
        }
        (<any>$(this)).mCustomScrollbar({
          scrollButtons: {
            enable: false,
          },
          autoHideScrollbar: $(this).hasClass('show-scroll') ? false : true,
          scrollInertia: 150,
          theme: 'light',
          set_height: scroll_height,
          advanced: {
            updateOnContentResize: true,
          },
        });
      });
    }
  }

  /* ==========================================================*/
  /* BEGIN SIDEBAR                                             */
  /* Sidebar Sortable menu & submenu */
  function handleSidebarSortable() {
    $('.menu-settings').on('click', '#reorder-menu', function(e) {
      e.preventDefault();
      $('.nav-sidebar').removeClass('remove-menu');
      (<any>$('.nav-sidebar')).sortable({
        connectWith: '.nav-sidebar > li',
        handle: 'a',
        placeholder: 'nav-sidebar-placeholder',
        opacity: 0.5,
        axis: 'y',
        dropOnEmpty: true,
        forcePlaceholderSize: true,
        receive(event, ui) {
          $('body').trigger('resize');
        },
      });
      /* Sortable children */
      (<any>$('.nav-sidebar .children')).sortable({
        connectWith: 'li',
        handle: 'a',
        opacity: 0.5,
        dropOnEmpty: true,
        forcePlaceholderSize: true,
        receive(event, ui) {
          $('body').trigger('resize');
        },
      });
      $(this).attr('id', 'end-reorder-menu');
      $(this).html('End reorder menu');
      $('.remove-menu')
        .attr('id', 'remove-menu')
        .html('Remove menu');
    });
    /* End Sortable Menu Elements*/
    $('.menu-settings').on('click', '#end-reorder-menu', function(e) {
      e.preventDefault();
      (<any>$('.nav-sidebar')).sortable();
      (<any>$('.nav-sidebar')).sortable('destroy');
      (<any>$('.nav-sidebar .children')).sortable().sortable('destroy');
      $(this)
        .attr('id', 'remove-menu')
        .html('Reorder menu');
    });
  }

  /* Sidebar Remove Menu Elements*/
  function handleSidebarRemove() {
    /* Remove Menu Elements*/
    $('.menu-settings').on('click', '#remove-menu', function(e) {
      e.preventDefault();
      (<any>$('.nav-sidebar')).sortable();
      (<any>$('.nav-sidebar')).sortable('destroy');
      (<any>$('.nav-sidebar .children')).sortable().sortable('destroy');
      $('.nav-sidebar')
        .removeClass('remove-menu')
        .addClass('remove-menu');
      $(this)
        .attr('id', 'end-remove-menu')
        .html('End remove menu');
      $('.reorder-menu')
        .attr('id', 'reorder-menu')
        .html('Reorder menu');
    });
    /* End Remove Menu Elements*/
    $('.menu-settings').on('click', '#end-remove-menu', function(e) {
      e.preventDefault();
      $('.nav-sidebar').removeClass('remove-menu');
      $(this)
        .attr('id', 'remove-menu')
        .html('Remove menu');
    });
  }

  /* Hide User & Search Sidebar */
  function handleSidebarHide() {
    const hiddenElements = $(':hidden');
    const visibleElements = $(':visible');
    $('.menu-settings').on('click', '#hide-top-sidebar', function(e) {
      e.preventDefault();
      const this_text = $(this).text();
      $('.sidebar .sidebar-top').slideToggle(300);
      if (this_text == 'Hide user & search') {
        $(this).text('Show user & search');
      }
    });
    $('.topbar').on('click', '.toggle-sidebar-top', function(e) {
      e.preventDefault();
      $('.sidebar .sidebar-top').slideToggle(300);
      if ($('.toggle-sidebar-top span').hasClass('icon-user-following')) {
        $('.toggle-sidebar-top span')
          .removeClass('icon-user-following')
          .addClass('icon-user-unfollow');
      } else {
        $('.toggle-sidebar-top span')
          .removeClass('icon-user-unfollow')
          .addClass('icon-user-following');
      }
    });
  }

  /* Change statut of user in sidebar: available, busy, away, invisible */
  function changeUserStatut() {
    $('.sidebar').on('click', '.user-login li a', function(e) {
      e.preventDefault();
      const statut = $(this)
        .find('span')
        .text();
      const currentStatut = $('.user-login button span').text();
      $('.user-login button span').text(statut);
      if (statut == 'Busy') {
        $('.user-login button i:not(.fa)')
          .removeClass()
          .addClass('busy');
      }
      if (statut == 'Invisible') {
        $('.user-login button i:not(.fa)')
          .removeClass()
          .addClass('turquoise');
      }
      if (statut == 'Away') {
        $('.user-login button i:not(.fa)')
          .removeClass()
          .addClass('away');
      }
    });
  }

  /* Create custom scroll for sidebar used for fixed sidebar */
  function createSideScroll() {
    if ((<any>(<any>$.fn)).mCustomScrollbar) {
      destroySideScroll();
      if (
        !$('body').hasClass('sidebar-collapsed') &&
        !$('body').hasClass('sidebar-collapsed') &&
        !$('body').hasClass('submenu-hover') &&
        $('body').hasClass('fixed-sidebar')
      ) {
        (<any>$('.sidebar-inner')).mCustomScrollbar({
          scrollButtons: {
            enable: false,
          },
          autoHideScrollbar: true,
          scrollInertia: 150,
          theme: 'light-thin',
          advanced: {
            updateOnContentResize: true,
          },
        });
      }
      if ($('body').hasClass('sidebar-top')) {
        destroySideScroll();
      }
    }
  }

  /* Destroy sidebar custom scroll */
  function destroySideScroll() {
    (<any>$('.sidebar-inner')).mCustomScrollbar('destroy');
  }

  /* Toggle submenu open */
  function toggleSidebarMenu() {
    // Check if sidebar is collapsed
    if (
      $('body').hasClass('sidebar-collapsed') ||
      $('body').hasClass('sidebar-top') ||
      $('body').hasClass('submenu-hover')
    )
      $('.nav-sidebar .children').css({
        display: '',
      });
    else $('.nav-active.active .children').css('display', 'block');
    $('.sidebar').on('click', '.nav-sidebar li.nav-parent > a', function(e) {
      const hasHref = aEl => {
        const aHref = aEl.attr('href');
        return aHref && aHref.length > 0;
      };
      if (!hasHref($(this))) {
        e.preventDefault();
      }
      if (
        $('body').hasClass('sidebar-collapsed') &&
        !$('body').hasClass('sidebar-hover')
      )
        return;
      if ($('body').hasClass('submenu-hover')) return;
      const parent = $(this)
        .parent()
        .parent();
      parent
        .children('li.active')
        .children('.children')
        .slideUp(200);
      $('.nav-sidebar .arrow').removeClass('active');

      /*
      START
      原来会把一级.active 菜单移除 active，「大概况」一级菜单允许跳转，不移除 .active
      parent.children('li.active').removeClass('active');
       */
      const $activeLis = parent.children('li.active');
      $activeLis.each((index, li) => {
        if (!hasHref($(li).find('>a'))) {
          $(li).removeClass('active');
        }
      });
      // END

      const sub = $(this).next();
      if (sub.is(':visible')) {
        sub.children().addClass('hidden-item');
        $(this)
          .parent()
          .removeClass('active');
        sub.slideUp(200, function() {
          sub.children().removeClass('hidden-item');
        });
      } else {
        $(this)
          .find('.arrow')
          .addClass('active');
        sub.children().addClass('is-hidden');
        setTimeout(function() {
          sub.children().addClass('is-shown');
        }, 0);
        sub.slideDown(200, function() {
          $(this)
            .parent()
            .addClass('active');
          setTimeout(function() {
            sub
              .children()
              .removeClass('is-hidden')
              .removeClass('is-shown');
          }, 500);
        });
      }
    });
  }

  /**** Handle Sidebar Widgets ****/
  function sidebarWidgets() {
    /* Folders Widget */
    if ($('.sidebar-widgets .folders').length) {
      $('.new-folder').on('click', function() {
        $('.sidebar-widgets .add-folder').show();
        return false;
      });
      $('.add-folder input').keypress(function(e) {
        if (e.which == 13) {
          $('.sidebar-widgets .add-folder').hide();
          $(
            '<li><a href="#"><i class="icon-docs c-blue"></i>' +
              $(this).val() +
              '</a> </li>',
          ).insertBefore('.add-folder');
          $(this).val('');
        }
      });
      $('.main-content').click(function(ev) {
        const addFolder = document.getElementById('add-folder');
        const target = ev.target;
        if (target !== addFolder) {
          $('.sidebar-widgets .add-folder').hide();
        }
      });
    }
    /* Labels Widget */
    if ($('.sidebar-widgets .folders').length) {
      $('.new-label').on('click', function() {
        $('.sidebar-widgets .add-label').show();
        return false;
      });
      $('.add-label input').keypress(function(e) {
        if (e.which == 13) {
          $('.sidebar-widgets .add-label').hide();
          $(
            '<li><a href="#"><i class="fa fa-circle-o c-blue"></i>' +
              $(this).val() +
              '</a> </li>',
          ).insertBefore('.add-label');
          $(this).val('');
        }
      });
      $('.main-content').click(function(ev) {
        //
        const addFolder = document.getElementById('add-label');
        const target = ev.target;
        if (target !== addFolder) {
          $('.sidebar-widgets .add-label').hide();
        }
      });
    }
    /* Sparkline  Widget */
    if ((<any>(<any>$.fn)).sparkline && $('.dynamicbar1').length) {
      const myvalues1 = [
        13,
        14,
        16,
        15,
        11,
        14,
        20,
        14,
        12,
        16,
        11,
        17,
        19,
        16,
      ];
      const myvalues2 = [
        14,
        17,
        16,
        12,
        18,
        16,
        22,
        15,
        14,
        17,
        11,
        18,
        11,
        12,
      ];
      const myvalues3 = [
        18,
        14,
        15,
        14,
        15,
        12,
        21,
        16,
        18,
        14,
        12,
        15,
        17,
        19,
      ];
      const sparkline1 = (<any>$('.dynamicbar1')).sparkline(myvalues1, {
        type: 'bar',
        barColor: '#319DB5',
        barWidth: 4,
        barSpacing: 1,
        height: '28px',
      });
      const sparkline2 = (<any>$('.dynamicbar2')).sparkline(myvalues2, {
        type: 'bar',
        barColor: '#C75757',
        barWidth: 4,
        barSpacing: 1,
        height: '28px',
      });
      const sparkline3 = (<any>$('.dynamicbar3')).sparkline(myvalues3, {
        type: 'bar',
        barColor: '#18A689',
        barWidth: 4,
        barSpacing: 1,
        height: '28px',
      });
    }
    /* Progress Bar  Widget */
    if ($('.sidebar-widgets .progress-chart').length) {
      $(window).load(function() {
        setTimeout(function() {
          (<any>$('.sidebar-widgets .progress-chart .stat1')).progressbar();
        }, 900);
        setTimeout(function() {
          (<any>$('.sidebar-widgets .progress-chart .stat2')).progressbar();
        }, 1200);
        setTimeout(function() {
          (<any>$('.sidebar-widgets .progress-chart .stat3')).progressbar();
        }, 1500);
      });
    }
    $('.sidebar').on('click', '.hide-widget', function(e) {
      e.preventDefault();
      if (start == 0) {
        start = new Date().getTime();
        $(this).toggleClass('widget-hidden');
        const this_widget = $(this)
          .parent()
          .parent()
          .next();
        this_widget.slideToggle(200, function() {
          createSideScroll();
        });
        end = new Date().getTime();
        delta = end - start;
      } else {
        end = new Date().getTime();
        delta = end - start;
        if (delta > 200) {
          start = new Date().getTime();
          $(this).toggleClass('widget-hidden');
          const this_widget = $(this)
            .parent()
            .parent()
            .next();
          this_widget.slideToggle(200, function() {
            createSideScroll();
          });
          end = new Date().getTime();
          delta = end - start;
        }
      }
    });

    // 点击菜单如果变长导致无法滚动，每次点击菜单后重新 createSideScroll
    // $('.sidebar').on('click', '.sidebar-inner .nav-sidebar > li > a', _.debounce(() => {
    //   // setTimeout(createSideScroll, 100)
    // }, 200))
    /*
     通过 .mCSB_container.mCS_no_scrollbar {height: auto;} 解决
     对比官方最新版插件样式，对比样式发现 原来固定了容器高度（100%），
     那就需要每次都重新计算，每次重新计算的缺点就是，
     滚动位置重置，那就还是直接改样式吧~
     */
  }

  /* END SIDEBAR                                               */
  /* ========================================================= */
  /* Switch Top navigation to Sidebar */
  function reposition_topnav() {
    if ($('.nav-horizontal').length > 0) {
      topbarWidth = $('.topbar').width();
      headerRightWidth = $('.header-right').width();
      if ($('.header-left .nav-horizontal').length)
        headerLeftWidth = $('.header-left').width() + 40;
      else headerLeftWidth = $('.nav-sidebar.nav-horizontal > li').length * 140;
      const topbarSpace = topbarWidth - headerLeftWidth - headerRightWidth;
      // top navigation move to left nav if not enough space in topbar
      if (
        $('.nav-horizontal').css('position') == 'relative' ||
        topbarSpace < 0
      ) {
        if ($('.sidebar .nav-sidebar').length == 2) {
          $('.nav-horizontal').insertAfter('.nav-sidebar:eq(1)');
        } else {
          // only add to bottom if .nav-horizontal is not yet in the left panel
          if ($('.sidebar .nav-horizontal').length == 0) {
            $('.nav-horizontal').appendTo('.sidebar-inner');
            $('.sidebar-widgets').css('margin-bottom', 20);
          }
        }
        $('.nav-horizontal')
          .css({
            display: 'block',
          })
          .addClass('nav-sidebar')
          .css('margin-bottom', 100);
        createSideScroll();
        $('.nav-horizontal .children').removeClass('dropdown-menu');
        $('.nav-horizontal > li').each(function() {
          $(this).removeClass('open');
          $(this)
            .find('a')
            .removeAttr('class');
          $(this)
            .find('a')
            .removeAttr('data-toggle');
        });
        /* We hide mega menu in sidebar since video / images are too big and not adapted to sidebar */
        if ($('.nav-horizontal').hasClass('mmenu'))
          $('.nav-horizontal.mmenu')
            .css('height', 0)
            .css('overflow', 'hidden');
      } else {
        if ($('.sidebar .nav-horizontal').length > 0) {
          $('.sidebar-widgets').css('margin-bottom', 100);
          $('.nav-horizontal')
            .removeClass('nav-sidebar')
            .appendTo('.topnav');
          $('.nav-horizontal .children')
            .addClass('dropdown-menu')
            .removeAttr('style');
          $('.nav-horizontal li:last-child').show();
          $('.nav-horizontal > li > a').each(function() {
            $(this)
              .parent()
              .removeClass('active');
            if (
              $(this)
                .parent()
                .find('.dropdown-menu').length > 0
            ) {
              $(this).attr('class', 'dropdown-toggle');
              $(this).attr('data-toggle', 'dropdown');
            }
          });
        }
        /* If mega menu, we make it visible */
        if ($('.nav-horizontal').hasClass('mmenu'))
          $('.nav-horizontal.mmenu')
            .css('height', '')
            .css('overflow', '');
      }
    }
  }

  /***** Scroll to top button *****/
  function scrollTop() {
    $(window).scroll(function() {
      if ($(this).scrollTop() > 100) {
        $('.scrollup').fadeIn();
      } else {
        $('.scrollup').fadeOut();
      }
    });
    $('.scrollup').click(function() {
      $('html, body').animate(
        {
          scrollTop: 0,
        },
        1000,
      );
      return false;
    });
  }

  function sidebarBehaviour() {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height() - $('.topbar').height();
    const sidebarMenuHeight = $('.nav-sidebar').height();
    if (windowWidth < 1024) {
      $('body').removeClass('sidebar-collapsed');
    }
    if (
      $('body').hasClass('sidebar-collapsed') &&
      sidebarMenuHeight > windowHeight
    ) {
      $('body').removeClass('fixed-sidebar');
      destroySideScroll();
    }
  }

  /* Function for datables filter in head */
  function stopPropagation(evt) {
    if (evt.stopPropagation !== undefined) {
      evt.stopPropagation();
    } else {
      evt.cancelBubble = true;
    }
  }

  function detectIE() {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');
    const trident = ua.indexOf('Trident/');
    const edge = ua.indexOf('Edge/');
    if (msie > 0 || trident > 0 || edge > 0) {
      $('html').addClass('ie-browser');
    }
  }

  const scrolltotop = {
    //startline: Integer. Number of pixels from top of doc scrollbar is scrolled before showing control
    //scrollto: Keyword (Integer, or "Scroll_to_Element_ID"). How far to scroll document up when control is clicked on (0=top).
    setting: {
      startline: 100,
      scrollto: 0,
      scrollduration: 1000,
      fadeduration: [500, 100],
    },
    controlHTML:
      '<img src="//static.seecsee.com/seego_backend/images/top.png" style="width:40px; height:40px" />', //HTML for control, which is auto wrapped in DIV w/ ID="topcontrol"
    controlattrs: { offsetx: 10, offsety: 10 }, //offset of control relative to right/ bottom of window corner
    anchorkeyword: '#top', //Enter href value of HTML anchors on the page that should also act as "Scroll Up" links

    state: { isvisible: false, shouldvisible: false },

    scrollup() {
      if (!this.cssfixedsupport)
        //if control is positioned using JavaScript
        this.$control.css({ opacity: 0 }); //hide control immediately after clicking it
      let dest = isNaN(this.setting.scrollto)
        ? this.setting.scrollto
        : parseInt(this.setting.scrollto);
      if (typeof dest == 'string' && jQuery('#' + dest).length == 1)
        //check element set by string exists
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
      } else if (this.state.shouldvisible == false && this.state.isvisible) {
        this.$control
          .stop()
          .animate({ opacity: 0 }, this.setting.fadeduration[1]);
        this.state.isvisible = false;
      }
    },

    init() {
      jQuery(document).ready(function($) {
        const mainobj = <any>scrolltotop;
        const iebrws = document.all;
        mainobj.cssfixedsupport =
          !iebrws ||
          (iebrws &&
            document.compatMode == 'CSS1Compat' &&
            (<any>window).XMLHttpRequest); //not IE or IE7+ browsers in standards mode
        mainobj.$body = (<any>window).opera
          ? document.compatMode == 'CSS1Compat' ? $('html') : $('body')
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
          .click(function() {
            mainobj.scrollup();
            return false;
          })
          .appendTo('body');
        if (
          document.all &&
          !(<any>window).XMLHttpRequest &&
          mainobj.$control.text() != ''
        )
          //loose check for IE6 and below, plus whether control contains any text
          mainobj.$control.css({ width: mainobj.$control.width() }); //IE6- seems to require an explicit width on a DIV containing text
        mainobj.togglecontrol();
        $('a[href="' + mainobj.anchorkeyword + '"]').click(function() {
          mainobj.scrollup();
          return false;
        });
        $(window).bind('scroll resize', function(e) {
          mainobj.togglecontrol();
        });
      });
    },
  };
  /* coverGuide 新手引导定位 */
  function coverGuide(cover, target, con, cb) {
    // debugger
    const body = document.body,
      doc = document.documentElement;
    if (cover && target) {
      // target size(width/height)
      const targetWidth = target.clientWidth,
        targetHeight = target.clientHeight;

      // page size
      const pageHeight = doc.scrollHeight,
        pageWidth = doc.scrollWidth;

      // offset of target
      const offsetTop =
          target.getBoundingClientRect().top +
          (body.scrollTop || doc.scrollTop),
        offsetLeft =
          target.getBoundingClientRect().left +
          (body.scrollLeft || doc.scrollLeft);

      // set size and border-width
      cover.style.width = targetWidth + 'px';
      cover.style.height = targetHeight + 'px';
      cover.style.borderWidth =
        offsetTop -
        5 +
        'px ' +
        (pageWidth - targetWidth - offsetLeft) +
        'px ' +
        (pageHeight - targetHeight - offsetTop) +
        'px ' +
        (offsetLeft - 5) +
        'px';
      $('.lead-info')
        .css({
          display: 'block',
          top: offsetTop + targetHeight + 20,
          left: offsetLeft,
        })
        .find('p')
        .html(con);
      cover.style.display = 'block';
      $('.lead-info a').on('click', function() {
        cb && cb();
      });

      // resize
      // $(window).resize(function () {
      //   coverGuide(cover, target, con, cb);
      // })
    } else if (cover) {
      cover.style.width = '100%';
      cover.style.height = '100%';
      cover.style.backgroundColor = '#000';
      cover.style.display = 'block';
      $('.lead-info')
        .css({ display: 'block' })
        .find('p')
        .html(con);
      $('.lead-info a').on('click', function() {
        cb && cb();
      });
    }
  }
  /****  Initiation of Main Functions  ****/
  function init() {
    /* ==========================================================*/
    /* APPLICATION SCRIPTS                                       */
    /* ========================================================= */
    doc = document;
    docEl = document.documentElement;
    $body = $('body');
    $sidebar = $('.sidebar');
    $sidebarFooter = $('.sidebar .sidebar-footer');
    $mainContent = $('.main-content');
    $pageContent = $('[ng-view]');
    $topbar = $('.topbar');
    $logopanel = $('.logopanel');
    $sidebarWidth = $('.sidebar').width();
    content = document.querySelector('[ng-view]');
    $loader = $('#preloader');
    docHeight = $(document).height();
    windowHeight = $(window).height();
    topbarWidth = $('.topbar').width();
    headerLeftWidth = $('.header-left').width();
    headerRightWidth = $('.header-right').width();
    start = delta = end = 0;

    $('[data-toggle]').on('click', function(event) {
      event.preventDefault();
      const toggleLayout = $(this).data('toggle');
      if (toggleLayout == 'sidebar-behaviour') toggleSidebar();
      if (toggleLayout == 'submenu') toggleSubmenuHover();
      if (toggleLayout == 'sidebar-collapsed') collapsedSidebar();
      if (toggleLayout == 'sidebar-hover') toggleSidebarHover();
      if (toggleLayout == 'boxed') toggleboxedLayout();
      if (toggleLayout == 'topbar') toggleTopbar();
    });

    $('.toggle_fullscreen').click(function() {
      toggleFullScreen();
    });

    // Add class everytime a mouse pointer hover over it
    let hoverTimeout;
    $('.nav-sidebar > li').hover(
      function() {
        clearTimeout(hoverTimeout);
        $(this)
          .siblings()
          .removeClass('nav-hover');
        $(this).addClass('nav-hover');
      },
      function() {
        const $self = $(this);
        hoverTimeout = setTimeout(function() {
          $self.removeClass('nav-hover');
        }, 200);
      },
    );

    $('.nav-sidebar > li .children').hover(
      function() {
        clearTimeout(hoverTimeout);
        $(this)
          .closest('.nav-parent')
          .siblings()
          .removeClass('nav-hover');
        $(this)
          .closest('.nav-parent')
          .addClass('nav-hover');
      },
      function() {
        const $self = $(this);
        hoverTimeout = setTimeout(function() {
          $(this)
            .closest('.nav-parent')
            .removeClass('nav-hover');
        }, 200);
      },
    );

    // Check if sidebar is collapsed
    if ($('body').hasClass('sidebar-collapsed'))
      $('.nav-sidebar .children').css({
        display: '',
      });
    // Handles form inside of dropdown
    $('.dropdown-menu')
      .find('form')
      .click(function(e) {
        e.stopPropagation();
      });

    createSideScroll();
    toggleSidebarMenu();
    customScroll();
    handleSidebarSortable();
    sidebarWidgets();
    reposition_topnav();
    handleSidebarRemove();
    handleSidebarHide();
    changeUserStatut();
    handlePanelAction();
    scrollTop();
    sidebarBehaviour();
    detectIE();
    setTimeout(function() {
      handleboxedLayout();
    }, 100);
    scrolltotop.init();
    // if ($('body').hasClass('sidebar-hover')) sidebarHover();
  }

  /****  Resize Event Functions  ****/

  $(window).resize(function() {
    setTimeout(function() {
      customScroll();
      reposition_topnav();
      if (
        !$('body').hasClass('fixed-sidebar') &&
        !$('body').hasClass('builder-admin')
      )
        sidebarBehaviour();
      handleboxedLayout();
      maximizePanel();
    }, 100);
  });

  const applicationService = {
    init,
    handleSidebarFluid,
    handleSidebarSortable,
    handleSidebarHide,
    handleSidebarRemove,
    customScroll,
    handleSidebarFixed,
    handleTopbarFixed,
    handleTopbarFluid,
    createSidebarHover,
    removeSidebarHover,
    createSubmenuHover,
    removeSubmenuHover,
    createBoxedLayout,
    removeBoxedLayout,
    resetStyle,
    toggleSidebar,
    toggleSubmenuHover,
    collapsedSidebar,
    createCollapsedSidebar,
    toggleSidebarHover,
    toggleboxedLayout,
    toggleTopbar,
    handlePanelAction,
    coverGuide,
  };

  return applicationService;
}
