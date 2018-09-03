export const makeSureTimeFly = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
      // tslint:disable-next-line:align
    }, ms);
  });

export default '';
