import { IReportService } from '../../services/report-service/report-service.interface'


// TODO 只用 disabled 判断足够吗？
function reportDirective(reportService: IReportService) {
  return {
    // scope: {
    //   report: '<'
    // },
    restrict: 'AE',
    // replace: true,
    transclude: true,
    template: '<ng-transclude></ng-transclude>',
    link: function (scope, element, attrs, ctrls) {
      $(element).on('click.report', () => {
        const disabled = $(element).is('[disabled]') || $(element).hasClass('disabled')
        let reportKey = attrs.report.match(/^[a-zA-Z]/)
          ? attrs.report
          : scope.$eval(attrs.report)
        // report 通过'<' 传入，所以写字符串要这么写 report="'xxx'"
        // 如果忘了加单引号，那么就兼容处理读取 attrs.report
        let extOptions: any = null
        if (attrs.reportExt1 || attrs.reportExt2 || attrs.reportExt3) {
          extOptions = {
            ext1: attrs.reportExt1,
            ext2: attrs.reportExt2,
            ext3: attrs.reportExt3
          }
        }
        if (reportKey && !disabled) {
          reportService.reportByKey(reportKey, extOptions)
        }
      })

      scope.$on('$destroy', () => {
        $(element).off('click.report')
      })
    }
  }
}
reportDirective.$inject = ['reportService']

export default reportDirective
