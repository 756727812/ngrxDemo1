数据上报
===

## 上报数据格式

```json
"dynamic_args":[{
  "time":1434556935,		//该条数据生产时间，long类型秒级
  "user_id":89757,			//用户id，未登录的填充0
  "page_id":8,			//当前页面id
  "content_id":191833,		//页面承载的主体内容ID，例如心愿ID/合集ID/...，无填充0
  "module_id":2,			//页面模块id，部分是公共模块id，部分是页面专用id
  "opt_id":1,				//操作类型id，例如点击/滑动/...
  "extend_str1":"",			//动态扩展字段1，无填充空str非null
  "extend_str2":"",			//动态扩展字段2，无填充空str非null
  "extend_str3":""			//动态扩展字段3，无填充空str非null
}, ...]
```

## 设计原则

- 上报数据配置

  所有静态的数据，都先配置在一个公共映射文件中，其中某些内容可能是动态，如果在系统进入的时候能够确定这个「动态数据」，那么这类数据也认为是静态的，我们可以枚举一些特殊字符来表示这类『静态信息』

  配置长这样:

  ```js
  //event-map-dont-edit-manually.ts
  PAGE_CREATE_SHOP:{ // 小电铺创建页
    PV: { code: '2002-x-101-1-x-refer-x' }, // 加载
  },
  PAGE_THEME_LIST:{ // 选品中心-主题选品页
    PV: { code: '2009-shop_id-101-1-x-x-x' }, // 加载
  }
  ```

  `code` 部分从左到右一次为， `${页面Id}-${内容Id}-${控件(模块)ID}-${操作ID}-${动态扩展1}-${动态扩展2}-${动态扩展3}`

  系统上报的时候，如果遇到 `refer`, `shop_id` 等特殊字符串，可以从全局信息中拿到对应的数据


## 用法

### 路由页面 PV
NG1 直接写在路由 config 中的 `route` 对象中的 `reportKey`。
NG2 放入路由的 `data` 属性中，例如：

``` typescript
{
  path: 'micro-page',
  component: fromContainers.MicroPageComponent,
  data: {
    report: 'PAGE_SHOP_OVERVIEW',
    reportExt1: '111',
  },
},
```

### 页面点击交互

无论是 NG2 还是 NG1，都有相应的 `report` 指令，值为相应的KEY。
