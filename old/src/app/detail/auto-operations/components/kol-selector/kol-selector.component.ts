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
import { CODES } from '../../../../utils';
import { getItem } from '@utils/storage';
import {
  NzMessageService,
  NzModalService,
  NzModalSubject,
} from 'ng-zorro-antd';
import { RulesService } from '../../services/rules.service';
import * as _ from 'lodash';

// 1-原创号 2-矩阵号 3-企业号
const KOL_TYPE_STRING = {
  1: '原创号',
  2: '矩阵号',
  3: '企业号',
};

// 输入框长度限制：1万个中文字符或2万个英文字符
const MAX_EN_LENGTH = '20000';

let curInstance;

@Component({
  selector: 'kol-selector-single-col',
  templateUrl: './kol-selector.component.html',
  styleUrls: ['./kol-selector.component.less'],
})
export class KolSelectorSingleColComponent implements OnInit {
  @Input() confirmText: string = '确定';
  @Input() ruleId: number;

  _isSpinning: boolean = false;

  list: any[] = [];
  targetKols: any[] = [];
  get _targetKols(): any[] {
    return this.targetKols.map(kol =>
      _.omit(kol, ['key', 'title', 'kolTypeString']),
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
    return tmp.join('，');
  }
  get copyRightCont() {
    const tmp = this.searchKolsR.filter(kolName =>
      this.searchMatchR.every(
        match => match.toLowerCase() !== kolName.toLowerCase(),
      ),
    );
    return tmp.join('，');
  }

  constructor(
    private subject: NzModalSubject,
    private rulesService: RulesService,
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
    this.rulesService
      .kollist()
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
        /*
        KolListPojo {
          account_property (integer, optional): 店铺类型(原创型，矩阵型。。。) ,
          category_id (integer, optional): 三级分类id ,
          kol_id (integer, optional): kolId ,
          kol_name (string, optional): kol名称 ,
          mobile (integer, optional): 登录账号 ,
          type (integer, optional): 类型（1：不属于当前规则，0属于当前规则） ,
          xdp_id (integer, optional): 小店铺ID
        } */
        this.list = res.data.map(cur => {
          const kolTypeString = KOL_TYPE_STRING[cur.account_property];
          return Object.assign({}, cur, {
            kolTypeString,
            key: cur.kol_id,
            title: `${cur.kol_name} - ${cur.mobile} - ${kolTypeString}`,
            disabled: cur.type === 0,
          });
        });
      });
  }

  confirmSelect() {
    if (this._targetKols.length) {
      this.subject.next(this._targetKols);
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
      isMatch = ['kol_name', 'mobile'].some(
        key =>
          String(option[key])
            .toLowerCase()
            .indexOf(inputValue.toLowerCase()) > -1,
      );
      return isMatch;
    }
    const kolNames = inputValue.split(regEx).filter(v => v.length);
    isMatch = kolNames.some(
      kolName => kolName.toLowerCase() === option.kol_name.toLowerCase(),
    );
    if (isMatch) {
      curInstance.searchMatchL.push(option.kol_name);
    }
    return isMatch;
  }

  search(ret: any) {
    this.searchComp = false;
  }

  select(ret: any) {
    this.targetKols = ret.list;
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
    this.nzMessageService.create('success', '复制成功！');
  }
}
