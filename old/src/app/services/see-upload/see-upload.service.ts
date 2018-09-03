import { ISeeUploadService } from './see-upload.interface';
import { INotificationService } from '../notification/notification.interface';

export class seeUpload implements ISeeUploadService {
  static $inject: string[] = ['Upload', '$window', 'Notification', '$q'];
  constructor(
    private Upload: any,
    private $window: ng.IWindowService,
    private Notification: INotificationService,
    private $q: ng.IQService,
  ) { }

  uploadImage: (file: File, success?: Function, event?: Function) => ng.IPromise<any> = (file, success, event) => {
    if (file) {
      return this.Upload.upload({
        url: 'api/item/upload',
        data: { image: file },
      }).then(res => {
        success && success(res.data.data);
      },      res => {
        console.error('错误: ' + res.status);
      },      evt => {
        event && event(evt);
      });
    } else {
      return this.$q.reject('请选择文件！');
    }
  }


  uploadImages: (files: File[]) => ng.IPromise<any> = files => {
    if (files && files.length) {
      return this.Upload.upload({
        url: 'api/item/uploadFiles',
        data: {
          images: files,
        },
      }).then(this.success)
        .catch(this.fail);
    } else {
      return this.$q.reject('请选择文件！');
    }
  }


  uploadAuthImage: (file: File) => ng.IPromise<any> = file => {
    if (file) {
      return this.Upload.upload({
        url: 'api/auth/upload',
        data: { image: file },
      }).then(this.success)
        .catch(this.fail);
    } else {
      return this.$q.reject('请选择文件！');
    }
  }


  uploadAuthImages: (files: File[]) => ng.IPromise<any> = files => {
    if (files && files.length) {
      return this.Upload.upload({
        url: 'api/auth/uploadFiles',
        data: { images: files },
      }).then(this.success)
        .catch(this.fail);
    } else {
      return this.$q.reject('请选择文件！');
    }
  }

  uploadBatchFile: (options: {
    file: File,
    action_type: number,
  }) => ng.IPromise<any> = options => {
    return this.Upload.upload({
      url: '/api/rule/batchModifyItemInfo',
      data: {
        action_type: options.action_type,
        file: options.file,
      },
    }).then(this.success)
      .catch(this.fail);
  }

  readImageData (file: File) {
    const deferred = this.$q.defer();
    if (file) {
      const reader = new FileReader();
      const image = new Image();
      const data = {};
      reader.readAsDataURL(file);
      reader.onload = function (event: Event) {
        image.src = event.target['result'];
        image.onload = function () {
          data['width'] = (<any>this).width;
          data['height'] = (<any>this).height;
          data['type'] = file.type;
          data['name'] = file.name;
          data['size'] = ~~(file.size / 1024) + 'KB';
          deferred.resolve(data);
        };
        image.onerror = function () {
          deferred.reject('不正确的格式: ' + file.type);
        };
      };
    } else {
      deferred.reject('请选择文件');
    }
    return deferred.promise;
  }

  private success: (response: any) => any = (response) => {
    if (response.data.result === 1)
      return response.data;
    else if (response.data.result === 101)
      this.$window.location.href = '/login.html';
    else
      return this.$q.reject(response);
  }

  private fail: (response: any) => ng.IPromise<any> = (response) => {
    if (response.status === 200 && response.data.msg)
      this.Notification.dataError(response.data.msg);
    else {
      console.error(response);
      this.Notification.serverError();
    }
    return this.$q.reject(response);
  }
}
