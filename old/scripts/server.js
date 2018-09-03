const path = require('path');
const express = require('express');
const proxy = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const history = require('connect-history-api-fallback');
const LRUCache = require('lru-cache');
const expressStaticGzip = require('express-static-gzip');
// const compression = require('compression');
const paths = require('../config/paths');

const cookiesCache = new LRUCache({
  max: 100,
  maxAge: 1000 * 60 * 60 * 24, // 1d
});
const port = 3000;
const app = express();

function getCacheKey(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  return `${ip}`;
}

const onProxyReq = (proxyReq, req) => {
  const key = getCacheKey(req);
  if (cookiesCache.has(key)) {
    const cookieObj = {
      path: '/',
      domain: process.env.API,
      httponly: true,
      MANAGER_TOKEN: cookiesCache.get(key),
    };
    let cookieStr = '';
    Object.keys(cookieObj).forEach(v => {
      cookieStr += `${v}=${cookieObj[v]};`;
    });
    proxyReq.setHeader('cookie', cookieStr);
  }
};

const onProxyRes = (proxyRes, req) => {
  const proxyCookie = proxyRes.headers['set-cookie'];
  const key = getCacheKey(req);
  const cookies = {};
  if (proxyCookie) {
    proxyCookie.forEach(cookie => {
      cookie.split(';').forEach(ck => {
        const ckEntity = ck.split('=');
        cookies[ckEntity[0]] = ckEntity[1];
      });
    });
    cookiesCache.set(key, cookies.MANAGER_TOKEN);
  }
  // 如果是登出接口，要清掉cookie
  if (req && req.url === '/api/auth/logout') {
    cookiesCache.del(key);
  }
};

const proxyMiddleware = proxy({
  target: `http://${process.env.API}`,
  changeOrigin: true,
  logLevel: 'info',
  onProxyReq,
  onProxyRes,
});

app.use(cookieParser());
// app.use(compression());
app.use('/api', proxyMiddleware);
app.use(history());
app.use(
  '/',
  expressStaticGzip(paths.appBuild, {
    urlContains: 'static/',
    fallthrough: false,
    enableBrotli: true,
  }),
);
app.disable('x-powered-by');

app.listen(port, () => {
  console.info(`The server is running at http://localhost:${port}/`);
});

// API=backend.publish.seecsee.com node server.js
