import { Injector } from '@angular/core';
import { BenefitService } from './services';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from './services/utils.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { Location } from '@angular/common';


export class BaseBenefitBase {
  public router: Router;
  public activeRoute: ActivatedRoute;
  public benefitService: BenefitService;
  public utils: Utils;
  private location: Location;
  public notify: NzNotificationService;

  constructor(injector: Injector) {
    this.router = injector.get(Router);
    this.activeRoute = injector.get(ActivatedRoute);
    this.location = injector.get(Location);
    this.benefitService = injector.get(BenefitService);
    this.utils = injector.get(Utils);
    this.notify = injector.get(NzNotificationService);
  }

  back() {
    this.location.back();
  }

  get xiaodianpuId(){
    return this.activeRoute.snapshot.paramMap.get('xpdId') || this.activeRoute.snapshot.queryParamMap.get('xpdId');
  }

  get kolInfo(){
    return this.activeRoute.snapshot.params;
  }

  get loading() {
    return this.benefitService.loading;
  }

  toList() {
    const {from } = this.benefitService.routeParams;
    if(from==='v2'){
      const {kolId='',wechatId='',xpdId=''} = this.kolInfo;
      this.router.navigateByUrl(`/kol-benefit/v2/${kolId}/${wechatId}/${xpdId}/benefit-list`);
    }else{
      this.router.navigateByUrl(`/kol-benefit/center/benefit-list?from=sidebar`);
    }
  }

  to(url, queryParams?: any) {
    return queryParams ? this.router.navigate([url], {
      queryParams,
      relativeTo: this.activeRoute,
    }) : this.router.navigate([url]);
  }

  disabledDate(current:Date):boolean {
    const oneday = 1000 * 60 * 60 * 24;
    return current && current.getTime() <Date.now() - oneday;
  }

  disabled45Date(current:Date){
    const oneday = 1000 * 60 * 60 * 24;
    const today = Date.now();
    const day45 = today + oneday * 45+oneday;
    if(current){
      const time = current.getTime();
      return time < today - oneday || time > day45;
    }
    return false;
  }
}
