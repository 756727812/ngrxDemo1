import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { ModalChooseGoodsComponent } from '../modal-choose-goods/modal-choose-goods.component';
import { containSpecial, Utils } from '../../services/utils.service';

@Component({
  selector: 'benefit-group',
  templateUrl: './benefit-group.component.html',
  styleUrls: ['./benefit-group.component.less'],
})
export class BenefitGroupComponent implements OnInit {
  @Input() data = [];

  @Input() page: number = 1;
  @Input() pageSize: number = 1;
  @Input() total: number = 1;
  @Input() isEdit: boolean = false;
  @Input() xiaodianpuId: any;
  @Input() isDisabled: boolean = false;
  @Input() loading: boolean = true;
  @Output() groupEditEvent = new EventEmitter<any>();
  @Output() groupRemoveEvent = new EventEmitter<any>();
  @Output() detailGroupEvent = new EventEmitter<any>();
  @Output() reloadEvent = new EventEmitter<any>();
  @Output() OkAction = new EventEmitter<any>();
  @Output() CancelAction = new EventEmitter<any>();

  constructor(
    private notify: NzNotificationService,
    private modalService: NzModalService,
    private utils: Utils,
  ) {}

  ngOnInit() {
    const data = this.data.map(r => {
      r.srcName = r.groupName;
      r.srcId = r.sortId;
      return r;
    });
    this.data = data;
  }

  toggleName(m: any) {
    if (this.isDisabled) {
      this.disableEditGroup();
      return;
    }
    m.nameEdit = true;
  }

  toggleSort(m: any) {
    if (this.isDisabled) {
      this.disableEditGroup();
      return;
    }
    m.sortEdit = true;
  }

  showGroup(m) {
    this.detailGroupEvent.emit({
      groupId: m.id,
      groupName: m.groupName,
    });
  }

  sortGroup({ target, data }, m) {
    if (data === -2) {
      return this.notify.warning('信息提示', '长度不能超过10位！');
    }
    if (data < 0) {
      return this.notify.warning('信息提示', '需填写大于等于0的整数！');
    }
    if (m.sortId === data) return;
    const ret = this.data.some(r => r.id !== m.id && r.sortId === data);
    if (ret) {
      target.sort = m.sortId;
      this.notify.warning('信息提示', '分组排序编号不能重复!');
      return;
    }

    m.sortId = data;
    this.groupEditEvent.emit({
      data: { ...m },
      msg: '活动分组排序',
    });
  }

  private groupInfoIsRepeat(m, field) {
    return this.data.some(r => r.id !== m.id && r[field] === m[field]);
  }

  private disableEditGroup() {
    this.notify.warning('信息提示', '禁止编辑分组信息！');
  }

  nameChange(m) {
    if (this.isDisabled) {
      this.disableEditGroup();
      return;
    }

    if (containSpecial.test(m.groupName.trim())) {
      this.notify.warning('信息提示', '分组名称不能包含特殊字符!');
      return;
    }
    if (m.groupName.length > 20) {
      m.nameEdit = true;
      this.notify.warning('信息提示', '分组名称上限20字，建议控制8字以内!');
      return;
    }

    if (this.groupInfoIsRepeat(m, 'groupName')) {
      this.notify.warning('信息提示', '分组名称不能重复!');
      return;
    }

    if (m.groupName === m.srcName) {
      m.nameEdit = false;
      return;
    }

    this.groupEditEvent.emit({
      data: { ...m },
      msg: '分组名称',
    });
  }

  removeGroup(m) {
    if (this.isDisabled) {
      this.disableEditGroup();
      return;
    }
    if (!this.isEdit) {
      this.notify.warning('信息提示', '不能删除在进行中的活动分组!');
      return;
    }
    this.groupRemoveEvent.emit(m.id);
  }

  addGoods(m) {
    if (this.isDisabled) {
      this.disableEditGroup();
      return;
    }
    const modal: any = this.modalService.open({
      title: '添加商品',
      style: {
        'min-width': '1000px',
      },
      componentParams: { groupId: m.id, xiaodianpuId: this.xiaodianpuId },
      content: ModalChooseGoodsComponent,
      footer: false,
      maskClosable: false,
    });
    modal.subscribe(data => {
      if (data.type) {
        if (data.type === 'toList') {
          modal.destroy('onCancel');
          this.OkAction.emit({
            groupId: m.id,
            groupName: m.groupName,
          });
        }
      }
      if (data === 'onHidden') {
        this.reloadEvent.emit();
      }
    });
  }
}
