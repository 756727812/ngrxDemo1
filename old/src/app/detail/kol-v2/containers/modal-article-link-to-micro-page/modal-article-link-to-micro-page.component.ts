import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzModalSubject } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromStore from '../../store';
import { MicroPage } from '../../models';

@Component({
  selector: 'modal-article-link-to-micro-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'modal-article-link-to-micro-page.component.html',
})
export class ModalArticleLinkToMicroPageComponent implements OnInit {
  options = [
    { label: '全部页面', value: null },
    { label: '已关联文章', value: 1 },
    { label: '未关联文章', value: 2 },
  ];
  form: FormGroup = this.fb.group({
    name: [null],
    range: [null],
  });
  page: number = 1;
  pageSize: number = 10;
  microPages$: Observable<MicroPage[]>;
  count$: Observable<number>;
  loading$: Observable<boolean>;

  @Input() microPageId: number;

  constructor(
    private store: Store<fromStore.KolState>,
    private fb: FormBuilder,
    private subject: NzModalSubject,
  ) {}

  ngOnInit() {
    this.microPages$ = this.store.select(fromStore.getAllMicroPages).pipe(
      map(microPages =>
        microPages.map(microPage => ({
          ...microPage,
          selected: this.microPageId === microPage.id,
        })),
      ),
    );
    this.count$ = this.store.select(fromStore.getMicroPagesCount);
    this.loading$ = this.store.select(fromStore.getMicroPagesLoading);

    this.loadMicroPages();
  }

  private loadMicroPages() {
    this.store.dispatch(
      new fromStore.LoadMicroPages({
        ...this.form.value,
        page: this.page,
        pageSize: this.pageSize,
      }),
    );
  }

  submitForm($event: UIEvent, value: any) {
    $event.preventDefault();

    this.loadMicroPages();
  }

  resetForm() {
    this.page = 1;
    this.form.reset();
    this.loadMicroPages();
  }

  changePage() {
    this.loadMicroPages();
  }

  select(item: MicroPage) {
    this.subject.next({
      action: 'SELECT',
      id: item.id,
    });
    this.microPages$ = this.store.select(fromStore.getAllMicroPages).pipe(
      map(microPages =>
        microPages.map(m => ({
          ...m,
          selected: m.id === item.id ? true : false,
        })),
      ),
    );
  }
}
