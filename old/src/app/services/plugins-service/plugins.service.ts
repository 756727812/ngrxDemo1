declare let Switchery: any;
declare let Ladda: any;
declare let CKEDITOR: any;
declare let Chart: any;
declare let countUp: any;

export function pluginsService() {
  /* ==========================================================*/
  /* PLUGINS                                                   */
  /* ========================================================= */

  /**** Color Picker ****/
  function colorPicker() {
    if ($('.color-picker').length && (<any>(<any>$.fn)).spectrum) {
      $('.color-picker').each(function() {
        let current_palette = '';
        if ($(this).data('palette')) {
          current_palette = $(this).data('palette');
        }
        (<any>$(this)).spectrum({
          color: $(this).data('min') ? $(this).data('min') : '#D15ADE',
          showInput: $(this).data('show-input')
            ? $(this).data('show-input')
            : false,
          showPalette: $(this).data('show-palette')
            ? $(this).data('show-palette')
            : false,
          showPaletteOnly: $(this).data('show-palette-only')
            ? $(this).data('show-palette-only')
            : false,
          showAlpha: $(this).data('show-alpha')
            ? $(this).data('show-alpha')
            : false,
          palette: $(this).data('palette')
            ? $(this).data('palette')
            : [[current_palette]],
        });
        $(this).show();
      });
    }
  }

  /**** Numeric Stepper ****/
  function numericStepper() {
    if ($('.numeric-stepper').length && (<any>(<any>$.fn)).TouchSpin) {
      $('.numeric-stepper').each(function() {
        (<any>$(this)).TouchSpin({
          min: $(this).data('min') ? $(this).data('min') : 0,
          max: $(this).data('max') ? $(this).data('max') : 100,
          step: $(this).data('step') ? $(this).data('step') : 0.1,
          decimals: $(this).data('decimals') ? $(this).data('decimals') : 0,
          boostat: $(this).data('boostat') ? $(this).data('boostat') : 5,
          maxboostedstep: $(this).data('maxboostedstep')
            ? $(this).data('maxboostedstep')
            : 10,
          verticalbuttons: $(this).data('vertical')
            ? $(this).data('vertical')
            : false,
          buttondown_class: $(this).data('btn-before')
            ? 'btn btn-' + $(this).data('btn-before')
            : 'btn btn-default',
          buttonup_class: $(this).data('btn-after')
            ? 'btn btn-' + $(this).data('btn-after')
            : 'btn btn-default',
        });
      });
    }
  }

  /**** Sortable Portlets ****/
  function sortablePortlets() {
    if ($('.portlets').length && (<any>(<any>$.fn)).sortable) {
      (<any>$('.portlets')).sortable({
        connectWith: '.portlets',
        handle: '.panel-header',
        items: 'div.panel',
        placeholder: 'panel-placeholder',
        opacity: 0.5,
        dropOnEmpty: true,
        forcePlaceholderSize: true,
        receive(event, ui) {
          $('body').trigger('resize');
        },
      });
    }
  }

  /**** Nestable List ****/
  function nestable() {
    if ($('.nestable').length && (<any>(<any>$.fn)).nestable) {
      (<any>$('.nestable')).nestable();
    }
  }

  /**** Sortable Table ****/
  function sortableTable() {
    if ($('.sortable_table').length && (<any>(<any>$.fn)).sortable) {
      (<any>$('.sortable_table')).sortable({
        itemPath: '> tbody',
        itemSelector: 'tbody tr',
        placeholder: '<tr class="placeholder"/>',
      });
    }
  }

  /****  Show Tooltip  ****/
  function showTooltip() {
    if ($('[data-rel="tooltip"]').length && (<any>(<any>$.fn)).tooltip) {
      (<any>$('[data-rel="tooltip"]')).tooltip();
    }
  }

  /****  Show Popover  ****/
  function popover() {
    if ($('[rel="popover"]').length && (<any>(<any>$.fn)).popover) {
      (<any>$('[rel="popover"]')).popover({
        trigger: 'hover',
      });
      (<any>$('[rel="popover_dark"]')).popover({
        template:
          '<div class="popover popover-dark"><div class="arrow"></div><h3 class="popover-title popover-title"></h3><div class="popover-content popover-content"></div></div>',
        trigger: 'hover',
      });
    }
  }

  /****  Table progress bar  ****/
  function progressBar() {
    if ($('.progress-bar').length && (<any>(<any>$.fn)).progressbar) {
      (<any>$('.progress-bar')).progressbar();
    }
  }

  /**** IOS Switch  ****/
  function iosSwitch() {
    if ($('.js-switch').length) {
      setTimeout(function() {
        $('.js-switch').each(function() {
          let colorOn = '#18A689';
          let colorOff = '#DFDFDF';
          if ($(this).data('color-on')) colorOn = $(this).data('color-on');
          if ($(this).data('color-on')) colorOff = $(this).data('color-off');
          if (colorOn == 'blue') colorOn = '#56A2D5';
          if (colorOn == 'red') colorOn = '#C75757';
          if (colorOn == 'yellow') colorOn = '#F3B228';
          if (colorOn == 'green') colorOn = '#18A689';
          if (colorOn == 'purple') colorOn = '#8227f1';
          if (colorOn == 'dark') colorOn = '#292C35';
          if (colorOff == 'blue') colorOff = '#56A2D5';
          if (colorOff == 'red') colorOff = '#C75757';
          if (colorOff == 'yellow') colorOff = '#F3B228';
          if (colorOff == 'green') colorOff = '#18A689';
          if (colorOff == 'purple') colorOff = '#8227f1';
          if (colorOff == 'dark') colorOff = '#292C35';
          const switchery = new Switchery(this, {
            color: colorOn,
            secondaryColor: colorOff,
          });
        });
      }, 500);
    }
  }

  /* Manage Slider */
  function sliderIOS() {
    if ($('.slide-ios').length && (<any>(<any>$.fn)).slider) {
      $('.slide-ios').each(function() {
        (<any>$(this)).sliderIOS();
      });
    }
  }

  /* Manage Range Slider */
  function rangeSlider() {
    if ($('.range-slider').length && (<any>(<any>$.fn)).ionRangeSlider) {
      $('.range-slider').each(function() {
        (<any>$(this)).ionRangeSlider({
          min: $(this).data('min') ? $(this).data('min') : 0,
          max: $(this).data('max') ? $(this).data('max') : 5000,
          hideMinMax: $(this).data('hideMinMax')
            ? $(this).data('hideMinMax')
            : false,
          hideFromTo: $(this).data('hideFromTo')
            ? $(this).data('hideFromTo')
            : false,
          to: $(this).data('to') ? $(this).data('to') : '',
          step: $(this).data('step') ? $(this).data('step') : '',
          type: $(this).data('type') ? $(this).data('type') : 'double',
          prefix: $(this).data('prefix') ? $(this).data('prefix') : '',
          postfix: $(this).data('postfix') ? $(this).data('postfix') : '',
          maxPostfix: $(this).data('maxPostfix')
            ? $(this).data('maxPostfix')
            : '',
          hasGrid: $(this).data('hasGrid') ? $(this).data('hasGrid') : false,
        });
      });
    }
  }

  /* Button Loading State */
  function buttonLoader() {
    if ($('.ladda-button').length) {
      Ladda.bind('.ladda-button', {
        timeout: 2000,
      });
      // Bind progress buttons and simulate loading progress
      Ladda.bind('.progress-demo button', {
        callback(instance) {
          let progress = 0;
          const interval = setInterval(function() {
            progress = Math.min(progress + Math.random() * 0.1, 1);
            instance.setProgress(progress);

            if (progress === 1) {
              instance.stop();
              clearInterval(interval);
            }
          }, 100);
        },
      });
    }
  }

  function inputSelect() {
    // if ((<any>(<any>$.fn)).select2) {
    //     setTimeout(function () {
    //         $('select').each(function () {
    //             function format(state) {
    //                 var state_id = state.id;
    //                 if (!state_id) return state.text; // optgroup
    //                 var res = state_id.split("-");
    //                 if (res[0] == 'image') {
    //                     if (res[2]) return "<img class='flag' src='../images/flags/" + res[1].toLowerCase() + "-" + res[2].toLowerCase() + ".png' style='width:27px;padding-right:10px;margin-top: -3px;'/>" + state.text;
    //                     else return "<img class='flag' src='../images/flags/" + res[1].toLowerCase() + ".png' style='width:27px;padding-right:10px;margin-top: -3px;'/>" + state.text;
    //                 }
    //                 else {
    //                     return state.text;
    //                 }
    //             }
    //             $(this).select2({
    //                 formatResult: format,
    //                 formatSelection: format,
    //                 placeholder: $(this).data('placeholder') ? $(this).data('placeholder') : '',
    //                 allowClear: $(this).data('allowclear') ? $(this).data('allowclear') : true,
    //                 minimumInputLength: $(this).data('minimumInputLength') ? $(this).data('minimumInputLength') : -1,
    //                 minimumResultsForSearch: $(this).data('search') ? 1 : -1,
    //                 dropdownCssClass: $(this).data('style') ? 'form-white' : ''
    //             });
    //         });
    //     }, 200);
    //     /* Demo Select Loading Data */
    //     function repoFormatResult(repo) {
    //         var markup = '<div class="row">' +
    //            '<div class="col-md-2"><img class="img-responsive" src="' + repo.owner.avatar_url + '" /></div>' +
    //            '<div class="col-md-10">' +
    //               '<div class="row">' +
    //                  '<div class="col-md-6">' + repo.full_name + '</div>' +
    //                  '<div class="col-md-3"><i class="fa fa-code-fork"></i> ' + repo.forks_count + '</div>' +
    //                  '<div class="col-md-3"><i class="fa fa-star"></i> ' + repo.stargazers_count + '</div>' +
    //               '</div>';
    //         if (repo.description) {
    //             markup += '<div>' + repo.description + '</div>';
    //         }
    //         markup += '</div></div>';
    //         return markup;
    //     }
    //     function repoFormatSelection(repo) {
    //         return repo.full_name;
    //     }
    //     if ($('#demo-loading-data').length) {
    //         $("#demo-loading-data").select2({
    //             placeholder: "Search for a repository",
    //             minimumInputLength: 1,
    //             ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
    //                 url: "https://api.github.com/search/repositories",
    //                 dataType: 'json',
    //                 quietMillis: 250,
    //                 data: function (term, page) {
    //                     return {
    //                         q: term, // search term
    //                     };
    //                 },
    //                 results: function (data, page) { // parse the results into the format expected by Select2.
    //                     // since we are using custom formatting functions we do not need to alter the remote JSON data
    //                     return { results: data.items };
    //                 },
    //                 cache: true
    //             },
    //             initSelection: function (element, callback) {
    //                 // the input tag has a value attribute preloaded that points to a preselected repository's id
    //                 // this function resolves that id attribute to an object that select2 can render
    //                 // using its formatResult renderer - that way the repository name is shown preselected
    //                 var id = $(element).val();
    //                 if (id !== "") {
    //                     $.ajax("https://api.github.com/repositories/" + id, {
    //                         dataType: "json"
    //                     }).done(function (data) { callback(data); });
    //                 }
    //             },
    //             formatResult: repoFormatResult, // omitted for brevity, see the source of this page
    //             formatSelection: repoFormatSelection,  // omitted for brevity, see the source of this page
    //             dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
    //             escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    //         });
    //     }
    // }
  }

  function inputTags() {
    $('.select-tags').each(function() {
      (<any>$(this)).tagsinput({
        tagClass: 'label label-primary',
      });
    });
  }

  /****  Tables Responsive  ****/
  function tableResponsive() {
    setTimeout(function() {
      $('.table').each(function() {
        const window_width = $(window).width();
        const table_width = $(this).width();
        const content_width = $(this)
          .parent()
          .width();
        if (table_width > content_width) {
          $(this)
            .parent()
            .addClass('force-table-responsive');
        } else {
          $(this)
            .parent()
            .removeClass('force-table-responsive');
        }
      });
    }, 200);
  }

  /****  Tables Dynamic  ****/
  function tableDynamic() {
    if ($('.table-dynamic').length && (<any>(<any>$.fn)).dataTable) {
      $('.table-dynamic').each(function() {
        const opt = {};
        if ($(this).hasClass('no-header')) {
          opt['bFilter'] = false;
          opt['bLengthChange'] = false;
        }
        if ($(this).hasClass('no-footer')) {
          opt['bInfo'] = false;
          opt['bPaginate'] = false;
        }
        if ($(this).hasClass('filter-head')) {
          $('.filter-head thead th').each(function() {
            const title = $('.filter-head thead th')
              .eq($(this).index())
              .text();
            $(this).append(
              '<input type="text" onclick="stopPropagation(event);" class="form-control" placeholder="Filter ' +
                title +
                '" />',
            );
          });
          const table = (<any>$('.filter-head')).DataTable();
          $('.filter-head thead input').on('keyup change', function() {
            table
              .column(
                $(this)
                  .parent()
                  .index() + ':visible',
              )
              .search(this.value)
              .draw();
          });
        }
        if ($(this).hasClass('filter-footer')) {
          $('.filter-footer tfoot th').each(function() {
            const title = $('.filter-footer thead th')
              .eq($(this).index())
              .text();
            $(this).html(
              '<input type="text" class="form-control" placeholder="Filter ' +
                title +
                '" />',
            );
          });
          const table = (<any>$('.filter-footer')).DataTable();
          $('.filter-footer tfoot input').on('keyup change', function() {
            table
              .column(
                $(this)
                  .parent()
                  .index() + ':visible',
              )
              .search(this.value)
              .draw();
          });
        }
        if ($(this).hasClass('filter-select')) {
          (<any>$(this)).DataTable({
            initComplete() {
              const api = this.api();

              api
                .columns()
                .indexes()
                .flatten()
                .each(function(i) {
                  const column = api.column(i);
                  const select = $(
                    '<select class="form-control" data-placeholder="Select to filter"><option value=""></option></select>',
                  )
                    .appendTo($(column.footer()).empty())
                    .on('change', function() {
                      const val = $(this).val();

                      column
                        .search(val ? '^' + val + '$' : '', true, false)
                        .draw();
                    });

                  column
                    .data()
                    .unique()
                    .sort()
                    .each(function(d, j) {
                      select.append(
                        '<option value="' + d + '">' + d + '</option>',
                      );
                    });
                });
            },
          });
        }
        if (
          !$(this).hasClass('filter-head') &&
          !$(this).hasClass('filter-footer') &&
          !$(this).hasClass('filter-select')
        ) {
          const oTable = (<any>$(this)).dataTable(opt);
          oTable.fnDraw();
        }
      });
    }
  }

  /* Time picker */
  function timepicker() {
    $('.timepicker').each(function() {
      (<any>$(this)).timepicker({
        timeFormat: $(this).attr('data-format', 'am-pm') ? 'hh:mm tt' : 'HH:mm',
      });
    });
  }

  /* Date picker */
  function datepicker() {
    $('.date-picker').each(function() {
      (<any>$(this)).datepicker({
        numberOfMonths: 1,
        prevText: '<i class="fa fa-angle-left"></i>',
        nextText: '<i class="fa fa-angle-right"></i>',
        showButtonPanel: false,
      });
    });
  }

  /* Date picker */
  function bDatepicker() {
    $('.b-datepicker').each(function() {
      (<any>$(this)).bootstrapDatepicker({
        startView: $(this).data('view') ? $(this).data('view') : 0, // 0: month view , 1: year view, 2: multiple year view
        language: $(this).data('lang') ? $(this).data('lang') : 'en',
        forceParse: $(this).data('parse') ? $(this).data('parse') : false,
        daysOfWeekDisabled: $(this).data('day-disabled')
          ? $(this).data('day-disabled')
          : '', // Disable 1 or various day. For monday and thursday: 1,3
        calendarWeeks: $(this).data('calendar-week')
          ? $(this).data('calendar-week')
          : false, // Display week number
        autoclose: $(this).data('autoclose')
          ? $(this).data('autoclose')
          : false,
        todayHighlight: $(this).data('today-highlight')
          ? $(this).data('today-highlight')
          : true, // Highlight today date
        toggleActive: $(this).data('toggle-active')
          ? $(this).data('toggle-active')
          : true, // Close other when open
        multidate: $(this).data('multidate')
          ? $(this).data('multidate')
          : false, // Allow to select various days
        orientation: $(this).data('orientation')
          ? $(this).data('orientation')
          : 'auto', // Allow to select various days,
      });
    });
  }

  /* Date & Time picker */
  function datetimepicker() {
    if ((<any>(<any>$.fn)).datetimepicker) {
      $('.datetimepicker').each(function() {
        (<any>$(this)).datetimepicker({
          prevText: '<i class="fa fa-angle-left"></i>',
          nextText: '<i class="fa fa-angle-right"></i>',
        });
      });

      /* Inline Date & Time picker */
      (<any>$('.inline_datetimepicker')).datetimepicker({
        altFieldTimeOnly: false,
      });
    }
  }

  /****  Summernote Editor  ****/
  function editorSummernote() {
    if ($('.summernote').length && (<any>(<any>$.fn)).summernote) {
      $('.summernote').each(function() {
        (<any>$(this)).summernote({
          height: 300,
          airMode: $(this).data('airmode') ? $(this).data('airmode') : false,
          airPopover: [
            ['style', ['style']],
            ['color', ['color']],
            ['font', ['bold', 'underline', 'clear']],
            ['para', ['ul', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture']],
          ],
          toolbar: [
            ['style', ['style']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['table', ['table']],
            ['view', ['codeview']],
          ],
        });
      });
    }
  }

  function formWizard() {
    if ($('.wizard').length && (<any>(<any>$.fn)).stepFormWizard) {
      $('.wizard').each(function() {
        const $this = $(this);
        if (!$(this).data('initiated')) {
          (<any>$(this)).stepFormWizard({
            theme: $(this).data('style') ? $(this).data('style') : 'circle',
            showNav: $(this).data('nav') ? $(this).data('nav') : 'top',
            height: 'auto',
            onNext(i, wizard) {
              if ($this.hasClass('wizard-validation')) {
                return (<any>$('form', wizard)).parsley().validate('block' + i);
              }
            },
            onFinish(i, wizard) {
              if ($this.hasClass('wizard-validation')) {
                return (<any>$('form', wizard)).parsley().validate();
              }
            },
          });
          $(this).data('initiated', true);
        }
      });

      /* Fix issue only with tabs with Validation on error show */
      $('#validation .wizard .sf-btn').on('click', function() {
        setTimeout(function() {
          $(window).resize();
          $(window).trigger('resize');
        }, 50);
      });
    }
  }

  function formValidation() {
    if ($('.form-validation').length && (<any>(<any>$.fn)).validate) {
      /* We add an addition rule to show you. Example : 4 + 8. You can other rules if you want */
      (<any>$).validator.methods.operation = function(value, element, param) {
        return value == param;
      };
      (<any>$).validator.methods.customemail = function(value, element) {
        return /^([-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4})+$/.test(
          value,
        );
      };
      $('.form-validation').each(function() {
        const formValidation = (<any>$(this)).validate({
          success: 'valid',
          submitHandler() {
            alert('Form is valid! We submit it');
          },
          errorClass: 'form-error',
          validClass: 'form-success',
          errorElement: 'div',
          ignore: [],
          rules: {
            avatar: { extension: 'jpg|png|gif|jpeg|doc|docx|pdf|xls|rar|zip' },
            password2: { equalTo: '#password' },
            calcul: { operation: 12 },
            url: { url: true },
            email: {
              required: {
                depends() {
                  $(this).val($.trim($(this).val()));
                  return true;
                },
              },
              customemail: true,
            },
          },
          messages: {
            name: { required: 'Enter your name' },
            lastname: { required: 'Enter your last name' },
            firstname: { required: 'Enter your first name' },
            email: {
              required: 'Enter email address',
              customemail: 'Enter a valid email address',
            },
            language: { required: 'Enter your language' },
            mobile: { required: 'Enter your phone number' },
            avatar: { required: 'You must upload your avatar' },
            password: { required: 'Write your password' },
            password2: {
              required: 'Write your password',
              equalTo: '2 passwords must be the same',
            },
            calcul: {
              required: 'Enter the result of 4 + 8',
              operation: 'Result is false. Try again!',
            },
            terms: { required: 'You must agree with terms' },
          },
          highlight(element, errorClass, validClass) {
            $(element)
              .closest('.form-control')
              .addClass(errorClass)
              .removeClass(validClass);
          },
          unhighlight(element, errorClass, validClass) {
            $(element)
              .closest('.form-control')
              .removeClass(errorClass)
              .addClass(validClass);
          },
          errorPlacement(error, element) {
            if (
              element.hasClass('custom-file') ||
              element.hasClass('checkbox-type') ||
              element.hasClass('language')
            ) {
              element.closest('.option-group').after(error);
            } else if (element.is(':radio') || element.is(':checkbox')) {
              element.closest('.option-group').after(error);
            } else if (element.parent().hasClass('input-group')) {
              element.parent().after(error);
            } else {
              error.insertAfter(element);
            }
          },
          invalidHandler(event, validator) {
            const errors = validator.numberOfInvalids();
          },
        });
        $('.form-validation .cancel').click(function() {
          formValidation.resetForm();
        });
      });
    }
  }

  /****  Animated Panels  ****/
  function liveTile() {
    if ($('.live-tile').length && (<any>(<any>$.fn)).liveTile) {
      $('.live-tile').each(function() {
        (<any>$(this)).liveTile(
          'destroy',
          true,
        ); /* To get new size if resize event */
        const tile_height = $(this).data('height')
          ? $(this).data('height')
          : $(this)
              .find('.panel-body')
              .height() + 52;
        (<any>$(this)).height(tile_height);
        (<any>$(this)).liveTile({
          speed: $(this).data('speed') ? $(this).data('speed') : 500, // Start after load or not
          mode: $(this).data('animation-easing')
            ? $(this).data('animation-easing')
            : 'carousel', // Animation type: carousel, slide, fade, flip, none
          playOnHover: $(this).data('play-hover')
            ? $(this).data('play-hover')
            : false, // Play live tile on hover
          repeatCount: $(this).data('repeat-count')
            ? $(this).data('repeat-count')
            : -1, // Repeat or not (-1 is infinite
          delay: $(this).data('delay') ? $(this).data('delay') : 0, // Time between two animations
          startNow: $(this).data('start-now')
            ? $(this).data('start-now')
            : true, //Start after load or not
        });
      });
    }
  }

  /**** Bar Charts: CHARTJS ****/
  function barCharts() {
    if ($('.bar-stats').length) {
      $('.bar-stats').each(function() {
        const randomScalingFactor = function() {
          return Math.round(Math.random() * 100);
        };
        const custom_colors = [
          '#C9625F',
          '#18A689',
          '#90ed7d',
          '#f7a35c',
          '#8085e9',
          '#f15c80',
          '#8085e8',
          '#91e8e1',
        ];
        const custom_color =
          custom_colors[Math.floor(Math.random() * custom_colors.length)];
        const barChartData = {
          labels: [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
          ],
          datasets: [
            {
              fillColor: custom_color,
              strokeColor: custom_color,
              highlightFill: '#394248',
              highlightStroke: '#394248',
              data: [
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
                randomScalingFactor(),
              ],
            },
          ],
        };
        const ctx = (<any>$(this)).get(0).getContext('2d');
        window['myBar'] = new Chart(ctx).Bar(barChartData, {
          responsive: true,
          scaleShowLabels: false,
          showScale: true,
          scaleLineColor: 'rgba(0,0,0,.1)',
          scaleShowGridLines: false,
        });
      });
    }
  }

  function textareaAutosize() {
    $('textarea.autosize').each(function() {
      (<any>$(this)).autosize();
    });
  }

  /****  On Resize Functions  ****/
  $(window).bind('resize', function(e) {
    window['resizeEvt'];
    $(window).resize(function() {
      clearTimeout(window['resizeEvt']);
      window['resizeEvt'] = setTimeout(function() {
        tableResponsive();
      }, 250);
    });
  });

  return {
    inputSelect,
    sortablePortlets,
    init() {
      /****  Variables Initiation  ****/
      const doc = document;
      const docEl = document.documentElement;
      const $sidebar = $('.sidebar');
      const $mainContent = $('.main-content');
      const $sidebarWidth = $('.sidebar').width();

      let oldIndex;
      if ($('.sortable').length && (<any>(<any>$.fn)).sortable) {
        (<any>$('.sortable')).sortable({
          handle: '.panel-header',
          start(event, ui) {
            oldIndex = ui.item.index();
            ui.placeholder.height(ui.item.height() - 20);
          },
          stop(event, ui) {
            const newIndex = ui.item.index();

            const movingForward = newIndex > oldIndex;
            const nextIndex = newIndex + (movingForward ? -1 : 1);

            const items = $('.sortable > div');

            // Find the element to move
            const itemToMove = items.get(nextIndex);
            if (itemToMove) {
              // Find the element at the index where we want to move the itemToMove
              const newLocation = $(items.get(oldIndex));

              // Decide if it goes before or after
              if (movingForward) {
                $(itemToMove).insertBefore(newLocation);
              } else {
                $(itemToMove).insertAfter(newLocation);
              }
            }
          },
        });
      }

      sortablePortlets();
      sortableTable();
      nestable();
      showTooltip();
      popover();
      colorPicker();
      numericStepper();
      iosSwitch();
      sliderIOS();
      rangeSlider();
      buttonLoader();
      inputSelect();
      inputTags();
      tableResponsive();
      tableDynamic();
      timepicker();
      datepicker();
      bDatepicker();
      datetimepicker();
      editorSummernote();
      liveTile();
      formWizard();
      formValidation();
      barCharts();
      textareaAutosize();
    },
  };
}
