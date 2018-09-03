import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}

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
