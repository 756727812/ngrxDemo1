import { Component, OnInit, Input } from '@angular/core';
import * as allService from '../../../services';

@Component({
  selector: 'app-modal-goods-list',
  templateUrl: './modal-goods-list.component.html',
  styleUrls: ['./modal-goods-list.component.css'],
})
export class ModalGoodsListComponent implements OnInit {
  private _params: any;
  @Input()
  public set params(value: string) {
    this._params = value;
  }

  // {
  //   filter_class_id: any[],
  // filter_info: {"item_status_type":"1","article_id":"745","article_type":"1","collection_id":"89741","rank_type":"0"},
  // kol_id: 130,
  // page: 1,
  // page_size: 20,
  // see_api_sign: '',
  // see_api_time: 20180724160778
  // };
  constructor(private commonService: allService.CommonService) {}

  ngOnInit() {
    console.log(this._params);
    this.getGoods();
  }

  isVisibleGoods = false;
  _current = 1;
  _pageSize = 10;
  _total = 1;
  _dataSet = [];
  _loading = true;
  goods_list = [];

  handleCancel = () => {
    this.isVisibleGoods = false;
  };

  refreshData(reset = false) {
    if (reset) {
      this._current = 1;
    }
    this._loading = true;
    this.getGoods();
  }

  getGoods() {
    const searchData = Object.assign({}, this._params, {
      page: this._current,
      pageSize: this._pageSize,
    });
    this.commonService.kol_mgr_goodsList(searchData).subscribe(res => {
      this._loading = false;
      this.goods_list = res.data.list;
      this._total = res.data.count;
    });
  }
}
