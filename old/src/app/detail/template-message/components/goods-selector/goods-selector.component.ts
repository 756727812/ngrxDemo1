import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';
import { TemplateService } from '../../services/template-message.service';

@Component({
  selector: 'app-goods-selector',
  templateUrl: './goods-selector.component.html',
  styleUrls: ['./goods-selector.component.css'],
})
export class GoodsSelectorComponent implements OnInit {
  goodsType: any[] = [
    { value: '0', label: '全部商品' },
    { value: '1', label: '自营商品' },
    { value: '2', label: '分销商品' },
  ];
  selectedGoodsType = this.goodsType[0];
  searchKeyword: string = '';

  curPage: number = 1;
  pageSize: number = 6;
  total: number = 0;
  isLoading: boolean = false;
  displayData: any[] = [];

  @Input() kolId: number;

  constructor(
    private subject: NzModalSubject,
    private dataService: TemplateService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.getGoods();
  }

  getGoods(resetPage: boolean = false) {
    this.isLoading = true;
    const param = {
      page: this.curPage,
      pageSize: 6,
      type: this.selectedGoodsType.value,
      name: this.searchKeyword,
      kolId: this.kolId || 0,

      // keyword: this.searchKeyword,
      // kol_id: this.kolId || 0,
      // page: this.curPage,
      // page_size: 6,
      // type: this.selectedGoodsType.value,
    };
    this.dataService.getItemList(param).subscribe(
      res => {
        this.isLoading = false;
        this.total = res.data.count;
        // this.displayData = this.getItemField(res.data.list);
        this.displayData = res.data.list;
      },
      err => {
        this.isLoading = false;
      },
    );
  }

  selectChange(option) {
    // console.log("curPage=",val,'');
    this.selectedGoodsType = option;
    this.getGoods(true);
  }

  selectCurItem(item) {
    console.log('close modal item =', item);
    this.subject.next(item);
    this.subject.destroy();
  }
}
