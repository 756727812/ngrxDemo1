import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// ng5旧的
// import { Observable } from 'rxjs/Observable';
// import { Subscription } from 'rxjs/Subscription';
import { Observable, Subscription, of, from, interval, combineLatest, TimeInterval, forkJoin, Subject } from "rxjs"; //Observable
import { fromEvent } from "rxjs/index";  //静态方法
import { multicast, refCount } from "rxjs/operators";
import { map, pairwise, filter, mergeMap, scan, catchError, distinctUntilChanged, distinct } from "rxjs/operators";  //操作符
import { Store } from '@ngrx/store';
// import { SELECT_SHAPE, SELECT_FONT, ADD_TEXT, TOGGLE_CLIP, TOGGLE_GEMS, COMPLETE } from './../../core/pet-tag.actions';
import * as Tag from './../../core/pet-tag.actions';
import { PetTag } from './../../core/pet-tag.model';

import { CommonService } from "../../service/common.service"

interface T {

};

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {

//   fromEvent(someDocumen, "someEvent").pipe(
//     startWith(0),
//     map()
// )

  tagState$: Observable<PetTag>;
  test$: Observable<PetTag>;
 private tagStateSubscription: Subscription;
 petTag: PetTag;
 done = false;

 constructor(private store: Store<PetTag>, private http: HttpClient, private comService:CommonService) {
   this.tagState$ = store.select('petTag');
 }

  ngOnInit() {
    this.comService.subject.subscribe(dam=>console.log(dam));
    this.tagStateSubscription = this.tagState$.subscribe((state) => {
      this.petTag = state;
      this.done = !!(this.petTag.shape && this.petTag.text);
    });
    this.scorllFn();

    of(2,3).pipe(
        map(x => x + x),
        mergeMap(n => of(n + 1, n + 2).pipe(
          filter(x => x % 1 == 0),
          scan((acc, x) => acc + x, 0),
        )),
        catchError(err => of('error found')),
       ).subscribe(res=>console.log(res)); 
    

      this.http.get('https://www.baidu.com', { responseType: 'text' })
      .pipe(mergeMap((baidu: string) => {
        return this.http.get('https://www.sogou.com', { responseType: 'text' })
          .pipe(map((sogou: string) => {
            const baiduTitle = baidu.substring(baidu.indexOf('<title>') + 7, baidu.indexOf('</title>'));
            const sogouTitle = sogou.substring(sogou.indexOf('<title>') + 7, sogou.indexOf('</title>'));
            return [baiduTitle, sogouTitle];
          }));
      }))
      .subscribe((titles: string[]) => {
        console.log(titles);
      });

      from(['1', 1, 2, 2, , 3, 1, 1, 2, 2, 3, 3])
      .pipe(distinctUntilChanged((a, b)=> a==b))
      .subscribe(
        val => {
          console.log(val);
        }
      );

      forkJoin(
        of(1, 3, 5, 7),
        of(2, 4, 6, 8)
      ).subscribe(
        (arr: number[]) => {
          console.log(arr);
          console.log(`next: ${arr[0]}, ${arr[1]}`);
        },
        null,
        () => {
          console.log('complete.');
        }
      );

      function observer(name: string) {
        return {
          next: (value: number) => console.log(`observer ${name}: ${value}`),
          complete: () => console.log(`observer ${name}: complete`)
        };
      }

      let subject = new Subject();
      let source = interval(500);
      // const m = source.multicast(new Subject<number>()).refCount(); //所有操作符v6版本放到管道里pipe()
      let refCounted = source.pipe(
        multicast(subject),
        // multicast(()=>new Subject<number>()), // 传入Subject工厂函数，而不是Subject实例
        refCount()
      );
      let subscription1;
      let subscription2;
      console.log('observerA subscribed');
      subscription1 = refCounted.subscribe({
        next: (v) => console.log('observerA: ' + v)
      });

      setTimeout(() => {
        console.log('observerB subscribed');
        subscription2 = refCounted.subscribe({
          next: (v) => console.log('observerB: ' + v)
        });
      }, 600);

      setTimeout(() => {
        console.log('observerA unsubscribed');
        subscription1.unsubscribe();
      }, 1200);

      setTimeout(() => {
        console.log('observerB unsubscribed');
        subscription2.unsubscribe();
      }, 2000);
  }

  ngOnDestroy(){
    this.tagStateSubscription.unsubscribe();
  }

  scorllFn():Subscription{
    return fromEvent(document, 'scroll').pipe(
      map(e => window.pageYOffset),
      pairwise()
    ).subscribe(pair => {console.log(pair);});
  }

  testFn(){
    console.log();
  }

  selectShapeHandler(shape: string) {
    this.store.dispatch({
      type: Tag.ActionTypes.SELECT_SHAPE,
      payload: shape
    });

    this.comService.send_data("create");
  }
 
  selectFontHandler(fontType: string) {
    this.store.dispatch({
      type: Tag.ActionTypes.SELECT_FONT,
      payload: fontType
    });
  }
 
  addTextHandler(text: string) {
    this.store.dispatch({
      type: Tag.ActionTypes.ADD_TEXT,
      payload: text
    });
  }
 
  toggleClipHandler() {
    this.store.dispatch({
      type: Tag.ActionTypes.TOGGLE_CLIP
    });
  }
 
  toggleGemsHandler() {
    this.store.dispatch({
      type: Tag.ActionTypes.TOGGLE_GEMS
    });
  }
  //触发完成
  submit() {
    this.store.dispatch({
      type: Tag.ActionTypes.COMPLETE,
      payload: true
    });
  }

  //注意： 在更复杂的应用中，你可能希望在单独的服务中派发行为，然后注入到组件中。
  //不过，现在我们这个仅仅为学习而创建的小应用，没有必要这么做。直接在智能组价中派发行为就行了。
}
