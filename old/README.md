# 小电铺 SAAS

[![Build Status](http://feci.seeapp.com/api/badges/FE/xiaodianpu-saas/status.svg)](http://feci.seeapp.com/FE/xiaodianpu-saas)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)

小电铺 SAAS 项目，包含电商、KOL 运营、数据、财务等多个业务模块。

* 生产环境：https://portal.xiaodianpu.com
* 测试环境
  * https://backend-test.seecsee.com
  * http://backend-test-pb.seecsee.com
  * http://backend.devcdn.seecsee.com
  * http://backend.publish.seecsee.com

## Templates

```
src
├── app
│   ├── auth # 登录注册模块（ng1）
│   ├── components # ng1 公共组件
│   ├── configs # ng1 公共配置，包括路由
│   ├── const
│   ├── core # ng2 核心配置模块
│   │   └── net # 拦截器
│   ├── detail # 业务模块
│   ├── directives # ng1 公共指令
│   ├── filters # ng1 过滤器
│   ├── misc # 全局 jQuery/JS 代码
│   ├── services # ng1 公共服务
│   ├── shared # ng2 公共模块
│   │   ├── components
│   │   ├── directives
│   │   ├── guards
│   │   ├── pipes
│   │   └── services
│   ├── store # ngrx 中的公共状态，包括路由
│   └── utils # 帮助方法
├── environments
├── fonts # 自定义字体图标
│   └── sicon
├── images # 公共图片，业务相关的请放到相应组件文件夹，构建时会统一打包到 dist/static/media 上传至七牛
├── styles # 公共样式
│   ├── antd # ant design 核心样式
│   ├── app # ant design patch 样式
│   ├── components # 老的组件样式 @deprecated
│   ├── fn # 老的less方法 @deprecated
│   ├── theme-ui # 老的主题样式 @deprecated
│   ├── themes # ant design 自定义主题
│   └── utils # less 帮助样式
├── auth.html # 登录注册页 (ng1)
├── index.html
├── main.ts # ng2 启动代码，注册 service-worker
├── polyfills.ts # 兼容库
├── styles.less # 应用入口样式，和 ng2 公共样式
├── tsconfig.app.json # 应用 typescript 配置
├── tsconfig.spec.json # 应用测试时 typescript 配置
└── typings.d.ts # 自定义 ts 类型
```

## Usage

```bash
$ yarn install
$ yarn start # 代理接口默认为 package.json 中 proxy 项 devcdn 键的值
$ yarn run start:prod # 代理生产环境接口
$ yarn run build # 构建
```

## Documentation

* [**Icon Font 管理**](docs/font_icon_mgr.md)
* [**UI 样式**](docs/see_ui_reference.md)
* [**NG2 升级**](https://mazhixiong.com/post/upgrading-from-angularjs-to-angular.html)
* [**数据上报**](docs/data_report.md)
* [**应用部署**](docs/deploy.md)
* [**工作流**](docs/workflow.md)
* [**VSCode 配置**](docs/vs_code.md)
* [**Mock Server**](docs/mock.md)

## Compatibility

Modern browsers and IE11

