import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  NzModalService,
  NzMessageService,
  NzNotificationService,
} from 'ng-zorro-antd';
import { FinancialManageService } from '../../services';
import * as moment from 'moment';
import { throttle, debounce } from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'quhaodian-financial-management',
  templateUrl: 'financial-management.component.html',
  styleUrls: ['./financial-management.component.less'],
})
export class FinancialManagementComponent implements OnInit {
  page: number = 1;
  pageSize: number = 10;
  total: number = 0;
  list = [];
  copyList = [];
  keyword: string = '';
  loading: boolean = false;

  @ViewChild('refuseForm') refuseFormTpl: any;
  @ViewChild('forceForm') forceFormTpl: any;
  @ViewChild('failTpl') failTpl: any;

  refuseReason: string = '';
  forceReason: string = '';
  isForceError: boolean = false;
  isRefuseError: boolean = false;

  statusList = [
    { id: 1, name: '待审核', value: false },
    { id: 2, name: '提现成功', value: false },
    { id: 3, name: '提现失败', value: false },
    { id: 4, name: '提现中', value: false },
  ];

  searchForm: FormGroup;

  sellerInfo: any;
  failModal: any;
  failMsg: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private notificationService: NzNotificationService,
    private fb: FormBuilder,
    private financialManageService: FinancialManageService,
  ) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      withdrawalId: [],
      uUsername: [],
      withdrawalStatus: [],
      dateRange: [[]],
    });
    this.getSellerDetail();
    this.getWithdrawList();
  }

  getWithdrawList(): void {
    this.loading = true;
    const {
      withdrawalId,
      uUsername,
      withdrawalStatus,
      dateRange,
    } = this.searchForm.value;
    let withdrawalTimeBegin = null;
    let withdrawalTimeEnd = null;
    if (dateRange && dateRange.length) {
      withdrawalTimeBegin = moment(dateRange[0]).format('YYYY-MM-DD HH:mm:ss');
      withdrawalTimeEnd = moment(dateRange[1]).format('YYYY-MM-DD 23:59:59');
    }

    const params = {
      withdrawalStatus,
      withdrawalTimeBegin,
      withdrawalTimeEnd,
      withdrawalId: withdrawalId && withdrawalId.trim(),
      uUsername: uUsername && uUsername.trim(),
      page: this.page,
      pageSize: this.pageSize,
    };

    this.financialManageService.getWithdrawList(params).subscribe(
      (res: any) => {
        this.list = res.data.list;
        this.copyList = res.data.list;
        this.total = res.data.count;
        this.loading = false;
      },
      () => {
        this.loading = false;
      },
    );
  }

  handleCloseFailModal(): void {
    this.failModal.destroy('onOk');
  }

  showFailModal(msg: string): void {
    this.failMsg = msg;
    this.failModal = this.modalService.open({
      title: '',
      content: this.failTpl,
      closable: false,
      footer: false,
      wrapClassName: 'see-modal-md',
      onOk: () => {
        // this.searchForm.controls['withdrawalStatus'].setValue(4);
        // this.page = 1;
        this.getWithdrawList();
      },
      onCancel: () => {
        this.getWithdrawList();
      },
      maskClosable: true,
    });
  }

  getSellerDetail(): void {
    this.financialManageService.getSellerDetail({}).subscribe((res: any) => {
      this.sellerInfo = res.data.seller_info;
    });
  }

  search(): void {
    this.page = 1;
    this.getWithdrawList();
  }

  resetSearchForm(): void {
    this.searchForm.reset();
    this.page = 1;
    this.getWithdrawList();
  }

  handlePass = throttle(
    (id: any) => {
      this.financialManageService.withdraw({ id }).subscribe(
        (res: any) => {
          if (res.data) {
            this.showFailModal(res.data);
          } else {
            this.messageService.success('打款成功');
            this.getWithdrawList();
          }
        },
        (res: any) => {
          this.getWithdrawList();
        },
      );
    },
    1000,
    { trailing: false },
  );

  handleRefuse(id: any): void {
    this.modalService.open({
      title: '拒绝提现申请',
      content: this.refuseFormTpl,
      closable: false,
      wrapClassName: 'see-modal-md',
      onOk: () => {
        return new Promise((resolve: any) => {
          if (!this.refuseReason) {
            this.isRefuseError = true;
            return;
          }
          this.financialManageService
            .withdrawRefuse({ id, remark: this.refuseReason })
            .subscribe(
              (res: any) => {
                this.refuseReason = '';
                this.isRefuseError = false;
                if (res.data) {
                  this.showFailModal(res.data);
                } else {
                  this.messageService.success('操作成功！');
                  this.getWithdrawList();
                }
                resolve();
              },
              () => {
                this.refuseReason = '';
                this.isRefuseError = false;
                resolve();
              },
            );
        });
      },
      onCancel: () => {
        this.refuseReason = '';
        this.isRefuseError = false;
      },
    });
  }

  handleRetry = throttle(
    (id: any) => {
      this.financialManageService.withdrawConfirm({ id }).subscribe(
        (res: any) => {
          if (res.data) {
            this.showFailModal(res.data);
          } else {
            this.messageService.success('打款成功');
            this.getWithdrawList();
          }
        },
        (res: any) => {
          this.getWithdrawList();
        },
      );
    },
    1000,
    { trailing: false },
  );

  handleForce = throttle(
    (id: any) => {
      this.modalService.open({
        title: '强制成功',
        content: this.forceFormTpl,
        closable: false,
        wrapClassName: 'see-modal-md',
        onOk: () => {
          return new Promise((resolve: any) => {
            if (!this.forceReason) {
              this.isForceError = true;
              return;
            }
            this.financialManageService
              .withdrawForceSuccess({ id, remark: this.forceReason })
              .subscribe(
                (res: any) => {
                  this.messageService.success('状态已强制流转为成功！');
                  this.getWithdrawList();
                  this.forceReason = '';
                  this.isForceError = false;
                  resolve();
                },
                () => {
                  this.forceReason = '';
                  this.isForceError = false;
                  resolve();
                },
              );
          });
        },
        onCancel: () => {
          this.forceReason = '';
          this.isForceError = false;
        },
      });
    },
    1000,
    { trailing: false },
  );

  changePage(): void {
    this.getWithdrawList();
  }
}
