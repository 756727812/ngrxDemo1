export const deviceType = () =>
  type => {
    if (typeof type == null || typeof type == "undefined") { return type }
    switch (Number(type)) {
      case 101:
        return 'Web'
      case 1:
        return 'iOS APP'
      case 3:
        return '安卓APP'
      case 102:
        return '安卓Seego'
      case -1:
        return '未知'
      case 201:
      default:
        return '小程序'
    }
  }
