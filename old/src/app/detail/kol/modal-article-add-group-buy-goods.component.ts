import { Component, OnInit, Input, Inject } from '@angular/core';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { _HttpClient } from '@shared/services';

type articleGrouponItem = {
  id: number;
  checked: boolean;
  [key: string]: any;
};

@Component({
  selector: 'modal-article-add-group-buy-goods',
  templateUrl: './modal-article-add-group-buy-goods.component.html',
  styles: [
    `
    :host ::ng-deep .customize-footer {
      border-top: 1px solid #e9e9e9;
      padding: 10px 18px 0 10px;
      text-align: right;
      border-radius: 0 0 0px 0px;
      margin: 15px -16px -5px -16px;
    }

    :host ::ng-deep .custom-image img {
      display: block;
    }

    :host ::ng-deep .ant-card-head {
      padding: 0;
      min-height: 0;
    }

    :host ::ng-deep .ant-card-head-title {
      padding: 4px 6px;
      font-weight: normal;
      font-size: 14px;
    }

    :host ::ng-deep .ant-card-body {
      padding: 0;
      height: 145px;
    }
  `,
  ],
})
export class ModalArticleAddGroupBuyGoods implements OnInit {
  private _kolId: number;
  private _articleId: number;

  articleGrouponList: articleGrouponItem[];
  btnLoading: boolean = false;
  listLoading: boolean = false;

  constructor(
    private subject: NzModalSubject,
    private message: NzMessageService,
    private http: _HttpClient, // @Inject('dataService') private dataService: see.IDataService,
  ) {}

  @Input()
  set kolId(value: number) {
    this._kolId = Number(value);
  }

  @Input()
  set articleId(value: number) {
    this._articleId = Number(value);
  }

  ngOnInit() {
    this.getGrouponList();
  }

  emitDataOutside() {
    const articleGrouponList = this.articleGrouponList;
    const grouponIds = articleGrouponList
      .filter(item => item.checked)
      .map(item => item.id);
    if (grouponIds.length === 0 && articleGrouponList.length !== 0) {
      this.message.info('请选择拼团商品！');
      return;
    }
    this.articleGrouponAdd(grouponIds);
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  private getGrouponList() {
    this.listLoading = true;
    return this.http
      .get('api/ng/article/groupon/list', {
        articleId: this._articleId,
        kolId: this._kolId,
      })
      .subscribe(({ data }) => {
        this.articleGrouponList = data;
        this.listLoading = false;
      }, () => (this.listLoading = false));
  }

  private articleGrouponAdd(grouponIds: number[]) {
    this.btnLoading = true;
    return this.http
      .post('api/ng/article/groupon/add', {
        body: {
          grouponIds,
          articleId: this._articleId,
          kolId: this._kolId,
        },
      })
      .subscribe(() => {
        this.message.success('添加成功！');
        this.subject.destroy('onOk');
        this.btnLoading = false;
      }, () => (this.btnLoading = false));
  }
}
