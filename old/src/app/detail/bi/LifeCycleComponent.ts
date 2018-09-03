import {
  SimpleChanges,
  OnChanges,
  OnInit,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';

const onChangesKey = Symbol('onChanges');
const onInitKey = Symbol('onInit');
const doCheckKey = Symbol('doCheck');
const afterContentInitKey = Symbol('afterContentInit');
const afterContentCheckedKey = Symbol('afterContentChecked');
const afterViewInitKey = Symbol('afterViewInit');
const afterViewCheckedKey = Symbol('afterViewChecked');
const onDestroyKey = Symbol('onDestroy');

export abstract class LifeCycleComponent
  implements OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy {
  _lifeCycleEverPromise = {};
  _lifeCycleEverPromiseResolve = {};

  protected get afterViewInitEver(): Promise<void> {
    return this.getEverPromise(afterViewInitKey);
  }

  // all observables will complete on component destruction
  protected get onChanges$(): Observable<SimpleChanges> {
    return this.getObservable(onChangesKey).takeUntil(this.onDestroy$);
  }
  protected get onInit$(): Observable<void> {
    return this.getObservable(onInitKey)
      .takeUntil(this.onDestroy$)
      .take(1);
  }
  protected get doCheck$(): Observable<void> {
    return this.getObservable(doCheckKey).takeUntil(this.onDestroy$);
  }
  protected get afterContentInit$(): Observable<void> {
    return this.getObservable(afterContentInitKey)
      .takeUntil(this.onDestroy$)
      .take(1);
  }
  protected get afterContentChecked$(): Observable<void> {
    return this.getObservable(afterContentCheckedKey).takeUntil(
      this.onDestroy$,
    );
  }
  protected get afterViewInit$(): Observable<void> {
    return this.getObservable(afterViewInitKey)
      .takeUntil(this.onDestroy$)
      .take(1);
  }

  protected get afterViewChecked$(): Observable<void> {
    return this.getObservable(afterViewCheckedKey).takeUntil(this.onDestroy$);
  }
  protected get onDestroy$(): Observable<void> {
    return this.getObservable(onDestroyKey).take(1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.emit(onChangesKey, changes);
  }
  ngOnInit(): void {
    this.emit(onInitKey);
  }
  ngDoCheck(): void {
    this.emit(doCheckKey);
  }
  ngAfterContentInit(): void {
    this.emit(afterContentInitKey);
  }
  ngAfterContentChecked(): void {
    this.emit(afterContentCheckedKey);
  }
  ngAfterViewInit(): void {
    this.emit(afterViewInitKey);
  }
  ngAfterViewChecked(): void {
    this.emit(afterViewCheckedKey);
  }
  ngOnDestroy(): void {
    this.emit(onDestroyKey);
  }

  private getObservable(key: symbol): Observable<any> {
    const ob$ = (this[key] || (this[key] = new Subject<any>())).asObservable();
    return ob$;
  }

  private getEverPromise(key: symbol): Promise<any> {
    if (!this._lifeCycleEverPromise[key]) {
      this._lifeCycleEverPromise[key] = new Promise(resolve => {
        this._lifeCycleEverPromiseResolve[key] = resolve;
      });
    }
    return this._lifeCycleEverPromise[key];
  }

  private emit(key: symbol, value?: any): void {
    this.getEverPromise(key);
    this._lifeCycleEverPromiseResolve[key] &&
      this._lifeCycleEverPromiseResolve[key]();

    const subject = this[key];
    if (!subject) return;
    subject.next(value);
  }
}
