signupConfig.$inject = ['w5cValidatorProvider'];
function signupConfig(w5cValidatorProvider) {
  // 全局配置
  w5cValidatorProvider.config({
    blurTrig: true,
    showError: true,
    removeError: true,
  });

  w5cValidatorProvider.setRules({
    email: {
      required: '输入的邮箱地址不能为空',
      email: '输入邮箱地址格式不正确',
    },
    username: {
      required: '输入的用户名不能为空',
      pattern: '用户名必须输入字母、数字、下划线,以字母开头',
      w5cuniquecheck: '输入用户名已经存在，请重新输入',
    },
    password: {
      required: '密码不能为空',
      minlength: '密码长度不能小于8',
      maxlength: '密码长度不能大于16',
      pattern: '密码需至少包含字母和数字，长度8~16位，区分大小写', // "密码须包含至少一个数字、一个大写字母、一个特殊字符(!@#$%^&*)，长度8~16位"
    },
    repeatPassword: {
      required: '重复密码不能为空',
      repeat: '两次密码输入不一致',
    },
    number: {
      required: '数字不能为空',
    },
    u_tag_desc: {
      required: '商户描述不能为空',
      minlength: '商户描述不能少于10个字',
      maxlength: '商户描述不能多于60个字',
    },
    mobile: {
      required: '手机号不能为空',
      pattern: '请输入合法的手机号',
    },
    terms: {
      required: '请同意遵守此协议',
    },
    frontImg: {
      required: '请上传清晰证件照',
    },
    backImg: {
      required: '请上传手持证件照',
    },
    customizer: {
      customizer: '中文阿拉伯数字字母合计不超过20字符，每个中文等于两个字符',
    },
  });
}

Plugin.$inject = ['$uibModal'];
function Plugin($uibModal) {
  const Plugin = {
    handleiCheck,
    showBind,
  };

  return Plugin;

  function handleiCheck() {
    if (!(<any>$()).iCheck) return;
    $(
      ':checkbox:not(.js-switch, .switch-input, .switch-iphone, .onoffswitch-checkbox, .ios-checkbox, .md-checkbox), :radio:not(.md-radio)',
    ).each(function() {
      const checkboxClass = $(this).attr('data-checkbox')
        ? $(this).attr('data-checkbox')
        : 'icheckbox_minimal-grey';
      const radioClass = $(this).attr('data-radio')
        ? $(this).attr('data-radio')
        : 'iradio_minimal-grey';

      if (~checkboxClass.indexOf('_line') || ~radioClass.indexOf('_line')) {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
          insert:
            '<div class="icheck_line-icon"></div>' + $(this).attr('data-label'),
        });
      } else {
        (<any>$(this)).iCheck({
          checkboxClass,
          radioClass,
        });
      }
    });
  }

  function showBind() {
    $uibModal.open({
      animation: true,
      // templateUrl: 'detail/register/show-bind-modal.html',
      template: require('./show-bind-modal.html'),
      controller: 'modalConfirmCtrl',
      controllerAs: 'vm',
      size: 'lg',
    });
  }
}

modalConfirmCtrl.$inject = ['$uibModalInstance'];
function modalConfirmCtrl($uibModalInstance) {
  const vm = this;

  vm.cancel = cancel;

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }
}

export const signupwith = {
  Plugin,
  signupConfig,
  modalConfirmCtrl,
};
