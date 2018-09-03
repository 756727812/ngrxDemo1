export function preloaderFinished() {
  const body = document.querySelector('body');
  const preloader = document.querySelector('.preloader');

  body.style.overflow = 'hidden';

  function remove() {
    // 热加载时 preloader 为空
    if (!preloader) return;
    preloader.addEventListener('transitionend', () => {
      preloader.className = 'preloader-hidden';
    });

    preloader.className += ' preloader-hidden-add preloader-hidden-add-active';
  }

  (<any>window).appBootstrap = () => {
    setTimeout(() => {
      remove();
      body.style.overflow = '';
    }, 100);
  };
}
