'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith('/');
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}
// 线上环境有不一样的meta设置
// <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
let appHtml = "src/index.html";
if (process.env.NODE_ENV !== 'production') { 
  appHtml = "src/index.local.html";
 }
module.exports = {
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('dist'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp(appHtml),
  authHtml: resolveApp('src/auth.html'),
  auth2Html: resolveApp('src/app/auth-v2/auth.html'),
  appPolyfills: resolveApp('src/polyfills.ts'),
  appMainTs: resolveApp('src/main.ts'),
  appAuth: resolveApp('src/app/auth-v2/main.ts'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appSrcCode: resolveApp('src/app'),
  appStyles: resolveApp('src/styles.less'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  tsConfig: resolveApp('tsconfig.json'),
  tsAppConfig: resolveApp('src/tsconfig.app.json'),
  loaders: resolveApp('config/loaders'),
  environments: resolveApp('src/environments/environment.ts'),
  prodEnvironments: resolveApp('src/environments/environment.prod.ts'),
};
