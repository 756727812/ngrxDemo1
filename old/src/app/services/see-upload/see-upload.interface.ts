export interface ISeeUploadService {
  uploadImage: (file: File, success?: Function, event?: Function) => ng.IPromise<any>
  uploadImages: (files: File[]) => ng.IPromise<any>
  uploadAuthImage: (file: File) => ng.IPromise<any>
  uploadAuthImages: (files: File[]) => ng.IPromise<any>
  uploadBatchFile: (options: {
    file: File,
    action_type: number
  }) => ng.IPromise<any>
  readImageData: (file: File) => ng.IPromise<any>
}
