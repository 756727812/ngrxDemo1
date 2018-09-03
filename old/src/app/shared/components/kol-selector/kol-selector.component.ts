import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  Input,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Params, CanDeactivate, Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { CODES } from 'app/utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { KOLService } from './kol.service';

// 1=原创型，2=矩阵型,3=自动化运营，4=品牌,5=中心化
const KOL_TYPE_STRING = [
  '',
  '原创型',
  '矩阵型',
  '自动化运营',
  '品牌',
  '中心化',
];

// 输入框长度限制：1万个中文字符或2万个英文字符
const MAX_EN_LENGTH = '20000';

let curInstance;

@Component({
  selector: 'see-kol-selector',
  templateUrl: './kol-selector.component.html',
  styleUrls: ['./kol-selector.component.less'],
  providers: [KOLService],
})
export class SeeKolSelectorComponent implements OnInit {
  @Input() cancelText: string = '取消';
  @Input() confirmText: string = '确定';
  @Input() hideKOLs: number[] = [];

  _isSpinning: boolean = false;

  list: any[] = [];
  targetKols: any[] = [];
  get _targetKols(): any[] {
    return this.targetKols.map(kol => {
      return {
        kolId: kol.kolId,
        kolName: kol.kolName,
        kolEmail: kol.kolEmail,
        kolType: kol.kolType,
        weixinAuthInfoId: kol.weixinAuthInfoId,
      };
    });
  }
  inputEle: any[] = [];

  searchComp: boolean = false;

  searchMatchL: any[] = [];
  searchMatchR: any[] = [];
  searchKolsL: any[] = [];
  searchKolsR: any[] = [];

  rightTipsLeft: number = 500;
  hasSetRightTipsLeft: boolean = false;

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
  get copyRightCont() {
    const tmp = this.searchKolsR.filter(kolName =>
      this.searchMatchR.every(
        match => match.toLowerCase() !== kolName.toLowerCase(),
      ),
    );
    return tmp.join(',');
  }

  constructor(
    private subject: NzModalSubject,
    private kolService: KOLService,
    private _message: NzMessageService,
  ) {}

  ngOnInit() {
    curInstance = this;
    this.fetchKolList();
  }

  ngAfterViewInit() {
    this.setSearchLength(MAX_EN_LENGTH);
  }

  ngAfterViewChecked() {
    this.setRightTipsLeft();
  }

  setRightTipsLeft() {
    if (this.hasSetRightTipsLeft) {
      return;
    }
    const rightList: any = document.querySelector(
      'nz-transfer-list:nth-last-child(1)',
    );
    if (rightList && rightList.offsetLeft > 400) {
      this.rightTipsLeft = rightList.offsetLeft;
      this.hasSetRightTipsLeft = true;
    }
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
    this.kolService
      .fetchKolList()
      .pipe(
        catchError((error: any) => {
          this._isSpinning = false;
          return Observable.of(null);
        }),
      )
      .subscribe(({ data }) => {
        this._isSpinning = false;
        if (data && data.list) {
          // console.log("http data:",data);
          this.list = data.list
            .filter(kol => !this.hideKOLs.includes(kol.kolId))
            .map(cur => {
              const kolTypeString = KOL_TYPE_STRING[cur.kolType];
              return Object.assign({}, cur, {
                kolTypeString,
                key: cur.kolId,
                title: `${cur.kolName} - ${cur.kolEmail} - ${kolTypeString}`,
              });
            });
        }
      });
  }

  cancelSelect() {
    this.subject.destroy();
  }

  confirmSelect() {
    if (this._targetKols.length) {
      this.subject.next(this._targetKols);
      this.subject.destroy();
    } else {
      this._message.create('warning', '请至少选择一个KOL');
    }
  }

  getDirection(option) {
    const isSelect = this.targetKols.some(kol => kol.kolId === option.kolId);
    return isSelect ? 'right' : 'left';
  }

  filterOption(inputValue, option) {
    const direction = curInstance.getDirection(option);
    if (!curInstance.searchComp) {
      curInstance.searchComp = true;

      const regEx = /,/;
      if (inputValue.search(regEx) === -1) {
        if (direction === 'left') {
          curInstance.leftSearchResult = false;
        } else {
          curInstance.rightSearchResult = false;
        }
      } else {
        const kolNames1 = inputValue.split(regEx).filter(v => v.length);
        if (direction === 'left') {
          curInstance.searchKolsL = kolNames1;
          curInstance.leftSearchResult = true;
        } else {
          curInstance.searchKolsR = kolNames1;
          curInstance.rightSearchResult = true;
        }
      }
      if (direction === 'left') {
        curInstance.searchMatchL = [];
      } else {
        curInstance.searchMatchR = [];
      }
    }
    const regEx = /,/;
    if (inputValue.search(regEx) === -1) {
      if (direction === 'left') {
        curInstance.leftSearchResult = false;
      } else {
        curInstance.rightSearchResult = false;
      }
      return ['kolName', 'kolEmail', 'kolTypeString'].some(
        key => option[key].toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
      );
    }
    const kolNames = inputValue.split(regEx).filter(v => v.length);
    const isMatch = kolNames.some(
      kolName => kolName.toLowerCase() === option.kolName.toLowerCase(),
    );
    if (direction === 'left') {
      curInstance.leftSearchResult = true;
      if (isMatch) {
        curInstance.searchMatchL.push(option.kolName);
      }
    } else {
      curInstance.rightSearchResult = true;
      if (isMatch) {
        curInstance.searchMatchR.push(option.kolName);
      }
    }
    return isMatch;
  }

  search(ret: any) {
    this.searchComp = false;
  }

  select(ret: any) {
    // console.log('nzSelectChange', ret);
  }

  change(ret: any) {
    const { from, to, list } = ret;
    if (from === 'left' && to === 'right') {
      this.targetKols = this.targetKols.concat(list);
    }
    if (from === 'right' && to === 'left') {
      this.targetKols = this.targetKols.filter(kol =>
        list.every(option => option.key !== kol.key),
      );
    }
  }

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
    this._message.create('success', '复制成功！');
  }
}
