export * from './app/services/data-service/data-service.interface';
export * from './app/services/report-service/report-service.interface';
export * from './app/services/assert-service/assert.service.interface';
export * from './app/services/notification/notification.interface';
export * from './app/services/see-modal/see-modal.interface';
export * from './app/services/see-upload/see-upload.interface';
export * from './app/services/see-modal/see-modal.service';

// declare const see: string
// export = see;
export as namespace see;

declare namespace see {

}

export interface ICommonResponse<T> {
  result: number;
  msg: string;
  data?: T;
}
