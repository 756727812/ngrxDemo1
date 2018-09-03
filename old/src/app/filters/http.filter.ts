import { trim } from 'lodash';

export const httpUrl = () => str => {
  if (!str) {
    return '';
  }
  const trimedStr = trim(str);
  return /^(http|\/\/)/.test(trimedStr) ? trimedStr : `http://${trimedStr}`;
};
