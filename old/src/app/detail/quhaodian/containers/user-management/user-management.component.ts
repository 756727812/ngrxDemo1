import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { UserManageService } from '../../services';
import { UserIdentifyInfoComponent, QrCodeComponent } from '../../components';

@Component({
  selector: 'quhaodian-user-management',
  templateUrl: 'user-management.component.html',
  styleUrls: ['./user-management.component.less'],
})
export class UserManagementComponent implements OnInit {
  page: number = 1;
  pageSize: number = 10;
  total: number = 0;
  userList = [];
  keyword: string = '';
  loading: boolean = false;
  currentModal: any;

  @ViewChild('footer') footerTpl: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private userManageService: UserManageService,
  ) {}

  ngOnInit() {
    this.getUserList();
  }

  getUserList(): void {
    this.loading = true;
    this.userManageService
      .getUserList({
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
      })
      .subscribe(
        (res: any) => {
          this.loading = false;
          this.userList = res.data.list;
          this.total = res.data.count;
        },
        () => {
          this.loading = false;
        },
      );
  }

  showIdentityInfo(userId: string): void {
    this.userManageService.getIdentifyInfo({ userId }).subscribe((res: any) => {
      const {
        userId,
        realName,
        identifyNumber,
        gender,
        frontUrl,
        backendUrl,
      } = res.data;
      const info = {
        userId,
        realName,
        identifyNumber,
        gender,
        frontUrl,
        backendUrl,
      };

      this.currentModal = this.modalService.open({
        title: '实名认证',
        componentParams: { identifyInfo: info },
        content: UserIdentifyInfoComponent,
        wrapClassName: 'see-modal-md',
        maskClosable: false,
        footer: this.footerTpl,
      });
    });
  }

  downloadImg(selector, name): void {
    const image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function() {
      const suffix = image.src.substr(image.src.lastIndexOf('.'));
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const url = canvas.toDataURL('image/png');

      // 生成一个a元素
      const a = document.createElement('a');
      // 创建一个单击事件
      const event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,
      );
      // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
      a.download = name + suffix;
      // 将生成的URL设置为a.href属性
      a.href = url;
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), name + suffix);
      } else {
        a.dispatchEvent(event);
      }
    };

    image.src = document.querySelector(selector).src;
  }

  showCode(index: number): void {
    if (!index) {
      return;
    }
    let title = '';
    if (index === 1) {
      title = '日常礼包列表小程序码';
    } else if (index === 2) {
      title = '0.01元礼包商详小程序码';
    } else if (index === 3) {
      title = '顶级合伙人邀请码';
    }

    this.currentModal = this.modalService.open({
      title,
      componentParams: { index },
      content: QrCodeComponent,
      wrapClassName: 'see-modal-md',
      maskClosable: false,
      okText: '下载',
      onOk: () => {
        this.downloadImg('#quhaodianQrCode', title.replace('.', ''));
      },
    });
  }

  changeWechatgroupState(
    userId: string,
    isWechatgroup: number,
    username,
  ): void {
    const wechatgroup = isWechatgroup === 1 ? 0 : 1;
    this.userManageService
      .updateWechatgroup({ userId, wechatgroup })
      .subscribe((res: any) => {
        const msg = wechatgroup === 1 ? '成功标记为已入群' : '已撤销入群标记';
        this.messageService.success(`${username}（昵称）${msg}`);

        this.userList.map((item: any) => {
          if (item.id === userId) {
            item.isWechatgroup = wechatgroup;
          }
        });
      });
  }

  changePage(): void {
    this.getUserList();
  }

  searchClick() {
    this.getUserList();
  }

  handleOk(): void {
    this.currentModal.destroy('onOk');
  }
}
