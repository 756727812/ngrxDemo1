import { Component, OnInit, Inject, Input } from '@angular/core';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'daily-welfare-action',
  templateUrl: './daily-welfare-action.template.html',
  styles: [
    `
    .ant-layout{padding:30px;background-color:#fff}
    .lucky-form{max-width:750px}
    .ant-upload-list-item{
        margin-top:0px;
    }
    :host ::ng-deep .avatar-uploader,
      :host ::ng-deep .avatar-uploader-trigger,
      :host ::ng-deep .avatar {
        width: 120px;
        height: 120px;
        display: inline-block;
      }
      :host ::ng-deep .avatar-uploader {
        display: inline-block;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        width:124px;
        height:124px;
        cursor: pointer;
      }
      :host ::ng-deep .avatar-uploader-trigger {
        display: table-cell;
        vertical-align: middle;
        font-size: 28px;
        color: #999;
      }
      :host ::ng-deep i {
        font-size: 32px;
        color: #999;
      }
      :host ::ng-deep .ant-upload-text {
        margin-top: 8px;
        color: #666;
      }
      :host ::ng-deep .ant-upload.ant-upload-select-picture-card .avatar-uploader-trigger {
        height: 96px;
      }
      :host ::ng-deep .ant-upload.ant-upload-select-picture-card > .ant-upload{
        padding: 0;
      }
    `,
  ],
})
export class dailyWelfareAction implements OnInit {
  validateForm: FormGroup;
  parserInt = value => parseInt(value, 10);
  formatterInt = value => (value ? parseInt(value, 10) : '');
  loadingword: any;
  title: string;
  titleMap = {
    add: '创建',
    view: '查看',
  };
  beginUrl: string;
  endUrl: string;
  loading = false;
  fileList = [];
  previewImage = '';
  previewVisible = false;
  type = 'add';
  detailData: any = {};

  // @Input() type: string;

  constructor(
    @Inject('$location') private $location: ng.ILocationService,
    @Inject('$routeParams') private $routeParams: ng.route.IRouteParamsService,
    @Inject('$q') private $q: ng.IQService,
    @Inject('Notification') private Notification: see.INotificationService,
    @Inject('dataService') private dataService: see.IDataService,
    @Inject('$cookies') private $cookies: ng.cookies.ICookiesService,
    @Inject('seeModal') private seeModal: see.ISeeModalService,
    @Inject('$uibModal') private $uibModal: ng.ui.bootstrap.IModalService,
   /* @Inject('seeUpload') private seeUpload: see.ISeeUploadService,*/
    private msg: NzMessageService,
    private fb: FormBuilder,
  ) {
    this.loadingword = '刷新数据';
    this.title = this.titleMap[this.$routeParams.type];
  }

  ngOnInit() {
    this.type = this.$routeParams.type;
    if (this.type === 'view') {
      this.getWelfareDetail();
    } else if (this.type === 'add') {
      this.validateForm = this.fb.group({
        productName: [null, [Validators.required]],
        productPrice: [1],
        limitLabel: [1],
        beginBannerImgUrl: [null],
        endBannerImgUrl: [null],
        imageList: [null],
        beginTime: [, [Validators.required]],
        endTime: [, [Validators.required]],
        // dateRange: [, [Validators.required]],
        friendNum: [5],
        winningIntervalNum: [50],
        luckyBagLimitNum: [50],
        friendOpenLimitNum: [5],
      });
    }
  }
  getWelfareDetail() {
    const id = this.$routeParams.id;
    try {
      this.dataService.luckydraw_detail({ activityId: id }).then(res => {
        const result = res.data;
        this.detailData = result;
        this.detailData.productPrice = this.detailData.productPrice / 100;
        this.beginUrl = result.beginBannerImgUrl;
        this.endUrl = result.endBannerImgUrl;
      });
    } catch (error) {
      this.$location.url('/event/dailywelfare');
    }
  }
  _submitForm() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
    }
    // debugger;
    if (this.beginUrl && this.endUrl && this.getImgList().length) {
      if (this.validateForm.valid) {
        this.validateForm.value['beginBannerImgUrl'] = this.beginUrl;
        this.validateForm.value['endBannerImgUrl'] = this.endUrl;
        this.validateForm.value['beginTime'] = moment(
          this.validateForm.value.beginTime,
        ).format('YYYY-MM-DD HH:mm:ss');
        this.validateForm.value['endTime'] = moment(
          this.validateForm.value.endTime,
        ).format('YYYY-MM-DD HH:mm:ss');
        this.validateForm.value['productPrice'] =
          this.validateForm.value['productPrice'] * 100;
        this.validateForm.value['imageList'] = this.getImgList();
        console.log('value', this.validateForm.value);
        this.dataService.luckydraw_add(this.validateForm.value).then(res => {
          console.log('res', res);
          this.Notification.success();
          this.$location.url('/event/dailywelfare');
        });
      }
    } else {
      this.msg.warning('活动图片和商品详情图不能为空！');
    }
  }
  resetForm() {
    // this.validateForm.reset();
    this.$location.url('/event/dailywelfare');
  }
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  private getBase64(img: File, callback: (img: any) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: UploadFile }, type?) {
    if (info.file.status === 'uploading') {
      this.loading = true;
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      // this.getBase64(info.file.originFileObj, (img: any) => {
      //     this.loading = false;
      //     type ? this.beginUrl = img : this.endUrl = img
      // });
      this.loading = false;
      const img = info.file.response.data;
      type ? (this.beginUrl = img) : (this.endUrl = img);
    }
  }
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };
  cancelPreview = $event => {
    $event.preventDefault();
    this.previewVisible = false;
  };
  handleBeforeUpload = (file,fileList) =>{
    return Observable.create(observer => {
      const image = new Image();
      image.onload=function(){
        const width = image.width;
        const height = image.height;
        observer.next(false);
        observer.complete();
      };
      image.src= window.URL.createObjectURL(file);
    });
  };

  private getImgSize(file){
    return Observable.create(observer => {
      const image = new Image();
      image.onload=function(){
        const width = image.width;
        const height = image.height;
        observer.next({width,height});
      };
      image.src= window.URL.createObjectURL(file);
    });
  }

  handleCustomUpload = (item:any) =>{
    this.getImgSize(item.file).subscribe((size:any)=>{
      if(size.width !== 656 && size.height !== 328){
      //  console.log("not OK !");
      }else{
       // console.log('upload');
      }
    })
  };
  getImgList = () => {
    const imgArray = [];
    const array = this.fileList;
    array.forEach((item, index) => {
      if (item.response) imgArray[index] = item.response.data;
    });
    return imgArray.join();
  };
  ///
  _startDate = null;
  _endDate = null;
  newArray = len => {
    const result = [];
    for (let i = 0; i < len; i++) {
      result.push(i);
    }
    return result;
  };
  _startValueChange = () => {
    if (this._startDate > this._endDate) {
      this._endDate = null;
    }
  };
  _endValueChange = () => {
    if (this._startDate > this._endDate) {
      this._startDate = null;
    }
  };
  _disabledStartDate = startValue => {
    if (!startValue || !this._endDate) {
      return moment(startValue).diff(moment(),'days') < 0;
    }
    return moment(startValue).diff(moment(this._endDate),'days') > 0
      || moment(startValue).diff(moment(),'days') < 0;
  };
  _disabledEndDate = endValue => {
    if (!endValue || !this._startDate) {
      return moment(endValue).diff(moment(),'days') < 0;
    }
    return moment(endValue).diff(moment(this._startDate),'days') < 0;
  };
  get _isSameDay() {
    return (
      this._startDate &&
      this._endDate &&
      moment(this._startDate).isSame(this._endDate, 'day')
    );
  }
  get _endTime() {
    return {
      nzHideDisabledOptions: true,
      nzDisabledHours: () => {
        return this._isSameDay ? this.newArray(this._startDate.getHours()) : [];
      },
      nzDisabledMinutes: h => {
        if (this._isSameDay && h === this._startDate.getHours()) {
          return this.newArray(this._startDate.getMinutes());
        }
        return [];
      },
      nzDisabledSeconds: (h, m) => {
        if (
          this._isSameDay &&
          h === this._startDate.getHours() &&
          m === this._startDate.getMinutes()
        ) {
          return this.newArray(this._startDate.getSeconds());
        }
        return [];
      },
    };
  }
}
