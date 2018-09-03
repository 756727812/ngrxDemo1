import * as _ from 'lodash';

type IOptions = {
  list: any[];
  count: number;
  page: number;
};

type IShopItem = {
  id: string;
  app_title: string;
  seller_email: string;
  seller_mobile: string;
  checked?: boolean;
};

type IShopList = {
  [key: number]: IShopItem[];
};

type IOperateStatus = {
  type: number;
  label: string;
};

export class modalGoodsShoppingNotesAddXDPController
  implements ng.IComponentController {
  static $inject: string[] = ['$q', '$location', '$routeParams', 'dataService'];

  close: Function;
  dismiss: Function;
  resolve: {
    selectedShopList: string[];
    from: string;
  };
  options: IOptions = {
    list: [],
    count: 0,
    page: 1,
  };
  value: any[] = [];
  currentType: number = 1;
  keyword: string;
  operateStatus: IOperateStatus[] = [
    {
      type: 1,
      label: '重度运营',
    },
    {
      type: 2,
      label: '轻度运营',
    },
    {
      type: 3,
      label: '自动化运营',
    },
    {
      type: 4,
      label: '品牌',
    },
  ];
  selectedOperateStatus: Set<number> = new Set();
  shopList: IShopList = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  pageSize: number = 50;

  constructor(
    private $q: ng.IQService,
    private $location: ng.ILocationService,
    private $routeParams: ng.route.IRouteParamsService,
    private dataService: see.IDataService,
  ) {}

  $onInit(): void {
    this.$q.all([this.getShopList()]).then(() => {
      this.setCurrentType(this.currentType, 1);
      const selectedShopList = this.resolve.selectedShopList;
      if (selectedShopList.length > 0) {
        this.operateStatus
          .filter(({ type }) => this.shopList[type].length > 0)
          .forEach(({ type }) => {
            const currentTypeList = this.shopList[type].filter(({ id }) =>
              selectedShopList.includes(id),
            );
            currentTypeList.forEach(shop => (shop.checked = true));
            if (this.shopList[type].length === currentTypeList.length) {
              this.selectedOperateStatus.add(type);
            }
          });
      }
    });
  }

  ok() {
    this.close({ $value: this.getSelectedShopIDList() });
  }

  getSelectedShopIDList(): number[] {
    return this.operateStatus.reduce((acc, { type }) => {
      this.shopList[type].filter(shop => shop.checked).forEach(shop => {
        acc.push(shop.id);
      });
      return acc;
    }, []);
  }

  cancel() {
    this.dismiss({ $value: 'cancel' });
  }

  getPaginatedList(page: number) {
    const currentList = this.shopList[this.currentType].slice(
      (page - 1) * this.pageSize,
      page * this.pageSize,
    );
    this.options.list = currentList;
    this.options.count = this.shopList[this.currentType].length;
  }

  onSelectType(type: number) {
    this.setCurrentType(type, 1);
    this.keyword = '';
  }

  onFilter() {
    if (Boolean(this.keyword)) {
      this.options.list = this.shopList[this.currentType]
        .filter(item =>
          item.app_title.toUpperCase().includes(this.keyword.toUpperCase()),
        )
        .slice(0, this.pageSize);
      this.options.count = this.options.list.length;
    } else {
      this.getPaginatedList(1);
    }
  }

  onCheckOperateStatus(event: ng.IAngularEvent, type: number) {
    event.stopPropagation();
    if (!this.shopList[type] || this.shopList[type].length === 0) {
      return;
    }
    if (this.isTypeSelected(type)) {
      this.selectedOperateStatus.delete(type);
      this.shopList[type].forEach(item => (item.checked = false));
    } else {
      this.selectedOperateStatus.add(type);
      this.shopList[type].forEach(item => (item.checked = true));
    }
  }

  isTypeSelected(type: number): boolean {
    return this.selectedOperateStatus.has(type);
  }

  onOptionClick(option: IShopItem) {
    if (option.checked === true) {
      this.selectedOperateStatus.delete(this.currentType);
    }
    option.checked = !option.checked;

    if (option.checked) {
      const isSelectedAll =
        !Boolean(this.keyword) &&
        this.shopList[this.currentType].length > 0 &&
        this.shopList[this.currentType].every(item => item.checked === true);
      if (isSelectedAll) {
        this.selectedOperateStatus.add(this.currentType);
      }
    }
  }

  private setCurrentType(type: number, page: number = 1) {
    this.currentType = type;
    this.getPaginatedList(page);
  }

  private getShopList(): ng.IPromise<IShopList> {
    const params =
      this.resolve.from === 'shoppingNotes'
        ? {
            type: 2,
            notice_id: this.$routeParams['id'],
          }
        : undefined;
    return this.dataService
      .kol_mgr_getXiaoDianPuList(params)
      .then(({ data }) => {
        this.shopList = {
          ...this.shopList,
          ...data,
        };
        return this.shopList;
      });
  }
}

export const modalGoodsShoppingNotesAddXDP: ng.IComponentOptions = {
  template: require('./modal-goods-shopping-notes-add-xdp.template.html'),
  controller: modalGoodsShoppingNotesAddXDPController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
