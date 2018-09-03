import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, filter, take, switchMap, catchError } from 'rxjs/operators';
import 'rxjs/add/operator/map';

import * as fromStore from '../store';

import { Accessor } from '../models/accessor.model';

@Injectable()
export class AccessorExistsGuard implements CanActivate {
  constructor(private store: Store<fromStore.WarehouseState>) {}

  canActivate(): Observable<boolean> {
    return this.checkStore().pipe(
      switchMap(() => of(true)),
      catchError(() => of(false)),
    );
  }

  checkStore(): Observable<void> {
    return this.store.select(fromStore.getAccessorsList).map(list => {
      if (!list.length) {
        this.store.dispatch(new fromStore.LoadAccessors());
      }
    });
  }
}
