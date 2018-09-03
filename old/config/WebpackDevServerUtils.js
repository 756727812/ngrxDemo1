'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const address = require('address');
const url = require('url');

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return (err, req, res) => {
    const host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') +
      ' Could not proxy request ' +
      chalk.cyan(req.url) +
      ' from ' +
      chalk.cyan(host) +
      ' to ' +
      chalk.cyan(proxy) +
      '.',
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) +
      ').',
    );
    console.log();

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
      res.writeHead(500);
    }
    res.end(
      'Proxy error: Could not proxy request ' +
      req.url +
      ' from ' +
      host +
      ' to ' +
      proxy +
      ' (' +
      err.code +
      ').',
    );
  };
}

function resolveLoopback(proxy) {
  const o = url.parse(proxy);
  o.host = undefined;
  if (o.hostname !== 'localhost') {
    return proxy;
  }
  // Unfortunately, many languages (unlike node) do not yet support IPv6.
  // This means even though localhost resolves to ::1, the application
  // must fall back to IPv4 (on 127.0.0.1).
  // We can re-enable this in a few years.
  /*try {
    o.hostname = address.ipv6() ? '::1' : '127.0.0.1';
  } catch (_ignored) {
    o.hostname = '127.0.0.1';
  }*/

  try {
    // Check if we're on a network; if we are, chances are we can resolve
    // localhost. Otherwise, we can just be safe and assume localhost is
    // IPv4 for maximum compatibility.
    if (!address.ip()) {
      o.hostname = '127.0.0.1';
    }
  } catch (_ignored) {
    o.hostname = '127.0.0.1';
  }
  return url.format(o);
}

function prepareProxy(proxy, appPublicFolder) {
  // `proxy` lets you specify alternate servers for specific requests.
  // It can either be a string or an object conforming to the Webpack dev server proxy configuration
  // https://webpack.github.io/docs/webpack-dev-server.html
  if (!proxy) {
    return undefined;
  }
  if (typeof proxy !== 'object' && typeof proxy !== 'string') {
    console.log(
      chalk.red(
        'When specified, "proxy" in package.json must be a string or an object.',
      ),
    );
    console.log(
      chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'),
    );
    console.log(
      chalk.red(
        'Either remove "proxy" from package.json, or make it an object.',
      ),
    );
    process.exit(1);
  }

  // Otherwise, if proxy is specified, we will let it handle any request except for files in the public folder.
  function mayProxy(pathname) {
    const maybePublicPath = path.resolve(appPublicFolder, pathname.slice(1));
    return !fs.existsSync(maybePublicPath);
  }

  const APP_ENV = process.env.APP_ENV || 'devcdn';
  proxy = proxy[APP_ENV];

  if (!/^http(s)?:\/\//.test(proxy)) {
    console.log(
      chalk.red(
        'When "proxy" is specified in package.json it must start with either http:// or https://',
      ),
    );
    process.exit(1);
  }

  let target;
  if (process.platform === 'win32') {
    target = resolveLoopback(proxy);
  } else {
    target = proxy;
  }

  /**
   * Node 内存中存取 cookie
   */
  global.cookie = {};
  const onProxyReq = proxyReq => {
    // Browers may send Origin headers even with same-origin
    // requests. To prevent CORS issues, we have to change
    // the Origin to match the target URL.
    if (proxyReq.getHeader('origin')) {
      proxyReq.setHeader('origin', target);
    }
    if (global.cookie) {
      let cookie = '';
      Object.keys(global.cookie).forEach(v => {
        cookie += `${v}=${global.cookie[v]};`;
      });
      proxyReq.setHeader('cookie', cookie);
    }
  };

  const onProxyRes = (proxyRes, req) => {
    const proxyCookie = proxyRes.headers['set-cookie'];
    if (proxyRes.headers['x-application-context']) {
      proxyRes.headers['x-application-context'] = ''
    }
    if (proxyCookie) {
      proxyCookie.forEach(cookie => {
        cookie.split(';').forEach(ck => {
          let ckEntity = ck.split('=');
          global.cookie[ckEntity[0]] = ckEntity[1];
        });
      });
    }
    // 如果是登出接口，要清掉cookie
    if (req && req.url === '/api/auth/logout') {
      global.cookie = [];
    }
  };
  return [{
      target,
      logLevel: 'silent',
      // For single page apps, we generally want to fallback to /index.html.
      // However we also want to respect `proxy` for API calls.
      // So if `proxy` is specified as a string, we need to decide which fallback to use.
      // We use a heuristic: if request `accept`s text/html, we pick /index.html.
      // Modern browsers include text/html into `accept` header when navigating.
      // However API calls like `fetch()` won’t generally accept text/html.
      // If this heuristic doesn’t work well for you, use a custom `proxy` object.
      context: '/api',
      onProxyReq,
      onProxyRes,
      onError: onProxyError(target),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    },
    {
      target: 'http://femock.seeapp.com/mock/5aa73bd5ea941b006e322def/',
      logLevel: 'silent',
      context: '/mock',
      onError: onProxyError(target),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    },
    {
      target: 'http://seedata-test.seecsee.com:14180',
      logLevel: 'silent',
      context: '/dapi',
      onProxyReq,
      onProxyRes,
      onError: onProxyError(target),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    },
  ];
}

module.exports = {
  prepareProxy,
};
