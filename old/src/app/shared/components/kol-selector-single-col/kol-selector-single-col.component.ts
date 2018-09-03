import { Component, OnInit, Input, Injectable } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NzMessageService, NzModalSubject } from 'ng-zorro-antd';
import * as _ from 'lodash';
import { _HttpClient } from '@shared/services';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

@Injectable()
export class KolListService {
  constructor(private http: _HttpClient) {}

  // kol列表
  fetchKolList(): Observable<see.ICommonResponse<any>> {
    return wrapCatchError(
      this.http.get('/api/ng/template/groupon/kol/list', {
        pageSize: 99999,
      }),
    );
  }
}

// 1=原创型，2=矩阵型,3=自动化运营，4=品牌,5=中心化
const KOL_TYPE_STRING = {
  1: '原创型',
  2: '矩阵型',
  3: '自动化运营',
  4: '品牌',
  5: '中心化',
};

// 输入框长度限制：1万个中文字符或2万个英文字符
const MAX_EN_LENGTH = '20000';

let curInstance;

@Component({
  selector: 'see-kol-selector-single-col',
  templateUrl: './kol-selector-single-col.component.html',
  styleUrls: ['./kol-selector-single-col.component.less'],
  providers: [KolListService],
})
export class SeeKolSelectorSingleColComponent implements OnInit {
  @Input() confirmText: string = '确定';
  @Input() selectedKolIds: number[] = [];

  _isSpinning: boolean = false;
  fixDisplaybugs: boolean = false;

  list: any[] = [];
  get targetKols(): any[] {
    return this.list
      .filter(kol => kol.checked)
      .map(kol =>
        _.omit(kol, ['key', 'title', 'kolTypeString', 'checked', 'disabled']),
      );
  }
  inputEle: any[] = [];

  searchComp: boolean = false;

  searchMatchL: any[] = [];
  searchMatchR: any[] = [];
  searchKolsL: any[] = [];
  searchKolsR: any[] = [];

  get searchMatchL_re() {
    let count = 0;
    this.searchMatchL.forEach(name => {
      let c = 0;
      this.searchKolsL.forEach(sName => {
        if (sName === name) {
          c += 1;
        }
      });
      count += c;
    });
    return count;
  }

  get searchMatchR_re() {
    let count = 0;
    this.searchMatchR.forEach(name => {
      let c = 0;
      this.searchKolsR.forEach(sName => {
        if (sName === name) {
          c += 1;
        }
      });
      count += c;
    });
    return count;
  }

  leftSearchResult: boolean = false;
  rightSearchResult: boolean = false;
  direction: string = 'left';

  get copyLeftCont() {
    const tmp = this.searchKolsL.filter(kolName =>
      this.searchMatchL.every(
        match => match.toLowerCase() !== kolName.toLowerCase(),
      ),
    );
    return tmp.join(',');
  }

  constructor(
    private subject: NzModalSubject,
    private kolListService: KolListService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    curInstance = this;
    this.fetchKolList();
  }

  ngAfterViewInit() {
    this.setSearchLength(MAX_EN_LENGTH);
  }

  setSearchLength(len) {
    const searchInputs = document.getElementsByClassName(
      'ant-transfer-list-search',
    );
    for (let i = 0; i < searchInputs.length; i = i + 1) {
      const inputEle = searchInputs[i];
      if (inputEle.tagName === 'INPUT') {
        inputEle.setAttribute('maxlength', len);

        inputEle.addEventListener('input', e => {
          this.inputLimit(e.target);
        });
      }
    }
  }

  fetchKolList(): void {
    this._isSpinning = true;
    // 获取KOL列表
    this.kolListService
      .fetchKolList()
      .pipe(
        catchError((error: any) => {
          this._isSpinning = false;
          this.nzMessageService.error('获取KOL列表失败！');
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        this._isSpinning = false;
        if (!res) {
          return;
        }
        if (res.result !== 1) {
          console.log('error:', res.msg);
          this.nzMessageService.error('获取KOL列表失败！');
          return;
        }
        this.setKolList(res.data.list);
      });
  }

  setKolList(list) {
    this.list = list.map(cur => {
      const kolTypeString = KOL_TYPE_STRING[cur.kolType] || '';
      return Object.assign({}, cur, {
        kolTypeString,
        key: cur.kolId,
        title: `${cur.kolName} - ${cur.kolEmail} - ${kolTypeString}`,
        checked: this.selectedKolIds.includes(cur.kolId),
      });
    });

    // fix selected checkboxs display bugs
    this.fixDisplaybugs = true;
  }

  ngAfterContentChecked() {
    if (!this.fixDisplaybugs) {
      return;
    }
    // fix selected checkboxs display bugs
    const chkList = document.querySelectorAll(
      'ul.ant-transfer-list-content span.ant-checkbox',
    );
    if (chkList.length) {
      this.selectedKolIds.forEach(kolId => {
        const selectedIndex = _.findIndex(this.list, { kolId });
        const chk = chkList.item(selectedIndex);
        if (!chk.classList.contains('ant-checkbox-checked')) {
          chk.classList.add('ant-checkbox-checked');
        }
      });
      this.fixDisplaybugs = false;
    }
  }

  confirmSelect() {
    if (this.targetKols.length) {
      this.subject.next(this.targetKols);
      this.subject.destroy();
    } else {
      this.nzMessageService.create('warning', '请至少选择一个KOL');
    }
  }

  filterOption(inputValue, option) {
    let isMatch;
    if (!curInstance.searchComp) {
      // 第一次匹配
      curInstance.searchComp = true;

      const regEx = /,/;
      if (inputValue.search(regEx) === -1) {
        curInstance.leftSearchResult = false;
      } else {
        const kolNames1 = inputValue.split(regEx).filter(v => v.length);
        curInstance.searchKolsL = kolNames1;
        curInstance.leftSearchResult = true;
      }
      curInstance.searchMatchL = [];
    }
    const regEx = /,/;
    if (inputValue.search(regEx) === -1) {
      isMatch = ['kolName', 'kolEmail'].some(
        key =>
          String(option[key])
            .toLowerCase()
            .indexOf(inputValue.toLowerCase()) > -1,
      );
      return isMatch;
    }
    const kolNames = inputValue.split(regEx).filter(v => v.length);
    isMatch = kolNames.some(
      kolName => kolName.toLowerCase() === option.kolName.toLowerCase(),
    );
    if (isMatch) {
      curInstance.searchMatchL.push(option.kolName);
    }
    return isMatch;
  }

  search(ret: any) {
    this.searchComp = false;
  }

  select(ret: any) {}

  // 输入框长度限制
  calcEnLen = val => (val || '').replace(/[\u4e00-\u9fa5]/g, 'xx').length;
  cut = (val, enMaxLen) => {
    if (!val) {
      return val;
    }
    let enLen = this.calcEnLen(val);
    if (enLen <= enMaxLen) {
      return val;
    }
    let resultVal = val;
    while (enLen > enMaxLen) {
      resultVal = resultVal.substr(0, resultVal.length - 1);
      enLen = this.calcEnLen(resultVal);
    }
    return resultVal;
  };
  inputLimit(target) {
    const value = target.value;
    const valEnLen = this.calcEnLen(value);
    const meetMax = valEnLen >= MAX_EN_LENGTH;
    if (meetMax) {
      const filteredVal = this.cut(value, MAX_EN_LENGTH);
      if (filteredVal !== value) {
        setTimeout(() => {
          // setTimeout 保证触发 zone，更改 dom 值
          target.value = filteredVal;
        }, 1);
        return;
      }
    }
  }

  showMsg() {
    this.nzMessageService.create('success', '复制成功！');
  }
}
