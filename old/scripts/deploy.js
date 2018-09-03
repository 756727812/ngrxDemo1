require('dotenv').config();
const fs = require('fs');
const path = require('path');
const qiniu = require('qiniu');
const dir = require('node-dir');
const paths = require('../config/paths');
const rimraf = require("rimraf");

/** 上传凭证 */
const accessKey = process.env.QINIU_ACCESS_KEY;
const secretKey = process.env.QINIU_SECRET_KEY;
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: `${process.env.QINIU_BUCKET}:${process.env.QINIU_PREFIX}`,
  insertOnly: 1,
  isPrefixalScope: 1,
};
const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

/** 构建配置类 */
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z0;
config.useHttpsDomain = true;
config.useCdnDomain = true;

/** 数据流上传 */
const formUploader = new qiniu.form_up.FormUploader(config);

dir.files(path.join(paths.appBuild, 'static'), (err, files) => {
  if (err) throw err;
  Promise.all(files.map(filePath => {
    const readableStream = fs.createReadStream(filePath);
    const key = `seego_plus/static/${filePath
      .split('/')
      .slice(-2)
      .join('/')}`;
    return new Promise((resolve, reject) => {
      // putExtra 要么设为空，要么每次上传都单独设置，否则会影响七牛服务器的 MIME 类型判断
      formUploader.putStream(
        uploadToken,
        key,
        readableStream,
        null,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode == 200) {
            console.log(respBody);
            resolve();
          } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
            reject();
          }
        },
      );
    });
  })).then(() => {
    rimraf.sync(__dirname + '../dist/static')
  })
});
