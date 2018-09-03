import * as _ from 'lodash';;
import * as moment from 'moment';
import { IDataService } from '../../services/data-service/data-service.interface';
import { ISeeModalService } from '../../services/see-modal/see-modal.interface';
import { INotificationService } from '../../services/notification/notification.interface';
import { ISeeUploadService } from '../../services/see-upload/see-upload.interface';

export class ModalPictureCenterController implements ng.IComponentController {

  static $inject: string[] = ['$q', 'dataService', 'seeModal', 'Notification', 'seeUpload'];

  close: Function;
  dismiss: Function;
  resolve: {
    type: number  // 1: 商品主图 2: 尺码图 3: 编辑器
    alreadyHasList: string[],
  };
  availablePictureCount: number = 0;
  items: {
    page: number,
    list: any[],
    count: number,
  } = {
    page: 1,
    list: [],
    count: 0,
  };
  checkedImagesID: number[] = [];
  totalCount: number;

  constructor(
    private $q: ng.IQService,
    private dataService: IDataService,
    private seeModal: ISeeModalService,
    private Notification: INotificationService,
    private seeUpload: ISeeUploadService,
  ) { }

  $onInit() {
    this.$q.all([
      this.getPictureList(),
    ]);
    this.availablePictureCount = this.getAvailablePictureCount(this.resolve.type, this.resolve.alreadyHasList);
    $('.modal-picture-center').parents('.modal-dialog').width('750px');
  }

  ok: () => any = () => this.close({
    $value: this.items.list.filter(item => _.includes(this.checkedImagesID, item.id)).map(item => item = item.pictureUrl),
  })

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  uploadImages: (files: File[]) => ng.IPromise<any> = (files) =>
    this.seeUpload.uploadImages(files).then(({ data }) => {
      this.addImagesToPictureCenter(data);
      return this.getPictureList();
    })

  addToCheckedImagesID(model: boolean, id: number, index: number): void {
    if (model) {
      const img = document.querySelectorAll('.modal-picture-center img')[index];
      const { width, height } = (img as any).dataset;
      if (this.resolve.type === 1 && (width < 640 || height < 640)) {
        this.items.list[index].checked = false;
        return this.Notification.warn('主图尺寸不得低于640x640');
      }
      if (this.resolve.type === 2 && (width < 600 || width > 1000)) {
        this.items.list[index].checked = false;
        return this.Notification.warn('尺码图宽度要在600px~1000px之间');
      }
      if (!_.includes(this.checkedImagesID, id)) {
        this.checkedImagesID.push(id);
      }
    } else {
      this.checkedImagesID = this.checkedImagesID.filter(val => val !== id);
    }
  }

  getPictureList: (page?: number) => ng.IPromise<any> = (page = 1) =>
    this.dataService.pictureCenter_list({
      currentPageNo: page,
      pageSize: 12,
    }).then(({ data }) => {
      this.items = {
        list: data ? data.list.map(item => ({
          ...item,
          // checked: _.includes(this.checkedImagesID, item.id) || _.includes(this.resolve.alreadyHasList, item.pictureUrl),
          // disabled: _.includes(this.resolve.alreadyHasList, item.pictureUrl),
        })) : [],
        count: data ? data.count : 0,
        page,
      };
    })

  removeFromPictureCenter: (id: number) => ng.IPromise<any> = id =>
    this.seeModal.confirmP('删除确认', '是否确认删除这张图片？')
      .then(() => this.dataService.pictureCenter_del({ id })
        .then(res => {
          this.checkedImagesID = this.checkedImagesID.filter(item => item !== id);
          this.Notification.success('删除图片成功');
          return this.getPictureList(this.items.page);
        }))

  private addImagesToPictureCenter: (urls: string[]) => ng.IPromise<any> = urls =>
    this.dataService.pictureCenter_add({ files: urls.join(',') })

  private getAvailablePictureCount(type: number, alreadyHasList: string[]): number {
    if (type === 1) {
      return 5 - alreadyHasList.length;
    } else if (type === 2) {
      return 1 - alreadyHasList.length;
    } else {
      return 9999;
    }
  }
}

export const ModalPictureCenter: ng.IComponentOptions = {
  template: require('./modal-picture-center.template.html'),
  controller: ModalPictureCenterController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
