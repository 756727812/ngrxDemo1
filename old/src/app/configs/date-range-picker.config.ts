dateRangePickerConfig.$inject = ['dateRangePickerConfig']
export function dateRangePickerConfig(dateRangePickerConfig) {
  Object.assign(dateRangePickerConfig, {
    applyClass: 'btn-primary',
    clearLabel: '清空',
    locale: {
      separator: ' - ',
      'format': 'YYYY-MM-DD',
      'applyLabel': '确定',
      'cancelLabel': '取消',
      'daysOfWeek': ['日', '一', '二', '三', '四', '五', '六'],
      'monthNames': ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    }
  })
}
