import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { EditorService } from '../../services/editor.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { Elem, Meta, ElemType } from '../../models/editor.model';

// 支付完成页资源位配置: 魔方 + 是否显示推荐商品

@Component({
  selector: 'app-editor-post-pay',
  templateUrl: './editor-post-pay.component.html',
  styleUrls: ['./editor-post-pay.component.less'],
})
export class EditorPostPayComponent implements OnInit, OnDestroy {
  // @ViewChild('ctrlPane') ctrlPane: CtrlPaneComponent;
  @ViewChild('previewPane') previewPane: PreviewPaneComponent;
  isIgnoreRouteLeaveConfirm = false;
  busy$: Observable<boolean>;
  loading$: Observable<boolean>;

  nearestInvalidElem: Elem;
  nearestInvalidElem$: Observable<Elem>;
  meta$: Observable<Meta>;
  xdpStatus$: Observable<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  oldEntryPath: string = '/shop/operate';
  private loading: boolean;
  startConfig: boolean = false;
  kolId: string;
  backToMall: string = '';
  xdpImg: string;
  _oldBeforeUnload: any;
  forceRedirect = false;
  disableBatch: boolean = true;
  micropageId: string;
  isSpinning: boolean = false;

  constructor(
    private el: ElementRef,
    private modelService: NzModalService,
    private store: Store<fromStore.StoreConstructionState>,
    private router: Router,
    private route: ActivatedRoute,
    private editorService: EditorService,
    private nzMessageService: NzMessageService, // private dataService: see.IDataService,
  ) {}

  get isAdmin() {
    return [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin].includes(
      getItem('seller_privilege') >>> 0,
    );
  }

  canDeactivate() {
    const deactivateTips = '当前页面未发布，不会在前端生效，是否确认离开？';
    let confirmResult = true;
    if (this.disableBatch) {
      confirmResult = confirm(deactivateTips);
      if (!confirmResult) {
        this.setMenuSelected();
      }
    }
    return confirmResult;
    // this.store
    //   .select(fromStore.getEditorMeta)
    //   .subscribe(meta => {
    //     if (meta && meta.editTime && meta.publishTime < meta.editTime) {
    //       return confirm(deactivateTips);
    //     } else {
    //       return true;
    //     }
    //   })
    // return true;
    // return window.confirm(deactivateTips);

    // return new Promise(resolve => {
    //   this.store
    //     .select(fromStore.getEditorMeta)
    //     .subscribe(meta => {
    //       if (meta && meta.editTime && meta.publishTime < meta.editTime) {
    //         this.modelService.confirm({
    //           content: '当前页面未发布，不会在前端生效，是否确认离开？',
    //           okText: '确认离开',
    //           cancelText: '留在当前页面',
    //           onOk: () => {
    //             resolve(true);
    //           },
    //           onCancel: () => {
    //             resolve(false);
    //           },
    //         });
    //       } else {
    //         resolve(true);
    //       }
    //     })
    //     .unsubscribe();
    // });
  }

  // 取消路由跳转 重新选中当前菜单项
  setMenuSelected() {
    setTimeout(() => {
      $('.store-config').click();
    }, 10);
  }

  checkStatus() {
    return new Promise(resolve => {
      this.store
        .select(fromStore.getEditorMeta)
        .subscribe(meta => {
          if (meta && meta.editTime && meta.publishTime < meta.editTime) {
            this.modelService.confirm({
              content: '当前页面未发布，不会在前端生效，是否确认离开？',
              okText: '确认离开',
              cancelText: '留在当前页面',
              onOk: () => {
                resolve(true);
              },
              onCancel: () => {
                resolve(false);
              },
            });
          } else {
            resolve(true);
          }
        })
        .unsubscribe();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
  }

  ngOnInit() {
    this.store.dispatch(new fromStore.EditorReset());

    this.busy$ = this.store.select(fromStore.isEditorBusy);

    this.loading$ = this.store.select(fromStore.getEditorLoading);

    this.meta$ = this.store.select(fromStore.getEditorMeta);

    this.nearestInvalidElem$ = this.store.select(
      fromStore.getEditorNearestInvalidElem,
    );

    this.nearestInvalidElem$ //
      .takeUntil(this.destroy$)
      .subscribe(elem => {
        this.nearestInvalidElem = elem;
      });

    this.meta$.takeUntil(this.destroy$).subscribe(meta => {
      if (meta && meta.editTime && meta.publishTime < meta.editTime) {
        this.disableBatch = true;
      } else {
        this.disableBatch = false;
      }
    });

    this.route.queryParams //
      .takeUntil(this.destroy$)
      .first()
      .subscribe((params: Params) => {
        this.kolId = params.kolId;
        this.micropageId = params.micropageId;
        // 确认来源都是 ng2 router 之后删除即可
        if (Object.keys(params).length === 0) {
          const paramsHardCoded = parse(location.search);
          params = paramsHardCoded; // tslint:disable-line no-parameter-reassignment
        }

        const oldParams: { [key: string]: string } = {
          kolId: params['kolId'],
          wechat_id: params['wechatId'],
        };
        if (this.isAdmin) {
          oldParams.source = 'admin';
        }
        this.oldEntryPath += `?${stringify(oldParams)}#group`;
        // TODO 优雅点
        this.editorService.setTargetUserInfo({
          kolId: params['kolId'],
          xdpId: params['xdpId'],
          micropageId: params['micropageId'],
          id: params['id'],
        });
        this.store.dispatch(
          new fromStore.EditorLoad({
            kolId: params['kolId'],
            xdpId: params['xdpId'],
            micropageId: params['micropageId'],
            id: params['id'],
          }),
        );
      });
  }

  setupClickOutsideBlur() {
    Observable.fromEvent(document, 'click')
      .takeUntil(this.destroy$)
      .subscribe((e: any) => {
        // 「editor 内，但是非三个主要区域」
        const target = $(e.target);
        if (
          target.closest('.shop-construct-editor .main').length > 0 &&
          (target.closest('.res-pane').length === 0 &&
            target.closest('.ctrl-pane').length === 0 &&
            target.closest('.preview-pane').length === 0)
        ) {
          this.store.dispatch(new fromStore.EditorFocusElem({ vid: null }));
        }
      });
  }

  handleStartConfig = e => {
    this.startConfig = true;
  };

  private existErrorAndScrollView() {
    this.previewPane.markAllCtrlWidgetAsDirty();
    if (this.nearestInvalidElem) {
      this.store.dispatch(new fromStore.EditorGlobalSave());
      this.nzMessageService.error('当前配置有误');
      const { vid } = this.nearestInvalidElem;
      this.store.dispatch(new fromStore.EditorFocusElem({ vid }));
      this.editorService.scrollElemToVisibleByVid(vid);
      return true;
    }
  }

  handleRelease() {
    if (this.existErrorAndScrollView()) {
      return;
    }
    this.loading = true;
    this.editorService
      .release() //
      .catch(e => {
        this.loading = false;
        return Observable.of();
      })
      .subscribe((data: any) => {
        if (data && data.result === 1) {
          this.store.dispatch(
            new fromStore.EditorUpdateMeta({
              publishTime: new Date(),
            }),
          );
          this.nzMessageService.success('发布成功');
          this.disableBatch = false;
        } else {
          this.nzMessageService.warning('发布失败');
        }
        this.loading = false;
      });
  }
}
