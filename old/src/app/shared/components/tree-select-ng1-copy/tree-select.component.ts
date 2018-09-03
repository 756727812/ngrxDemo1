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
  useExisting: forwardRef(() => SeeTreeSelectComponentNg1),
  multi: true,
};

const CHAR_WIDTH = 12.5;

@Component({
  selector: 'ng1-see-tree-select',
  templateUrl: 'tree-select.component.html',
  styleUrls: ['tree-select.component.less'],
  providers: [VALUE_ACCESSOR],
})
export class SeeTreeSelectComponentNg1 implements OnInit, ControlValueAccessor {
  @Input() disabledEdit: boolean = false;
  @Input()
  set fastViewData(tagsStringArr: any) {
    this.checkFastViewMode(tagsStringArr);
  }
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
  }
  @Input() _optionList: any[] = [];

  // 可指定初始搜索文本
  @Input('initSearch')
  set initSearch(value: string) {
    this.searchText = value;
  }

  @Output() onSelectChange = new EventEmitter<any>();
  @Output() onShowSelectArea = new EventEmitter<any>();

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
    if (this.selectTags.length) {
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

  checkFastViewMode(tagsStringArr: any) {
    if (
      this.disabledEdit &&
      tagsStringArr instanceof Array &&
      tagsStringArr.length
    ) {
      this.selectTags = tagsStringArr.map((tagName, index) => ({
        id: index,
        label: tagName,
      }));
    }
  }

  initCheckBoxList() {
    this.checkBoxList = this._optionList.map((o, index) =>
      Object.assign({}, o, {
        index,
        checked: false,
        indeterminate: false, // 部分选中
        expand: false,
        visible: this.parentId(o.id) === 'root', // 根节点为true
        isLeaf: this.sonIds(o.id).length === 0, // 没有子节点，即叶节点
      }),
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
      .forEach(({ id }) => this.clickCheckbox(id, true));
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

  clickCheckbox(id, value) {
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

    // 更新选中结果
    this.updateSelects();

    // 强制刷新视图
    if (chk.checked !== value) {
      this.manualRefresh();
    }

    // 刷新input控件显示
    this.updateInputStyle();

    // 发送数据到外部
    this.emitData();
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

  writeValue(value: any) {}

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
