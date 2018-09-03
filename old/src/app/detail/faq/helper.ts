import CONST from './const';
import { find } from 'lodash';

const _getDocHref = item => {
  const { title, href } = item;
  return `/help-doc.html?title=${encodeURIComponent(
    title,
  )}&src=${encodeURIComponent(href)}`;
};

export const getDocPageHref = (levelOneId, levelTwoId) => {
  const levelOneItem: any = find(CONST.list, { id: levelOneId });
  if (levelOneItem) {
    const subItem: any = find(levelOneItem.items, { id: levelTwoId });
    if (subItem && subItem.href) {
      return _getDocHref(subItem);
    } else {
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`二级帮助找不到 ${levelOneId} 下的 ${levelTwoId}`);
      }
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`一级帮助找不到 ${levelOneId}`);
    }
  }
};

export const openDocPage = (levelOneId, levelTwoId) => {
  const href = getDocPageHref(levelOneId, levelTwoId);
  href && self.open(href);
};
