export const waitDom = (argChecker, interval = 500) => {
  const checker =
    typeof argChecker === 'string' //
      ? () => $(argChecker).length
      : argChecker;
  let stop = false;
  const promise = new Promise(resolve => {
    const loop = () => {
      const checkResult = checker();
      if (stop) {
        return;
      }
      if (checkResult) {
        resolve(checkResult);
      } else {
        setTimeout(loop, interval);
      }
    };
    if (!stop) {
      loop();
    }
  });
  const cancel = () => {
    stop = true;
  };
  return {
    promise,
    cancel,
  };
};

// http://youmightnotneedjquery.com/#matches
export const matchSelector = (el, selector) =>
  (
    el.matches ||
    el.matchesSelector ||
    el.msMatchesSelector ||
    el.mozMatchesSelector ||
    el.webkitMatchesSelector ||
    el.oMatchesSelector
  ).call(el, selector);

// http://youmightnotneedjquery.com/#has_class
export const hasClass = (el: HTMLElement, className: string) => {
  if (el.classList) {
    return el.classList.contains(className);
  }
  return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
};

export class position {
  constructor() {}
  static getViewport(): any {
    let win = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      w = win.innerWidth || e.clientWidth || g.clientWidth,
      h = win.innerHeight || e.clientHeight || g.clientHeight;

    return { width: w, height: h };
  }

  /**
   * 获得窗口滚动高度
   */
  static getWindowScrollTop(): number {
    let doc = document.documentElement;
    return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  }

  /**
   * 获得窗口滚动宽度
   */
  static getWindowScrollLeft(): number {
    let doc = document.documentElement;
    return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  }
  /**
   * 获得绝对位置
   * @param element
   * @param target
   */
  static absolutePosition(element: any, target: any): void {
    let elementDimensions = element.offsetParent
      ? { width: element.offsetWidth, height: element.offsetHeight }
      : this.getHiddenElementDimensions(element);
    let elementOuterHeight = elementDimensions.height;
    let elementOuterWidth = elementDimensions.width;
    let targetOuterHeight = target.offsetHeight;
    let targetOuterWidth = target.offsetWidth;
    let targetOffset = target.getBoundingClientRect();
    let windowScrollTop = this.getWindowScrollTop();
    let windowScrollLeft = this.getWindowScrollLeft();
    let viewport = this.getViewport();
    let top, left;

    if (
      targetOffset.top + targetOuterHeight + elementOuterHeight >
      viewport.height
    ) {
      top = targetOffset.top + windowScrollTop - elementOuterHeight;
      if (top < 0) {
        top = 0 + windowScrollTop;
      }
    } else {
      top = targetOuterHeight + targetOffset.top + windowScrollTop;
    }

    if (
      targetOffset.left + targetOuterWidth + elementOuterWidth >
      viewport.width
    )
      left =
        targetOffset.left +
        windowScrollLeft +
        targetOuterWidth -
        elementOuterWidth;
    else left = targetOffset.left + windowScrollLeft;

    element.style.top = top + 'px';
    element.style.left = left + 'px';
  }
  /**
   * 获得尺寸
   * @param element
   */
  static getHiddenElementDimensions(element: any): any {
    let dimensions: any = {};
    element.style.visibility = 'hidden';
    element.style.display = 'block';
    dimensions.width = element.offsetWidth;
    dimensions.height = element.offsetHeight;
    element.style.display = 'none';
    element.style.visibility = 'visible';

    return dimensions;
  }
  /**
   * 获得实际位置
   * @param element
   * @param target
   */
  static relativePosition(element: any, target: any): void {
    let elementDimensions = element.offsetParent
      ? { width: element.offsetWidth, height: element.offsetHeight }
      : this.getHiddenElementDimensions(element);
    let targetHeight = target.offsetHeight;
    let targetWidth = target.offsetWidth;
    let targetOffset = target.getBoundingClientRect();
    let windowScrollTop = this.getWindowScrollTop();
    let viewport = this.getViewport();
    let top, left;

    if (
      targetOffset.top + targetHeight + elementDimensions.height >
      viewport.height
    ) {
      top = -1 * elementDimensions.height;
      if (targetOffset.top + top < 0) {
        top = 0;
      }
    } else {
      top = targetHeight;
    }

    if (targetOffset.left + elementDimensions.width > viewport.width)
      left = targetWidth - elementDimensions.width;
    else left = 0;

    element.style.top = top + 'px';
    element.style.left = left + 'px';
  }
}

export default {
  waitDom,
  matchSelector,
  hasClass,
  position,
};
