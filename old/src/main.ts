import { enableProdMode, style } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { preloaderFinished } from './app/utils/preloader';

preloaderFinished();
/*
const unique = (arr:Array<any>)=>{
  let res = [arr[0]];
  let ret = [];
  for(let i = 1;i<arr.length;i++){
    let rep = false;
    for(let j=0;j<res.length;j++){
      if(arr[i].innerText.replace(/\s+/g,"")===res[j].innerText.replace(/\s+/g,"")){
        rep = true;
        ret.push(arr[i]);
      }
    }
    if(!rep){
      res.push(arr[i]);
    }
  }
  return ret;
}*/

if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}
// else{
//   if (module['hot']) {
//     module['hot'].accept();
//     module['hot'].dispose(() => {
//       const styles = Array.from(document.head.querySelectorAll('style'));
//       const ngStyles = styles
//         .filter((style: any) => style.innerText.indexOf('_ng') !== -1);
//       const otherStyles = styles
//         .filter((style: any) => style.innerText.indexOf('_ng') === -1);
//         ngStyles.map((el: any) => document.head.removeChild(el));
//        unique(otherStyles.splice(1)).map(el=>document.head.removeChild(el));
//         const dom = document.body.querySelectorAll('#topcontrol,.cdk-overlay-container');
//         Array.from(dom).map(r=>document.body.removeChild(r));

//         const scripts = Array.from(document.head.querySelectorAll('script'));
//         ///5.850d84a23a344b31ac9e.hot-update.js
//         scripts.filter(r=>r.src.indexOf('hot-update.js')).map(r=>document.head.removeChild(r))

//     })
//   }
// }

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => {
    if ((<any>window).appBootstrap) {
      (<any>window).appBootstrap();
    }
  });

if ('serviceWorker' in navigator) {
  const unRegisterAll = () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
      console.debug('service workers have been unregistered.'); // tslint:disable-line no-console
    });
  };
  if (process.env.NODE_ENV !== 'production') {
    unRegisterAll();
  } else {
    fetch('/api/pwa/getDownGrade')
      .then(resp => resp.json())
      .then(data => {
        if (data['is_pwa_downgrade']) {
          unRegisterAll();
        } else {
          navigator.serviceWorker.register('/service-worker.js');
        }
      });
  }
}
