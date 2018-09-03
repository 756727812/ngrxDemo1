/*
 沿用 http://chaijs.com/api/assert/ 的所有方法
 只在开发环境会执行断言，生成环境则所有方法为空方法
 */
import * as chai from 'chai';

const chaiAssert = chai.assert;
const wrapIfDev = (fn, ctx = null) => (...args) => {
  if (process.env.NODE_ENV === 'development') {
    fn.apply(ctx, args);
  }
};

const emptyFn = function() {};
let assert;
if (process.env.NODE_ENV === 'development') {
  assert = wrapIfDev(chaiAssert, chaiAssert);
  Object.keys(chaiAssert).forEach(key => {
    assert[key] = wrapIfDev(chaiAssert[key], chaiAssert);
  });
} else {
  assert = emptyFn;
  Object.keys(chaiAssert).forEach(key => {
    assert[key] = emptyFn;
  });
}
assert.whenDev = function(fn) {
  if (process.env.NODE_ENV === 'development') {
    fn();
  }
};

export function assertService() {
  return assert;
}
