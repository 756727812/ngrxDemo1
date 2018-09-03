const STR_HACK_OCCUPY = `___x${Date.now()}x__`;

// 保证图片路最终合法，如：加上域名...
// TODO image2view 参数, webp
export const confirmImgHost = url => {
  if (!url) {
    return '';
  }
  let src = url;
  // 某些图片路径会多一个斜杠，导致获取图片失败
  if (src && /[^:]\/\//.test(src)) {
    src = src
      .replace('://', STR_HACK_OCCUPY)
      .replace(/\/\//g, '/')
      .replace(STR_HACK_OCCUPY, '://');
  }
  if (src && src.indexOf('//') < 0) {
    src = `//image.seecsee.com${/^\//.test(src) ? '' : '/'}${src}`;
  }
  // 正式环境，返回的某些图片链接是 http，会导致第一次访问图片失败
  // 修改为根据当前协议
  src = src.replace('http://', '//');
  return src;
};

// 把图片的 src url 转为base64
export function toImgDataURL(url: string): Promise<string> {
  const TIMEOUT = 30000;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = done;
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();

    function done() {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) {
        reject('cannot fetch resource: ' + url + ', status: ' + xhr.status);
      }
      const reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    }
  });
}

export const formatSrc = (
  originalSrc: string,
  hasWebp: boolean = false,
  thumbnail: string = '',
  crop: string = '',
  gravity: string = '',
) => {
  let seeSrc = originalSrc;
  // 1. 纠正地址，可能返回多个 1688 的爬图
  if (/([^;]+\/1688\/[^;]+);([^;]+\/1688\/[^;]+)/.test(seeSrc)) {
    seeSrc = seeSrc.split(';')[0];
  }

  // 2. 保证带上域名
  seeSrc = confirmImgHost(seeSrc);

  // 3. 保证 https，如果浏览器 https 页面访问七牛 http，第一次访问会 break，不知道为啥，统一 https
  if (/(seecsee|qiniucdn|alicdn)\.com/.test(seeSrc)) {
    seeSrc = seeSrc.replace('http:', 'https:');
  }
  // 4. 图片处理的 query
  /*
    /thumbnail/<Width>x<Height>
    等比缩放，比例值为宽缩放比和高缩放比的较小值，Width 和 Height 取值范围1-9999。
    注意：宽缩放比：目标宽/原图宽   高缩放比：目标高/原图高

    /thumbnail/!<Width>x<Height>r
    等比缩放，比例值为宽缩放比和高缩放比的较大值，Width 和 Height 取值范围1-9999。
    注意：宽缩放比：目标宽/原图宽   高缩放比：目标高/原图高
     */
  if (/(seecsee|qiniucdn)\.com/.test(seeSrc) && seeSrc.indexOf('?') === -1) {
    seeSrc = `${seeSrc}?imageMogr2${thumbnail}/strip/format/${
      hasWebp ? 'webp' : 'jpg'
    }${gravity}${crop}`;
  }
  return seeSrc;
};
