w5cValidatorConfig.$inject = ['w5cValidatorProvider'];
export function w5cValidatorConfig(w5cValidatorProvider: any) {
  w5cValidatorProvider.config({
    blurTrig: false,
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
      minlength: '密码长度不能小于{minlength}',
      maxlength: '密码长度不能大于{maxlength}',
      pattern: '密码需至少包含字母和数字，长度8~16位，区分大小写', // '密码须包含至少一个数字、一个大写字母、一个特殊字符(!@#$%^&*)，长度8~16位'
    },
    repeatPassword: {
      required: '重复密码不能为空',
      repeat: '两次密码输入不一致',
    },
    number: {
      required: '数字不能为空',
    },
    checkbox: {
      required: '请勾选至少一个选项',
    },
    customizer: {
      customizer: '输入长度不合法',
    },
    kol: {
      pattern: '请输入合法的KOL账号',
    },
    u_tag_desc: {
      required: '商户描述不能为空',
      minlength: '商户描述不能少于10个字',
      maxlength: '商户描述不能多于60个字',
    },
    mobile: {
      required: '手机号不能为空',
      pattern: '请输入合法的手机号码',
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
    kol_herald_time: {
      customizer: '请填入该KOL子商品ID',
      required: '该选项不能为空',
    },
    couponname: {
      customizer: '名称不得超过10个字',
      required: '该选项不能为空',
    },
    scopeText: {
      customizer: '适用范围文案超过字数限制',
      required: '该选项不能为空',
    },
    couponPrice: {
      customizer: '面额为不超过7位的正整数',
      required: '该选项不能为空',
    },
    limitMoney: {
      customizer: '使用门槛金额需大于优惠券面额',
    },
    allCount: {
      required: '该选项不能为空',
      pattern: '发行量应为正整数',
    },
    grouponSuccessNumber: {
      required: '请输入成团人数',
      pattern: '成团人数必须是大于1的正整数',
      min: '成团人数必须是大于1的正整数',
    },
    orders: {
      customizer: '最多可输入150个订单',
    },
    termOfValidityHours: {
      required: '请输入拼团有效期',
      pattern: '小时数必须是非负整数',
    },
    activityName: {
      required: '请输入活动名称',
    },
    productLimit: {
      pattern: '限量件数需为正整数',
    },
    feedbackContent: {
      minlength: '请填写{minlength}个字以上的意见或建议',
      maxlength: '请最多填写{maxlength}的意见或建议',
      required: '请输入您的问题和意见',
    },
    feedbackPhone: {
      pattern: '请输入正确的手机号',
    },
  });
}
