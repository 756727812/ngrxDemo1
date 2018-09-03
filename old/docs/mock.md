# Mock Server

## 介绍

此项目使用 [Easy Mock](https://github.com/easy-mock/easy-mock) 作为 Mock Server。

服务地址为：http://femock.seeapp.com/，注册后进入控制台，加入团队 `xiaodianpu`，项目是 `saas`。

## 使用

httpService 中接口URL为 `mock/` 开头后跟真实的 API EndPoint，如：

``` ts
this.http.get('mock/api/xiaodianpu/getXiaoDianPuUser')
```

配置在 [WebpackDevServerUtils.js](../config/WebpackDevServerUtils.js)。
