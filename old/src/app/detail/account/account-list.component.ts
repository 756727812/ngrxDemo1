import { forEach, assign } from 'lodash';
import { NzMessageService } from 'ng-zorro-antd';

export class AccountListController implements ng.IComponentController {
  private page = Number(this.$routeParams.page) || 1;
  private keyword = this.$routeParams.keyword;
  private showAccountInfoList = [1, 8, 24, 30]; // 显示“查看账号”的idlist
  private select_status = this.$location.hash() || '0'; // 选择的账号状态
  private select_type = this.$routeParams.select_type; // 选择的账号类型
  /**
   * 对应操作的后台接口 processAccountStatus，通过传递status参数实现不同功能 { operate_id : status_value }
   * 前端： {{1: "封号", 2: "重置密码", 3: "删号", 4: "解封", 5: "通过审核"}}
   * 后台：{ 0: "解封", 1: "封号",  2: "通过审核",  -1: "删号", -2: "重置密码"})
   */
  private operateCgi = {
    1: 1,
    2: -2,
    3: -1,
    4: 0,
    5: 2,
  };

  /**
   * 对应操作的提示文案
   */
  private modalWord = [
    {
      id: 1,
      title: '封号',
      message: '请确认是否对账号<%%>进行封号操作？',
    },
    {
      id: 2,
      title: '重置密码',
      message: '请确认是否对账号<%%>进行重置密码操作？',
      desc:
        '重置后该账号密码为默认值：Seegohappy <br>请尽快联系账号用户登录账号修改密码。',
    },
    {
      id: 3,
      title: '删号',
      message: '请确认是否对账号<%%>进行删号操作？',
    },
    {
      id: 4,
      title: '解封',
      message: '请确认是否对账号<%%>进行解封操作？',
    },
    {
      id: 5,
      title: '通过审核',
      message: '请确认是否通过账号<%%>的注册申请？',
    },
  ];

  cur_select_type = 0;
  select_type_name = this.$routeParams.name || '账号类型';
  account_keyword = this.$routeParams.keyword;
  check_account = this.$routeParams.check_account || '';
  is_kol_admin = this.$cookies.get('seller_privilege') === '25';
  accountType = this.accountList;
  accountStatus: {
    name: string;
    type: number;
    class: string;
    operate: {
      name: string;
      id: number;
      hide_kol?: boolean;
      cgi?: string;
    }[];
    counts?: number;
  }[] = [
    {
      name: '正常',
      type: 0,
      class: 'label-success',
      operate: [
        {
          name: '封号',
          id: 1,
          hide_kol: true,
        },
        {
          name: '重置密码',
          id: 2,
          hide_kol: false,
        },
      ],
    },
    {
      name: '被封',
      type: 1,
      class: 'label-danger',
      operate: [
        {
          name: '解封',
          id: 4,
        },
      ],
    },
    {
      name: '待审核',
      type: 2,
      class: 'label-info',
      operate: [
        {
          name: '通过审核',
          id: 5,
          cgi: '',
        },
        {
          name: '删号',
          id: 3,
          hide_kol: true,
        },
      ],
    },
  ];
  seller_im = [
    // {
    //   id: '0',
    //   name: '未选择'
    // },
    {
      id: '1',
      name: '澳洲',
    },
    {
      id: '2',
      name: '欧洲',
    },
    {
      id: '3',
      name: '美国',
    },
  ];
  seller_tag = [
    // {
    //   id: '0',
    //   name: '未选择'
    // },
    {
      id: '1',
      name: '按成本价结算',
    },
    {
      id: '2',
      name: '按订单价结算',
    },
  ];
  total_items = 0;
  aclist: { [key: string]: any }[];

  static $inject = [
    '$cookies',
    '$location',
    '$q',
    '$uibModal',
    '$routeParams',
    'accountList',
    'accountListKolAdmin',
    'dataService',
    'NzMessageService',
    'seeModal',
  ];

  constructor(
    private $cookies: ng.cookies.ICookiesService,
    private $location: ng.ILocationService,
    private $q: ng.IQService,
    private $uibModal: ng.ui.bootstrap.IModalService,
    private $routeParams: ng.route.IRouteParamsService,
    private accountList: any,
    private accountListKolAdmin: any,
    private dataService: see.IDataService,
    private message: NzMessageService,
    private seeModal: see.ISeeModalService,
  ) {
    if (this.is_kol_admin) {
      this.accountType = this.accountListKolAdmin;
    }
  }

  $onInit() {
    return this.$q.all([this.getAccountList()]);
  }

  selectTab() {
    this.$location.search({});
  }

  /**
   * 打开操作弹窗
   * @param ope_id
   * @param item
   */
  open(ope_id, item) {
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-account.html'),
      controller: 'ModalInstanceCtrl',
      controllerAs: 'vm',
      backdrop: 'static',
      resolve: {
        item,
        modalWord: this.getModalMessage(ope_id),
      },
    });

    return modalInstance.result.then(() => {
      return this.dataService
        .user_processAccountStatus({
          status: this.operateCgi[ope_id],
          id: item.id,
        })
        .then(() => {
          this.message.success('操作成功！');
          return this.getAccountList();
        });
    });
  }

  private modifyUserTag(_params, user) {
    return this.dataService
      .seller_modifyUserTag({
        u_tag: _params.u_tag,
        backend_id: user.id,
      })
      .then(res => {
        this.message.success('更新账户标签成功！');
      });
  }
  private updateSellerData(_params, user) {
    return this.dataService.user_updateSellerData(_params).then(res => {
      this.message.success('更新账户信息成功！');
      this.getAccountList();
    });
  }
  /**
   * 打开账户信息弹窗
   * @param user
   */
  openAccount(user) {
    // console.log(require('./modal-account-info.html'))
    const modalInstance = this.$uibModal.open({
      animation: true,
      template: require('./modal-account-info.html'),
      controller: 'accountInfoModalInstanceCtrl',
      controllerAs: 'vm',
      backdrop: 'static',
      resolve: {
        user,
      },
    });

    return modalInstance.result.then(_params => {
      return this.modifyUserTag(_params, user).then(() => {
        return this.updateSellerData(_params, user);
      });
    });
  }

  modifySellerRole(id, privilegeId) {
    this.seeModal.confirm(
      '确认操作',
      '确认将当前账号转换为供货用户吗?',
      () => {
        this.dataService.user_modifySellerRole({ id }).then(res => {
          this.getAccountList();
          this.message.success('操作成功！');
        });
      },
      null,
    );
  }

  /**
   * 请求后台获取特定类型的账号列表
   */
  getAccountList() {
    this.cur_select_type = Number(this.select_type);
    const status = this.select_status;
    return this.dataService
      .user_getAccountList({
        status,
        p: this.page,
        type: this.select_type,
        keyword: this.keyword,
        check_account: this.check_account,
      })
      .then(res => {
        this.aclist = res.data.list;
        const pri_id = parseInt(res.data.pri_id, 10);
        if (this.accountStatus[status]) {
          this.accountStatus[status].counts = +res.data.count;
        }

        forEach(this.aclist, (ele, index) => {
          const st = this.getStatus(ele.seller_status);
          const pl = this.getPrivilege(ele.seller_privilege);
          ele.seller_status = st.name;
          ele.label_class = st.class;
          ele.seller_privilege_name = pl.name;
          ele.operate = [];
          forEach(st.operate, (tmp_opt, index_opt) => {
            if (!tmp_opt.hide_kol || pri_id !== 25) {
              // 不是流量组，全部按钮都显示
              ele.operate.push(tmp_opt);
            }
          });
          ele.my_type = status;
          ele.seller_im_name = (function(_) {
            return (
              (_ === '0' && '未选择') ||
              (_ === '1' && '澳洲') ||
              (_ === '2' && '欧洲') ||
              (_ === '3' && '美国')
            );
          })(ele.seller_im_id);
          ele.seller_tag_name = (function(_) {
            return (
              (_ === '0' && '选择结算方式') ||
              (_ === '1' && '按成本价结算') ||
              (_ === '2' && '按订单价结算')
            );
          })(ele.seller_price_tag);
        });
        this.total_items = res.data.count;
        return this.aclist;
      });
  }

  private getStatus(type) {
    let result = null;
    forEach(this.accountStatus, (ele, index) => {
      if (ele.type === Number(type)) {
        result = ele;
        return false;
      }
    });
    return result !== null ? result : { name: '未知', type: -1, operate: [] };
  }

  private getPrivilege(type) {
    let result = null;
    forEach(this.accountType, (ele, index) => {
      if (ele.id === Number(type)) {
        result = ele;
        return false;
      }
    });
    return result !== null ? result : { name: '未知', id: type };
  }

  getAccountInfo(privilege) {
    return !!~this.showAccountInfoList.indexOf(parseInt(privilege, 10));
  }

  private getModalMessage(id) {
    const result = this.modalWord.filter(o => {
      return o.id === id;
    })[0];
    return result ? result : { id: -1, title: '出错了', message: '出错了' };
  }

  filterByType(type, name) {
    this.$location.search(
      assign({}, this.$location.search(), {
        name,
        select_type: type,
      }),
    );
  }

  filterByKeyWord() {
    this.$location.search(
      assign({}, this.$location.search(), {
        keyword: this.account_keyword,
        check_account: this.check_account,
      }),
    );
  }

  updateIm(_id, _seller_im_id) {
    return this.dataService
      .user_updateIMTips({
        id: _id,
        seller_im_id: _seller_im_id,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updatePriceTag(_id, _price_tag) {
    return this.dataService
      .user_updateUserPriceTag({
        backend_id: _id,
        price_tag: _price_tag,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateBlockWeiqushi(_id, _block) {
    return this.dataService
      .seller_updateBlockWeiqushi({
        id: _id,
        block_weiqushi: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateBlockFashion(_id, _block) {
    return this.dataService
      .seller_updateBlockFashion({
        id: _id,
        block_fashion: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateIsSkipMainBody(_id, _block) {
    return this.dataService
      .seller_updateIsSkipMainBody({
        id: _id,
        is_skip_main_body: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateBlockYuqing(_id, _block) {
    return this.dataService
      .seller_updateBlockYuqing({
        id: _id,
        block_yuqing: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateBlockKolHome(_id, _block) {
    return this.dataService
      .seller_updateBlockKolHome({
        id: _id,
        block_kolhome: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  updateBlockHotItem(_id, _block) {
    return this.dataService
      .seller_updateBlockHotItem({
        id: _id,
        block_hotitem: Number(_block) === 1 ? 0 : 1,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  // 更新kol sellername
  updateSellerNameForKol(seller_name, backend_id) {
    return this.dataService
      .seller_updateSellerNameForKol({
        seller_name,
        backend_id,
      })
      .then(res => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }

  // 热门单品库显示
  updateRoleHotItemAccessPermission(id, hot_item_flag) {
    this.switchSelectionCenter(
      id,
      'hot_item_flag',
      Number(hot_item_flag) === 1 ? 0 : 1,
    );
  }

  // 主题库显示
  updateRoleTopicItemAccessPermission(id, topic_item_flag) {
    this.switchSelectionCenter(
      id,
      'topic_item_flag',
      Number(topic_item_flag) === 1 ? 0 : 1,
    );
  }

  private switchSelectionCenter(id: number, field: string, value: number) {
    return this.dataService
      .switchSelectionCenter({ id, [field]: value })
      .then(() => {
        this.message.success('操作成功！');
        return this.getAccountList();
      });
  }
}

export const accountList = {
  template: require('./account-list.template.html'),
  controller: AccountListController,
};
