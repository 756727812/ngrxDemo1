import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ViewChildren,
  QueryList,
  forwardRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  NzMessageService,
  NzInputComponent,
  NzTagComponent,
} from 'ng-zorro-antd';
import * as _ from 'lodash';

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SeeTreeSelectComponent),
  multi: true,
};

const CHAR_WIDTH = 12.5;

const tagNameLengthLimit = {
  cn: 16, // 16个中文符号
  en: 27, // 27个英文符号
};

let hasPropagateChange: boolean = false;
const cachedData: any = {};
const cachedKeys = [
  '_optionList',
  'checkBoxList',
  'selectOptions',
  'selectLeaves',
  'selectTags',
  'searchLineFeed',
];

export const writeValueFun = (
  optionList: any[],
  useFlatOptions: boolean,
  outputType: string,
  outputData: any,
  key?: string,
) => {
  const getSelectedIds = (matchKey: string) => {
    let ids = [];
    // 不支持selectOptions类型
    switch (outputType) {
      case '':
        ids = outputData.selectTags.map(tag => tag[matchKey]);
        break;
      case 'selectTags':
        ids = outputData.map(tag => tag[matchKey]);
        break;
      case 'selectLeaves':
        ids = outputData.map(leaf => leaf[matchKey]);
        break;
    }
    return ids;
  };

  let selectedIds: string[] = [];
  let matchKey: string;
  if (useFlatOptions) {
    matchKey = key || 'id';
    selectedIds = getSelectedIds(matchKey);
    optionList.forEach(op => (op.selected = selectedIds.includes(op.id)));
  } else {
    matchKey = key || 'label';
    selectedIds = getSelectedIds(matchKey);
    // To do: set selected attribute.
  }
};

@Component({
  selector: 'see-tree-select',
  templateUrl: 'tree-select.component.html',
  styleUrls: ['tree-select.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SeeTreeSelectComponent implements OnInit, ControlValueAccessor {
  @Input() disabledEdit: boolean = false;
  @Input() cachedMode: boolean = false; // 缓存模式
  @Input()
  set fastViewData(tagsStringArr: string[]) {
    this.setFastViewData(tagsStringArr);
  }
  get fastViewData(): string[] {
    return this._fastViewData;
  }
  _fastViewData: string[] = [];
  @Input() placeHolder: string = '请选择';
  @Input() useFlatOptions: boolean = false; // 嵌套格式 和 平行格式 两种，默认嵌套格式
  @Input() checkSelected: boolean = false;
  @Input() checkDisabled: boolean = false;
  // 指定输出的节点类型，'selectLeaves'代表叶子节点数组, 'selectTags'代表标签节点数组 或 'selectOptions'代表所有选中节点数组，默认三种都输出
  @Input() outputType: string = '';
  /*
    Input() optionList 选择项列表
    (1)嵌套格式数据示例(useFlatOptions为false，默认类型)：
    [
      { label: 'root1', children: [
          { label: 'child1.1', disabled: true },
          { label: 'child1.2' }
        ]
      },
      { label: 'root2', children: [
          { label: 'child2.1', children: [
              { label: 'grandchild2.1.1', disabled: true, selected: true },
              { label: 'grandchild2.1.2' }
            ]
          },
          { label: 'child2.2', selected: true, children: [
              { label: 'grandchild2.2.1' },
              { label: 'grandchild2.2.2' }
            ]
          },
          { label: 'child2.3', children: [
              { label: 'grandchild2.3.1', selected: true },
              { label: 'grandchild2.3.2' }
            ]
          }
        ]
      },
      { label: 'root3' }
    ]
    (2)平行格式数据示例(useFlatOptions为true)：
     [
      { id: '1', label: 'root1' },
      { id: '1-1', label: 'child1.1', disabled: true },
      { id: '1-2', label: 'child1.2' },
      { id: '2', label: 'root2' },
      { id: '2-1', label: 'child2.1' },
      { id: '2-1-1', label: 'grandchild2.1.1', disabled: true, selected: true },
      { id: '2-1-2', label: 'grandchild2.1.2' },
      { id: '2-2', label: 'child2.2', selected: true },
      { id: '2-2-1', label: 'grandchild2.2.1' },
      { id: '2-2-2', label: 'grandchild2.2.2' },
      { id: '2-3', label: 'child2.3' },
      { id: '2-3-1', label: 'grandchild2.3.1', selected: true },
      { id: '2-3-2', label: 'grandchild2.3.2' },
      { id: '3', label: 'root3' },
    ]
   */
  @Input('optionList')
  set optionList(value: any[]) {
    if (this.cachedMode && cachedData._optionList) {
      this.restoreCachedData(cachedKeys);
      this.emitData();
      this.onRestoreCached.emit();
      return;
    }
    if (!value.length) {
      return;
    }
    const inputCopy = _.cloneDeep(value);
    if (this.useFlatOptions) {
      this.sortedFlatOptions(inputCopy);
    } else {
      this.convertToFlat(inputCopy);
    }
    this.initCheckBoxList();
    if (this.cachedMode) {
      this.saveCachedData(cachedKeys);
    }
    this.onComponentInit.emit();
  }
  _optionList: any[] = [];

  // 可指定初始搜索文本
  @Input('initSearch')
  set initSearch(value: string) {
    this.searchText = value;
  }

  @Output() onSelectChange = new EventEmitter<any>();
  @Output() onShowSelectArea = new EventEmitter<any>();
  @Output() onRestoreCached = new EventEmitter<any>();
  @Output() onComponentInit = new EventEmitter<any>();

  @ViewChild(NzInputComponent) nzInputComponent: NzInputComponent;
  @ViewChildren(NzTagComponent) nzTagComponents: QueryList<NzTagComponent>;

  calcEnLen = val => String(val || '').replace(/[\u4e00-\u9fa5]/g, 'xx').length; // 将包含中文字符的字符串 转换成 英文字符长度
  get inputAtTheBegin() {
    return this.nzInputComponent._el.offsetLeft === 1;
  }
  get inputLineFeed() {
    return (
      this.calcEnLen(this.searchText) >
      this.nzInputComponent._el.offsetWidth / CHAR_WIDTH
    );
  }
  get hasSpaceAfterTags() {
    const lastTag = this.nzTagComponents.last;
    if (!lastTag) {
      return true;
    }
    const lastTagElmt = lastTag['_elementRef'].nativeElement;
    const seeTreeWrapWidth = lastTagElmt.parentElement.offsetWidth;
    const lastTagLeft = lastTagElmt.offsetLeft;
    const lastTagWidth = lastTagElmt.offsetWidth;
    const rightSpace = seeTreeWrapWidth - lastTagLeft - lastTagWidth;
    return this.calcEnLen(this.searchText) < rightSpace / CHAR_WIDTH;
  }

  constructor(private msg: NzMessageService) {}

  searchText: string = '';
  showSelectArea: boolean = false;
  searchLineFeed: boolean = false;
  checkBoxList: any[] = [];
  get checkBoxListDisplay() {
    return this.checkBoxList.filter(v => v.visible);
  }
  matchInfo: any = {};
  propagateChange: any;

  // 被选中的所有节点
  selectOptions: any[] = [];
  // 被选中的叶节点
  selectLeaves: any[] = [];
  // 被选中的标签显示节点
  selectTags: any[] = [];

  get checkBoxIds() {
    return this._optionList.map(o => o.id);
  }

  get placeHolderText() {
    if (this.selectTags instanceof Array && this.selectTags.length) {
      return '';
    }
    return this.placeHolder;
  }

  ngOnInit() {
    this.addListener();
  }

  addListener() {
    document.addEventListener('click', event => {
      if (event.target['tagName'] === 'DIV') {
        this.showSelectArea = false;
      }
    });
  }

  setFastViewData(tagsStringArr: any) {
    if (tagsStringArr instanceof Array && tagsStringArr.length) {
      this._fastViewData = tagsStringArr;
      this.selectTags = tagsStringArr.map((tagName, index) => ({
        id: index,
        label: tagName,
      }));
    }
  }

  initCheckBoxList() {
    this.checkBoxList = this._optionList.map((o, index, arr) =>
      Object.assign(
        {},
        o,
        {
          index,
          checked: false,
          indeterminate: false, // 部分选中
          expand: false,
          visible: this.parentId(o.id) === 'root', // 根节点为true
        },
        typeof o.isLeaf !== 'undefined'
          ? {}
          : { isLeaf: !arr.some(elemt => elemt.id.indexOf(o.id + '-') === 0) }, // 叶节点
      ),
    );

    // 初始化选中状态
    this.initSelected();

    // 初始化禁用状态
    this.initDisabled();

    // 初始化搜索结果（当传入的optionList改变时，结果需要重新渲染）
    this.searchResult(this.searchText);
  }

  initSelected() {
    this.checkBoxList
      .filter(({ id, selected }, i, arr) => {
        return (
          selected &&
          (!this.checkSelected ||
            !arr.some(
              chk => chk.selected && this.ancestorIds(id).includes(chk.id),
            ))
        );
      })
      .forEach(({ id }) => this.clickCheckbox(id, true, false));

    // this.updateResult();
    // 更新选中结果
    this.updateSelects();
    // 刷新input控件显示
    this.updateInputStyle();
  }

  initDisabled() {
    this.checkBoxList
      .filter(({ id, disabled }, i, arr) => {
        return (
          disabled &&
          (!this.checkDisabled ||
            !arr.some(
              chk => chk.disabled && this.ancestorIds(id).includes(chk.id),
            ))
        );
      })
      .forEach(({ id }) => this.disableNode(id));
  }

  disableNode(id) {
    this.offSprings(id).forEach(
      chkId => (this.getCheckBox(chkId).disabled = true),
    );
    this.disableParentNode(this.parentId(id));
  }

  disableParentNode(parentId, endNode = 'root') {
    if (parentId === endNode) {
      return;
    }
    const allDisabled = this.sonIds(parentId).every(
      elemt => this.getCheckBox(elemt).disabled,
    );
    if (allDisabled) {
      this.getCheckBox(parentId).disabled = allDisabled;
      this.disableParentNode(this.parentId(parentId), endNode);
    }
  }

  closeAllExpand() {
    this.checkBoxList = this.checkBoxList.map(chk => {
      chk.expand = false;
      chk.visible = this.parentId(chk.id) === 'root';
      return chk;
    });
  }

  expandToNode(id) {
    const expandIds = this.ancestorIds(id).sort((a, b) => a.length - b.length);
    expandIds.forEach(id => {
      const chk = this.getCheckBox(id);
      if (!chk.expand) {
        this.clickExpand(id);
      }
    });
  }

  updateInputStyle() {
    if (!this.inputAtTheBegin && this.inputLineFeed) {
      this.searchLineFeed = true;
    }
    if (this.inputAtTheBegin && this.hasSpaceAfterTags) {
      this.searchLineFeed = false;
    }
  }

  expandResult(searchTxt, matchChks) {
    if (!searchTxt.length) {
      return;
    }

    this.closeAllExpand();
    matchChks.forEach(result => {
      this.expandToNode(result.id);
    });
  }

  displaySearch(searchTxt) {
    const matchInfo = {};
    let matchChks = [];
    if (searchTxt.length) {
      matchChks = this.checkBoxList.filter(
        chk => chk.label.indexOf(searchTxt) !== -1,
      );
      matchChks.forEach(chk => {
        const pos = chk.label.indexOf(searchTxt);
        const len = searchTxt.length;
        matchInfo[chk.id] = [
          chk.label.slice(0, pos),
          searchTxt,
          chk.label.slice(pos + len),
        ];
      });
    }
    this.matchInfo = matchInfo;

    this.expandResult(searchTxt, matchChks);
  }

  searchResult(value) {
    this.updateInputStyle();
    this.displaySearch(value);
  }

  inputFocus(value) {
    this.showSelectArea = true;
    this.onShowSelectArea.emit();
  }

  // 父节点
  parentId(id) {
    const tmp = id.substring(0, id.lastIndexOf('-'));
    if (tmp === '') {
      return 'root';
    }
    if (this.checkBoxIndex(tmp) !== -1) {
      return tmp;
    }
    return '';
  }

  // 祖先节点
  ancestorIds(id) {
    return this.checkBoxIds.filter(elemt => id.indexOf(elemt + '-') === 0);
  }

  // 子节点
  sonIds(id) {
    return this.checkBoxIds.filter(
      elemt =>
        elemt.indexOf(id + '-') === 0 &&
        elemt.split('-').length === id.split('-').length + 1,
    );
  }

  // 后代节点
  offSprings(id) {
    return this.checkBoxIds.filter(
      elemt => elemt.indexOf(id + '-') === 0 && elemt !== id,
    );
  }

  // 同胞节点
  siblingIds(id) {
    return this.checkBoxIds.filter(
      elemt => this.parentId(elemt) === this.parentId(id) && elemt !== id,
    );
  }

  // id的最后一个数字
  lastNumOfId(id) {
    return Number(id.substring(id.lastIndexOf('-') + 1));
  }

  // 获取checkbox索引
  checkBoxIndex(id) {
    return _.findIndex(this.checkBoxList, { id });
  }

  getCheckBox(id) {
    return this.checkBoxList[this.checkBoxIndex(id)];
  }

  clickExpand(id) {
    const chk = this.getCheckBox(id);
    if (chk.isLeaf) {
      return;
    }
    chk.expand = !chk.expand;
    // 递归函数处理节点的可见性
    this.recurseExpand(chk.expand, id, id);
  }

  recurseExpand(parentExpand, parentId, clickId) {
    if (parentExpand) {
      this.sonIds(parentId).forEach(elemt => {
        // 子节点可见
        const chk = this.getCheckBox(elemt);
        chk.visible = true;

        // 子节点递归调用
        const pExpand = chk.expand;
        const pId = elemt;
        this.recurseExpand(pExpand, pId, clickId);
      });
    } else if (parentId === clickId) {
      this.offSprings(parentId).forEach(elemt => {
        // 所有后代节点都不可见
        const chk = this.getCheckBox(elemt);
        chk.visible = false;
      });
    }
    return;
  }

  clickCheckbox(id, value, updateResult: boolean = true) {
    const chk = this.getCheckBox(id);
    chk.checked = value;
    chk.indeterminate = false;
    const checked = chk.checked;

    // 子孙节点 全选或取消全选
    const diffDisabledChks = [];
    this.offSprings(id).forEach(elemt => {
      const targetChk = this.getCheckBox(elemt);
      if (!targetChk.disabled) {
        targetChk.indeterminate = false;
        targetChk.checked = checked;
      } else if (targetChk.checked !== checked) {
        diffDisabledChks.push(elemt); // 存放由于禁用导致状态不一致的checkbox，
      }
    });

    // 检测当前同胞节点是否都已选中，以决定父节点是否选中
    const parentId = this.parentId(id);
    diffDisabledChks.forEach(chkId =>
      this.updateParentNode(this.parentId(chkId), parentId),
    );
    this.updateParentNode(parentId);

    if (!updateResult) {
      return;
    }

    // 更新选中结果的显示
    this.updateResult(chk.checked !== value);
  }

  updateResult(forceRefresh = false) {
    // 更新选中结果
    this.updateSelects();

    // 强制刷新视图
    if (forceRefresh) {
      this.manualRefresh();
    }

    // 刷新input控件显示
    this.updateInputStyle();

    // 发送数据到外部
    this.emitData();

    if (this.cachedMode) {
      this.saveCachedData(cachedKeys);
    }
  }

  // 更新选中结果
  updateSelects() {
    // 被选中的所有节点
    this.selectOptions = this.checkBoxList
      .filter(chk => this.isSelect(chk))
      .map(o => this._optionList[o.index]);

    // 被选中的叶节点
    this.selectLeaves = this.checkBoxList
      .filter(chk => this.isSelect(chk) && chk.isLeaf)
      .map(o => this._optionList[o.index]);

    // 被选中的标签显示节点
    this.selectTags = this.checkBoxList
      .filter(chk => {
        const parentId = this.parentId(chk.id);
        if (parentId === 'root') {
          return this.isSelect(chk);
        }
        const parentChk = this.getCheckBox(parentId);
        return (
          this.isSelect(chk) && (parentChk.indeterminate || !parentChk.checked)
        );
      })
      .map(o => this._optionList[o.index]);
  }

  emitData() {
    let [selectLeaves, selectTags, selectOptions] = [
      this.selectLeaves,
      this.selectTags,
      this.selectOptions,
    ];
    if (!this.useFlatOptions) {
      // 对于嵌套类型数据，不传出id属性
      [selectLeaves, selectTags, selectOptions] = [
        this.selectLeaves,
        this.selectTags,
        this.selectOptions,
      ].map(arr => arr.map(op => _.omit(op, ['id'])));
    }

    let outputData = { selectLeaves, selectTags, selectOptions };
    if (this.outputType.length) {
      outputData = outputData[this.outputType];
    }

    this.onSelectChange.emit(outputData);

    // form control
    if (this.propagateChange) {
      hasPropagateChange = true;
      this.propagateChange(outputData);
    }
  }

  manualRefresh() {
    const newCheckBoxList = _.cloneDeep(this.checkBoxList);
    this.checkBoxList = newCheckBoxList;
    const newOptionList = _.cloneDeep(this._optionList);
    this._optionList = newOptionList;
  }

  updateParentNode(parentId, endNode = 'root') {
    if (parentId === endNode) {
      return;
    }
    const allChecked = this.sonIds(parentId).every(elemt =>
      this.isSelect(this.getCheckBox(elemt)),
    );
    const allUnChecked = this.sonIds(parentId).every(elemt =>
      this.isNotSelect(this.getCheckBox(elemt)),
    );
    const indeterminate = !allChecked && !allUnChecked;
    this.getCheckBox(parentId).indeterminate = indeterminate;
    // 当indeterminate为true时，allChecked一定为false，修改checked状态会导致checked与视图不一致
    // 例如 从未勾选状态勾选后，checked应为true，如果设置为indeterminate=true，checked=false，则下一次点击clickCheckbox方法传入的第2个参数为true，点击无效！
    if (!indeterminate) {
      this.getCheckBox(parentId).checked = allChecked;
    }
    this.updateParentNode(this.parentId(parentId), endNode);
  }

  closeTag(id) {
    if (this.getCheckBox(id).disabled) {
      return;
    }
    this.clickCheckbox(id, false);
  }

  getTagName(name) {
    let len = 0;
    const val = name || '';
    for (let i = 0; i < val.length; i += 1) {
      if (val[i].match(/[^x00-xff]/gi) != null) {
        // 全角
        len += 1 / tagNameLengthLimit.cn;
      } else {
        len += 1 / tagNameLengthLimit.en;
      }
      if (len > 1) {
        return `${val.slice(0, i - 1)}...`;
      }
    }
    return val;
  }

  onSearchKeyDown(event) {
    const searchTxt = event.target.value;
    if (
      !searchTxt.length &&
      event.key === 'Backspace' &&
      this.selectTags.length
    ) {
      const lastTagChkId = this.selectTags[this.selectTags.length - 1].id;
      this.closeTag(lastTagChkId);
    }
  }

  isSelect(chk) {
    return !chk.indeterminate && chk.checked;
  }

  isNotSelect(chk) {
    return !chk.indeterminate && !chk.checked;
  }

  clearInput() {
    this.searchText = '';
    this.selectTags.forEach(tag => this.closeTag(tag.id));
  }

  // 排序
  sortedFlatOptions(flatOps: any[]) {
    this._optionList = flatOps;
    this._optionList.sort(({ id: id1 }, { id: id2 }) => {
      if (id1 === id2) {
        return 0;
      }
      const [arr1, arr2] = [id1, id2].map(v => v.split('-'));
      for (let i = 0; i < Math.max(arr1.length, arr2.length); i = i + 1) {
        const [num1, num2] = [arr1, arr2].map(v => +(v[i] || -1));
        if (num1 !== num2) {
          return num1 - num2;
        }
      }
    });
  }

  // 将嵌套选项 转换成 平行选项
  convertToFlat(
    nestOps: any[],
    isRoot: boolean = true,
    basePaths: number[] = [],
  ) {
    if (isRoot) {
      this._optionList = [];
    }
    nestOps.forEach(({ label, children, ...rest }, index) => {
      const newBasePaths = [...basePaths, index + 1];
      this._optionList.push({
        label,
        ...rest,
        id: newBasePaths.join('-'),
      });
      if (children) {
        this.convertToFlat(children, false, newBasePaths);
      }
    });
  }

  writeValue(value: any) {
    if (!hasPropagateChange) {
      return;
    } // 初始值不做处理，初始值的选中节点由optionList决定
    writeValueFun(
      this._optionList,
      this.useFlatOptions,
      this.outputType,
      value,
    );
    this.selectTags = [];
    this.selectLeaves = [];
    this.selectOptions = [];
    this.initCheckBoxList();
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}

  // 缓存模式相关方法
  saveCachedData(keys: string[]) {
    keys.forEach(key => (cachedData[key] = this[key]));
  }

  restoreCachedData(keys: string[]) {
    keys.forEach(key => (this[key] = cachedData[key]));
  }
}
