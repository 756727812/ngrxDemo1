import * as _ from 'lodash';;
import * as moment from 'moment';
import { filter } from '../../../utils/object';

type IDistrictItem = {
  id: string;
  fullname: string;
};

export class ModalGoodsLogisticAddAreasController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService', '$http'];

  close: Function;
  dismiss: Function;
  resolve: {
    selectedProvinces: string[],
    currentProvinces: string[],
  };
  filterBy = 'fullname';
  source: IDistrictItem[] = [];
  target: IDistrictItem[] = [];
  selectedItemsSource: IDistrictItem[] = [];
  selectedItemsTarget: IDistrictItem[] = [];
  filterValueSource: string;
  filterValueTarget: string;
  visibleOptionsSource: IDistrictItem[];
  visibleOptionsTarget: IDistrictItem[];

  constructor(
    private $q: ng.IQService,
    private dataService: see.IDataService,
    private $http: ng.IHttpService,
  ) {}

  $onInit() {
    this.$q.all([
      this.getDistrictList(),
    ]);
  }

  ok() {
    this.close({ $value: this.target });
  }

  cancel() {
    this.dismiss({ $value: 'cancel' });
  }

  onFilter(event: KeyboardEvent, data: any[], listType: number) {
    const query = (<HTMLInputElement> event.target).value.trim().toLowerCase();

    if (listType === -1)
      this.filterValueSource = query;
    else
      this.filterValueTarget = query;

    this.activateFilter(data, listType);
  }

  activateFilter(data: any[], listType: number) {
    const searchFields = this.filterBy.split(',');

    if (listType === -1)
      this.visibleOptionsSource = filter(data, searchFields, this.filterValueSource);
    else
      this.visibleOptionsTarget = filter(data, searchFields, this.filterValueTarget);
  }

  isSelected(item: any, selectedItems: any[]) {
    return this.findIndexInSelection(item, selectedItems) !== -1;
  }

  findIndexInSelection(item: any, selectedItems: any[]): number {
    return this.findIndexInList(item, selectedItems);
  }

  findIndexInList(item: any, list: any): number {
    let index: number = -1;

    if (list) {
      for (let i = 0; i < list.length; i += 1) {
        if (list[i] === item) {
          index = i;
          break;
        }
      }
    }

    return index;
  }

  isItemVisible(item: any, listType: number): boolean {
    if (listType === -1)
      return this.isVisibleInList(this.visibleOptionsSource, item, this.filterValueSource);
    else
      return this.isVisibleInList(this.visibleOptionsTarget, item, this.filterValueTarget);
  }

  isVisibleInList(data: any[], item: any, filterValue: string): boolean {
    if (filterValue && filterValue.trim().length) {
      for (let i = 0; i < data.length; i += 1) {
        if (item === data[i]) {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  onItemClick(event, item: any, selectedItems: any[]) {
    const index = this.findIndexInSelection(item, selectedItems);
    const selected = (index !== -1);

    if (selected)
      selectedItems.splice(index, 1);
    else
      selectedItems.push(item);
  }

  onSourceItemDblClick(item: IDistrictItem) {
    if (this.findIndexInList(item, this.target) === -1) {
      this.target.push(
        this.source.splice(this.findIndexInList(item, this.source), 1)[0],
      );
    }
  }

  onTargetItemDblClick(item: IDistrictItem) {
    if (this.findIndexInList(item, this.source) === -1) {
      this.source.push(
        this.target.splice(this.findIndexInList(item, this.target), 1)[0],
      );
    }
  }

  moveRight() {
    if (this.selectedItemsSource && this.selectedItemsSource.length) {
      this.selectedItemsSource.forEach(item => {
        this.onSourceItemDblClick(item);
      });
      this.selectedItemsSource.length = 0;
    }
  }

  moveAllRight() {
    if (this.source) {
      for (let i = 0; i < this.source.length; i += 1) {
        if (this.isItemVisible(this.source[i], -1)) {
          const removedItem = this.source.splice(i, 1)[0];
          this.target.push(removedItem);
          i -= 1;
        }
      }

      this.selectedItemsSource.length = 0;
    }
  }

  moveLeft() {
    if (this.selectedItemsTarget && this.selectedItemsTarget.length) {
      this.selectedItemsTarget.forEach(item => {
        this.onTargetItemDblClick(item);
      });

      this.selectedItemsTarget.length = 0;
    }
  }

  moveAllLeft() {
    if (this.target) {
      for (let i = 0; i < this.target.length; i += 1) {
        if (this.isItemVisible(this.target[i], 1)) {
          const removedItem = this.target.splice(i, 1)[0];
          this.source.push(removedItem);
          i -= 1;
        }
      }

      this.selectedItemsTarget.length = 0;
    }
  }

  private getDistrictList(): ng.IPromise<any> {
    return this.dataService.express_getProvinseList()
      .then(({ data }) => {
        this.source = data.filter(
          p =>
            !this.resolve.selectedProvinces.includes(p.id)
            && !this.resolve.currentProvinces.includes(p.id),
        );
        this.target = data.filter(
          p => this.resolve.currentProvinces.includes(p.id),
        );
        return this.source;
      });
  }
}

export const modalGoodsLogisticAddAreas: ng.IComponentOptions = {
  template: require('./modal-goods-logistic-add-areas.template.html'),
  controller: ModalGoodsLogisticAddAreasController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
