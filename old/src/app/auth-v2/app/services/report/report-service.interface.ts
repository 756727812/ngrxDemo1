export interface ReportDataItem {
  time: number; // 该条数据生产时间，long类型秒级
  user_id: string; // 用户id，未登录的填充0
  page_id: number; // 当前页面id
  content_id: number | string; // 页面承载的主体内容ID，例如心愿ID/合集ID/...，无填充0
  module_id: number; // 页面模块id，部分是公共模块id，部分是页面专用id
  opt_id: number; // 操作类型id，例如点击/滑动/...
  extend_str1?: string; // 动态扩展字段1，无填充空str非null
  extend_str2?: string; // 动态扩展字段2，无填充空str非null
  extend_str3?: string; // 动态扩展字段3，无填充空str非null
}

export interface IReportService {
  report: (
    page_id: number,
    content_id: number,
    module_id: number,
    opt_id: number,
  ) => void;
  reportByPageModuleKey: (pageKey: string, moduleKey: string) => void;
  reportByPageKey: (
    pageKey: string,
    extOptions?: { ext1?: string; ext2?: string; ext3?: string },
  ) => void;
  reportByKey: (
    key: string,
    extOptions?: { ext1?: string; ext2?: string; ext3?: string },
  ) => void;
}
