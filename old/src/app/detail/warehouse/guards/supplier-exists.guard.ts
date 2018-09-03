import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, map, filter, take, switchMap } from 'rxjs/operators';
import * as fromStore from '../store';

import { Supplier } from '../models';

@Injectable()
export class SupplierExistsGuard implements CanActivate {
  constructor(private store: Store<fromStore.WarehouseState>) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const { id } = route.params;
    this.store.dispatch(new fromStore.LoadSupplierItem(id));
    return of(true);
  }
}
