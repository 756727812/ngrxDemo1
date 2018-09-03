import { Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { MpToolsService } from './services/mp-tools.service';

export class MpToolsBase {
  public router: Router;
  public activeRoute: ActivatedRoute;
  public notify: NzNotificationService;
  public mpToolService: MpToolsService;

  constructor(injector: Injector) {
    this.router = injector.get(Router);
    this.activeRoute = injector.get(ActivatedRoute);
    this.notify = injector.get(NzNotificationService);
    this.mpToolService = injector.get(MpToolsService);
  }

  get loading() {
    return this.mpToolService.loading;
  }

  to(url, queryParams?: any) {
    return queryParams
      ? this.router.navigate([url], {
          queryParams,
          relativeTo: this.activeRoute,
        })
      : this.router.navigate([url]);
  }
}
