import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, filter, switchMap, catchError } from 'rxjs/operators';
import { isEmpty } from 'lodash';
import * as fromStore from '../store';
import { CommonService } from '../services';

@Injectable()
export class CooperationManagementGuard implements CanActivate {
  constructor(
    private store: Store<fromStore.KolState>,
    private commonService: CommonService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const { kolId, wechatId } = route.params;
    const { xdpId } = route.queryParams;
    this.store.dispatch(
      new fromStore.SetCommonData({ kolId, wechatId, xdpId }),
    );
    return this.checkStore(kolId, wechatId).pipe(
      switchMap(data => {
        if (data === false) {
          return of(false);
        }
        if (data.is_quhaodian) {
          return of(false);
        }
        return of(true);
      }),
      catchError(() => of(false)),
    );
  }

  checkStore(kol_id: number, wechatId: string) {
    return this.store.select(fromStore.getCurrentKolDataSelector).pipe(
      switchMap(kolData => {
        return !kolData.xdpId ||
          (typeof kolData.is_quhaodian === 'undefined' &&
            localStorage.getItem('is_quhaodian') !== '1')
          ? this.commonService.getKolInfo({ kol_id }).pipe(
              map(res => {
                if (isEmpty(res.data.kol_info.xdp_info)) {
                  this.router.navigateByUrl(
                    `/kol/kol-cooperation-management/${kol_id}?wechat_id=${res
                      .data.kol_info.weixin_id || 0}`,
                  );
                  return of(false);
                }
                this.store.dispatch(
                  new fromStore.LoadKolInfoSuccess(res.data.kol_info),
                );
                return res.data.kol_info;
              }),
              catchError(error =>
                of(this.store.dispatch(new fromStore.LoadKolInfoFail(error))),
              ),
            )
          : of(kolData);
      }),
    );
  }
}
