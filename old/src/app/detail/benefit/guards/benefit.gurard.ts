import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, switchMap, catchError } from 'rxjs/operators';

import { CommonServices } from '../services/common.service';
import { BenefitService } from '../services';

@Injectable()
export class BenefitGuard implements CanActivate {
  constructor(
    private commonService: CommonServices,
    private router: Router,
    private benefitService: BenefitService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.benefitService.routeParams = {
      url:state.url,
      ...route.data
    }
    return of(true);
  }

}
