import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';
import MobileResponsive from '../../utils/mobile-resposive';

const picturebox: string = '//static.seecsee.com/seego_backend/images/picturebox.png';

export class c2cSignupController {

  seller_class: string[] = ['服饰', '美妆', '配饰', '家居', '以上都是'];

  country_list: Array<any>;
  formData: any = {};

  email_validate_result: string;
  errors: string[];
  btn_disabled: boolean;
  is_term_checked: boolean;
  isDefaultImg: string;
  isMobile: boolean;

  static $inject: string[] = ['$window', '$uibModal', '$location', 'dataService'];
  constructor(
    private $window: ng.IWindowService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private $location: ng.ILocationService,
    private dataService: IDataService,
  ) {
    this.isMobile = this.$window.navigator.userAgent.toLowerCase().indexOf('mobile') >= 0;
  }

  $onInit() {
    MobileResponsive.start();
  }

  $onDestroy() {
    MobileResponsive.end();
  }
  signup: () => ng.IPromise<any> = () => {
    this.btn_disabled = true;
    const params = {
      ... this.formData,
      seller_type: 3,
    };
    console.log(params);
    return this.dataService.authv2_addAndUpdateInfo(params)
      .then(
      res => {
        this.$location.path('/register/3');
      })
      .catch(res => this.errors.push(res.msg))
      .finally(() => this.btn_disabled = false);
  }

  private handleiCheck: () => void = () => {
    if (!(<any>$()).iCheck) return;
    $(':checkbox:not(.js-switch, .switch-input, .switch-iphone, .onoffswitch-checkbox, .ios-checkbox, .md-checkbox), :radio:not(.md-radio)').each(function () {

      const checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
      const radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';

      if (~checkboxClass.indexOf('_line') || ~radioClass.indexOf('_line')) {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
          insert: '<div class="icheck_line-icon"></div>' + $(this).attr('data-label'),
        });
      } else {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
        });
      }
    });
  }
}

export const c2cSignup: ng.IComponentOptions = {
  controller: c2cSignupController,
  template: require('./c2c-signup.template.html'),
};
