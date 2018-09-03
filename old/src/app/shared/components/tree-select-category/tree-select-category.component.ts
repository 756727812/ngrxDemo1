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
  Injectable,
  ChangeDetectorRef,
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

// 树状图接口service
import { _HttpClient } from '@shared/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { writeValueFun } from '@shared/components/tree-select/tree-select.component';

const wrapCatchError = (ob: Observable<see.ICommonResponse<any>>) => {
  return ob.pipe(
    catchError((error: any) => {
      return Observable.throw(error.json ? error.json() : error);
    }),
  );
};

const dapiFormatFun = resData => {
  const options = [];
  resData.forEach(node => {
    const baseIds = [];
    [1, 2, 3].forEach(level => {
      const levelId = node[`class_id_${level}`];
      baseIds.push(levelId);
      const id = baseIds.join('-');
      if (_.findIndex(options, { id }) === -1) {
        const label = node[`class_name_${level}`];
        const pathInfo = _.times(level, i => ({
          classId: node[`class_id_${i + 1}`],
          className: node[`class_name_${i + 1}`],
        }));
        const isLeaf = level === 3;
        options.push({ id, label, levelId, level, pathInfo, isLeaf });
      }
    });
  });
  return options;
};

const javaFormatFun = resData => {
  const options = [];
  const idMap: any = _.keyBy(resData, 'id');
  resData.forEach(({ id, className, parentId, classPath }) => {
    if (parentId === 0) {
      // 一级品类
      options.push({
        id: String(id),
        label: className,
        levelId: id,
        level: 1,
        pathInfo: [{ className, classId: id }],
        isLeaf: false,
      });
    } else if (~classPath.indexOf(',')) {
      // 三级品类
      const node_2 = idMap[parentId];
      if (!node_2) {
        return;
      } // 跳过结构不完整的品类
      const { id: id_2, className: className_2, parentId: parentId_2 } = node_2;

      const node_1 = idMap[parentId_2];
      if (!node_1) {
        return;
      } // 跳过结构不完整的品类
      const { id: id_1, className: className_1 } = node_1;

      options.push({
        id: `${id_1}-${id_2}-${id}`,
        label: className,
        levelId: id,
        level: 3,
        pathInfo: [
          { className: className_1, classId: id_1 },
          { className: className_2, classId: id_2 },
          { className, classId: id },
        ],
        isLeaf: true,
      });
    } else {
      // 二级品类
      const node_1 = idMap[parentId];
      if (!node_1) {
        return;
      } // 跳过结构不完整的品类
      const { id: id_1, className: className_1 } = idMap[parentId];

      options.push({
        id: `${id_1}-${id}`,
        label: className,
        levelId: id,
        level: 2,
        pathInfo: [
          { className: className_1, classId: id_1 },
          { className, classId: id },
        ],
        isLeaf: false,
      });
    }
  });
  return options;
};

const apiInfo = {
  // 数据组接口，自动化运营项目
  dapi: {
    method: 'post',
    api: '/dapi/ao/kol/classtree',
    param: {},
    format: dapiFormatFun,
  },
  // java后端接口，优惠券指定范围项目
  java: {
    method: 'get',
    api: '/api/ng/youzan/product/classList',
    param: {},
    format: javaFormatFun,
  },
};

let classtreeData = [];

@Injectable()
export class ClasstreeService {
  constructor(private http: _HttpClient) {}

  // 树状图接口
  classtree(apiType: string): Observable<see.ICommonResponse<any>> {
    const { method, api, param } = apiInfo[apiType];
    return wrapCatchError(this.http[method](api, ...param));
  }
}

const VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SeeTreeSelectCategoryComponent),
  multi: true,
};

@Component({
  selector: 'see-tree-select-category',
  templateUrl: 'tree-select-category.component.html',
  styleUrls: ['tree-select-category.component.less'],
  providers: [VALUE_ACCESSOR, ClasstreeService],
})
export class SeeTreeSelectCategoryComponent
  implements OnInit, ControlValueAccessor {
  @Input() disabledEdit: boolean;
  @Input() cachedMode: boolean; // 缓存模式
  @Input() fastViewData: string[];
  @Input() placeHolder: string = '品类选择';
  @Input() apiType: string = 'dapi';
  // 指定输出的节点类型，'selectLeaves'代表叶子节点数组, 'selectTags'代表标签节点数组 或 'selectOptions'代表所有选中节点数组，默认三种都输出
  @Input() outputType: string = '';
  @Input() checkSelected: boolean;
  @Input() checkDisabled: boolean;

  // 被选中的品类
  @Input() selectedIds: number[] = [];
  @Input() selectedLabels: string[] = [];

  @Output() onSelectChange = new EventEmitter<any>();
  @Output() onShowSelectArea = new EventEmitter<any>();
  @Output() onComponentInit = new EventEmitter<any>();

  constructor(
    private nzMessageService: NzMessageService,
    private classtreeService: ClasstreeService,
    private cdr: ChangeDetectorRef,
  ) {}

  treeSelectOptions: any[] = [];
  propagateChange: any;
  emitDataCache: any;
  syncFormCrolData: boolean = false;

  // 被选中的所有节点
  selectOptions: any[] = [];
  // 被选中的叶节点
  selectLeaves: any[] = [];
  // 被选中的标签显示节点
  selectTags: any[] = [];

  ngOnInit() {
    this.getClasstree();
  }

  ngAfterViewInit() {
    if (this.syncFormCrolData && this.propagateChange) {
      this.propagateChange(this.emitDataCache);
      this.syncFormCrolData = false;
    }
  }

  invokeClasstreeApi(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // 树状图接口
      this.classtreeService
        .classtree(this.apiType)
        .pipe(
          catchError((error: any) => {
            this.nzMessageService.error('获取树状图数据失败！');
            reject();
            return Observable.of(null);
          }),
        )
        .subscribe(res => {
          if (!res || res.result !== 1) {
            console.log('error:', res.msg);
            this.nzMessageService.error('获取树状图数据失败！');
            reject();
            return;
          }

          const treeSelectOptions = apiInfo[this.apiType].format(res.data);
          resolve(treeSelectOptions);
        });
    });
  }

  async getClasstree() {
    if (classtreeData.length) {
      // 取出缓存数据
      this.treeSelectOptions = classtreeData;
    } else {
      const options = await this.invokeClasstreeApi();

      this.updateTreeNodes(options);
    }
    // this.cdr.detectChanges();
  }

  /**
   * 标记选中的品类
   * @param options 所有选项
   */
  updateTreeNodes(options) {
    // selectedIds
    this.updateSelectedByIds(options, this.selectedIds);

    // selectedLabel
    const ids = [];
    this.selectedLabels.forEach(selectedLabel => {
      const targetNode: any = _.find(options, { label: selectedLabel });
      if (targetNode) {
        ids.push(targetNode.levelId);
      }
    });
    this.updateSelectedByIds(options, ids);

    this.treeSelectOptions = options;
    classtreeData = options; // 缓存品类树形数据
  }

  updateSelectedByIds(options: any[], selectedIds: number[]) {
    if (!selectedIds.length) {
      return;
    }
    const getTargetNode = (selectedId: number) =>
      _.find(options, { levelId: selectedId });
    const getAllSiblingIds = (node: any) => {
      const idPrefix = node.id.substring(0, node.id.lastIndexOf('-') + 1);
      const level = node.level;
      const ids = [];
      options.forEach(op => {
        if (op.level === level && op.id.startsWith(idPrefix)) {
          ids.push(op.levelId);
        }
      });
      return ids;
    };

    const mergeSelectedIds = (originalClassIds: number[]) => {
      const classIds = [...originalClassIds];
      let pullAllIds = [];
      const parentClassIds = [];
      while (classIds.length) {
        const currentNode = getTargetNode(classIds[0]);
        if (currentNode) {
          const siblingIds = getAllSiblingIds(currentNode);
          const oldLength = classIds.length;
          _.pullAll(classIds, siblingIds);
          if (oldLength - classIds.length === siblingIds.length) {
            pullAllIds = [...pullAllIds, ...siblingIds];
            const parentClassId =
              currentNode.pathInfo[currentNode.level - 2].classId;
            parentClassIds.push(parentClassId);
          }
        } else {
          pullAllIds.push(classIds[0]);
          classIds.shift();
        }
      }
      const simplifyClassIds = [...originalClassIds];
      _.pullAll(simplifyClassIds, pullAllIds);
      return { simplifyClassIds, parentClassIds };
    };

    let simplifyIds = [];
    const { simplifyClassIds: class3Ids, parentClassIds } = mergeSelectedIds(
      selectedIds,
    ); // 合并三级品类，提取全选的二级品类
    const {
      simplifyClassIds: class2Ids,
      parentClassIds: class1Ids,
    } = mergeSelectedIds(parentClassIds); // 合并二级品类，提取全选的一级品类
    simplifyIds = [...class1Ids, ...class2Ids, ...class3Ids];
    simplifyIds.forEach(classId => (getTargetNode(classId).selected = true));
  }

  clickTreeSelect() {
    this.onShowSelectArea.emit();
  }

  selectChange(outputData) {
    this.onSelectChange.emit(outputData);
    this.emitDataCache = outputData;
    // form control
    if (this.propagateChange) {
      this.propagateChange(outputData);
    }
    writeValueFun(this.treeSelectOptions, true, this.outputType, outputData);
    classtreeData = this.treeSelectOptions; // 缓存品类树形数据
  }

  onRestoreCached() {
    this.syncFormCrolData = true;
  }

  componentInit() {
    this.onComponentInit.emit();
  }

  writeValue(value: any) {
    if (
      value instanceof Array &&
      value.length &&
      typeof value[0] === 'number'
    ) {
      this.selectedIds = value;
    }
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {}
}
