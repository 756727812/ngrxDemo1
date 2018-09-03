import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import {
  ActivatedRoute,
  Params,
  CanDeactivate,
  Router,
  Event as NavigationEvent,
  NavigationEnd,
} from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Store } from '@ngrx/store';
import { parse, stringify } from 'query-string';
import * as fromStore from '../../store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import { EditorService } from '../../services/editor.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CtrlPaneComponent } from '../ctrl-pane/ctrl-pane.component';
import { PreviewPaneComponent } from '../preview-pane/preview-pane.component';
import { Elem, Meta, ElemType } from '../../models/editor.model';
import { applicationService } from 'app/services/application/application.service';
import { get } from 'lodash';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
})
export class EditorComponent
  implements OnInit, OnDestroy, AfterContentInit, AfterViewInit {
  @ViewChild('ctrlPane') ctrlPane: CtrlPaneComponent;
  @ViewChild('previewPane') previewPane: PreviewPaneComponent;
  isIgnoreRouteLeaveConfirm = false;
  busy$: Observable<boolean>;
  loading$: Observable<boolean>;
  hasUnSaved$: Observable<boolean>;
  isUpgradeInfoVisible = false;
  nearestInvalidElem: Elem;
  nearestInvalidElem$: Observable<Elem>;
  meta$: Observable<Meta>;
  xdpStatus$: Observable<any>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  oldEntryPath: string = '/shop/operate'; // 小电铺装修1.0地址
  private loading: boolean;
  startConfig: boolean = false;
  kolId: string;
  backToMall: string = '';
  xdpImg: string;
  _oldBeforeUnload: any;
  forceRedirect = false;
  _beforeUnload: any = event => {
    // 这里设置的文案可能无效，可能是浏览器默认的文案
    if (!this.forceRedirect) {
      const msg = '确认要离开？系统可能不会保留你所做的修改';
      event.returnValue = msg;
      return msg;
    }
  };

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

  ngAfterContentInit() {}
  ngAfterViewInit() {
    setTimeout(() => {
      this.updateEditorDomSize();
    }, 1);
    Observable.fromEvent(window, 'resize')
      .takeUntil(this.destroy$)
      .debounceTime(300)
      .subscribe(event => {
        this.updateEditorDomSize();
      });
  }

  updateEditorDomSize() {
    try {
      const editor = $(this.el.nativeElement).find('.editor');

      // TODO 这么搞 footer 不好
      // 70:头部 43:底部 10:底部莫名其妙的底pad，恶心的手调整 8
      // 最好就是有个 flex 模式
      const editorHeight = $(window).height() - 70 - 43 - 10 - 8;
      editor.height(editorHeight);
    } catch (e) {}
  }

  canDeactivate() {
    return (
      this.isUpgradeInfoVisible ||
      new Promise(resolve => {
        this.meta$.first().subscribe(data => {
          if (
            data &&
            data.editTime &&
            data.publishTime &&
            data.editTime > data.publishTime
          ) {
            this.modelService.confirm({
              content: '当前装修在未发布状态下，无法在前端生效',
              okText: '确认离开',
              cancelText: '留在当前页面',
              onOk: () => {
                resolve(true);
                window.location.href = this.backToMall;
              },
              onCancel: () => {
                resolve(false);
              },
            });
          } else {
            resolve(true);
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Now let's also unsubscribe from the subject itself:
    this.destroy$.unsubscribe();
    // TODO common 自己做一个统一的 onbeforeunload 注册入口，避免覆盖
    if (window.onbeforeunload && window.onbeforeunload === this._beforeUnload) {
      window.onbeforeunload = this._oldBeforeUnload;
    }
  }

  ngOnInit() {
    this.store.dispatch(new fromStore.EditorReset());

    this._oldBeforeUnload = window.onbeforeunload;
    if (process.env.NODE_ENV === 'production') {
      window.onbeforeunload = this._beforeUnload;
    }

    // this.router.events
    //   .takeUntil(this.destroy$)
    //   .filter(event => event instanceof NavigationEnd)
    //   .subscribe((event: NavigationEvent) => {
    //     console.log('>>>route', event);
    //   });

    if (!$('body').hasClass('sidebar-collapsed')) {
      applicationService().createCollapsedSidebar();
    }
    this.busy$ = this.store.select(fromStore.isEditorBusy);

    this.loading$ = this.store.select(fromStore.getEditorLoading);

    this.meta$ = this.store.select(fromStore.getEditorMeta);

    this.meta$.subscribe(data => {
      if (
        data.versionFlag !== 1 &&
        localStorage.getItem('is_quhaodian') !== '1'
      ) {
        this.isUpgradeInfoVisible = true;
      }
    });
    // this.xdpStatus$ = this.store.select(fromStore.getXdpStatus);
    // this.xdpStatus$.subscribe(data => {
    //   const { xdp_id=0, wechat_id=0} = data;
    //   console.log("xdpStatus data=",data)
    //   // this.backToMall = `/kol/kol-cooperation-management/${kol_id}?article_id=${article_id}&wechat_id=${wechat_id}&collection_id=${collection_id}#2`;
    //   this.backToMall = `/kol-v2/kol-cooperation-management/${xdp_id}/${wechat_id}/micro-page`;
    // });
    this.nearestInvalidElem$ = this.store.select(
      fromStore.getEditorNearestInvalidElem,
    );

    this.nearestInvalidElem$ //
      .takeUntil(this.destroy$)
      .subscribe(elem => {
        this.nearestInvalidElem = elem;
      });

    this.hasUnSaved$ = this.meta$.map(meta => {
      return (
        meta &&
        meta.editTime &&
        (!meta.publishTime || meta.publishTime < meta.editTime)
      );
    });

    this.route.queryParams //
      .takeUntil(this.destroy$)
      .first()
      .subscribe((params: Params) => {
        this.kolId = params.kolId;
        // 确认来源都是 ng2 router 之后删除即可
        if (Object.keys(params).length === 0) {
          const paramsHardCoded = parse(location.search);
          params = paramsHardCoded; // tslint:disable-line no-parameter-reassignment
        }
        const { kolId, micropageId, wechatId = 0, xdpId, id } = params;
        // console.log("queryParams = ",params);
        this.backToMall = `/kol-v2/kol-cooperation-management/${kolId}/${wechatId}/micro-page`;
        const oldParams: { [key: string]: string } = {
          kolId,
          wechat_id: micropageId,
        };
        if (this.isAdmin) {
          oldParams.source = 'admin';
        }
        this.oldEntryPath += `?${stringify(oldParams)}#group`;
        this.editorService.setTargetUserInfo({
          kolId,
          xdpId,
          micropageId,
          id,
        });
        this.store.dispatch(
          new fromStore.EditorLoad({
            kolId,
            xdpId,
            micropageId,
            id,
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

  showUpgradeInfoModal = () => {
    this.isUpgradeInfoVisible = true;
  };

  handleStartConfig = e => {
    this.startConfig = true;
  };

  handleUpgradeInfoModalOk = e => {
    this.isUpgradeInfoVisible = false;
  };

  handleUpgradeInfoModalCancel = e => {
    this.isUpgradeInfoVisible = false;
    this.store.dispatch(new fromStore.EditorIgnoreVersionModal());
  };

  private existErrorAndScrollView() {
    this.previewPane.markAllCtrlWidgetAsDirty();
    // this.ctrlPane.markAllCtrlWidgetAsDirty();
    // TODO
    if (this.nearestInvalidElem) {
      this.store.dispatch(new fromStore.EditorGlobalSave());
      this.nzMessageService.error('当前配置有误');
      const { vid } = this.nearestInvalidElem;
      this.store.dispatch(new fromStore.EditorFocusElem({ vid }));
      this.editorService.scrollElemToVisibleByVid(vid);
      return true;
    }
  }

  handleSave() {
    if (this.existErrorAndScrollView()) {
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.nzMessageService.success('保存成功');
      this.loading = false;
    }, 1000);
  }

  confirmNotOnlyBasicInfo() {
    return new Promise(resolve => {
      this.store
        .select(fromStore.getEditorElems)
        .first()
        .subscribe(elems => {
          if (
            elems.length === 1 &&
            elems[0].data.type === ElemType.BASIC_INFO
          ) {
            this.modelService.confirm({
              content: '你的店铺目前没有任何商品，确认要上线当前页面？',
              okText: '确认',
              cancelText: '返回装修',
              onOk: () => {
                resolve();
              },
            });
          } else {
            resolve();
          }
        });
    });
  }

  handleRelease() {
    if (this.existErrorAndScrollView()) {
      return;
    }
    this.confirmNotOnlyBasicInfo().then(() => {
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
            this.afterReleaseSuccess();
          } else {
            this.nzMessageService.warning('发布失败');
          }
          this.loading = false;
        });
    });
  }

  afterReleaseSuccess() {
    this.editorService.getXDPInfo(this.kolId).subscribe(({ data }) => {
      if (data.type > 1 && +data.manager_status === 80 && data.xdp_img) {
        this.xdpImg = data.xdp_img;
      } else {
        const info = {
          title: '线上效果',
          content: '小电铺未上线，当前页面装修会在小电铺上线后自动生效',
        };
        if (!this.isAdmin) {
          this.modelService.open({
            ...info,
            okText: '查看小电铺当前状态',
            // cancelText: '留在当前页',
            onOk: () => {
              this.forceRedirect = true;
              // TODO common
              window.location.href = '/dashboard/dashboard';
            },
          });
        } else {
          this.modelService.info({
            ...info,
            okText: '知道了',
            onOk: null,
          });
        }
      }
    });
  }
}
