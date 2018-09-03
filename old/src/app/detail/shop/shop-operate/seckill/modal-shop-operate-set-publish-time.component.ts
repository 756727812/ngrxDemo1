import * as moment from 'moment';

export class ModalShopOperateSetPublishTimeController implements ng.IComponentController {

  close: Function;
  dismiss: Function;
  formData: {
    releaseTime: string | Date,
  } = {
    releaseTime: undefined,
  };
  resolve: {
    endTime: string;
    releaseTime: string;
    title: string;
  };
  error: string = '';

  $onInit(): void {
    this.formData = {
      releaseTime: this.resolve.releaseTime ? new Date(this.resolve.releaseTime) : undefined,
    };
  }

  ok: () => any = () => {
    this.error = '';
    const { title } = this.resolve;
    if (!this.formData.releaseTime) {
      this.error = `请选择${title}时间`;
    }
    if (this.nowTimeInvalid()) {
      this.error = `${title}时间需晚于当前时间`;
    }
    if (this.endTimeInvalid()) {
      this.error = `${title}时间需早于活动结束时间`;
    }
    if (this.error !== '') {
      return;
    }
    this.error = '';
    this.close({
      $value: moment(this.formData.releaseTime).format('YYYY-MM-DD HH:mm:ss'),
    });
  }

  cancel: () => any = () => this.dismiss({ $value: 'cancel' });

  nowTimeInvalid: () => boolean = () => this.formData.releaseTime <= new Date();

  endTimeInvalid: () => boolean = () => this.formData.releaseTime >= new Date(this.resolve.endTime);

  beforeRenderPublishTime(
    $view: any, $dates: any[], $leftDate: any, $upDate: any, $rightDate: any,
  ) {
    const now = new Date();
    $dates
      .filter(date => new Date(date.utcDateValue)
        <= new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      .forEach(date => date.selectable = false);

    const activeDate = moment(this.resolve.endTime);
    $dates
      .filter(date => date.localDateValue() >= activeDate.valueOf())
      .forEach(date => date.selectable = false);
  }
}

export const ModalShopOperateSetPublishTime: ng.IComponentOptions = {
  template: require('./modal-shop-operate-set-publish-time.template.html'),
  controller: ModalShopOperateSetPublishTimeController,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
};
