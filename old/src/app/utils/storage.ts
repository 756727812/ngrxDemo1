/**
 * 临时解决办法，后面统一写一个 ACL service
 * @param key 存储键
 */
export function getItem(key: string) {
  const result = getFromCookies(key);
  return result || getFromLocalStorage(key);
}

function getFromCookies(key: string) {
  return (document.cookie.match(`(^|; )${key}=([^;]*)`) || 0)[2];
}

function getFromLocalStorage(key: string) {
  return localStorage;
}
