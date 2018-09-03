import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { NzModalSubject } from 'ng-zorro-antd';
import { noWhitespaceValidator } from '@shared/validators';
import { CODES, getItem } from '@utils';
import * as moment from 'moment';

const isAdmin = () =>
  [CODES.Super_Admin, CODES.Elect_Admin, CODES.KOL_Admin].includes(
    getItem('seller_privilege') >>> 0,
  );

const wechatArticleUrlValidator = (control: FormControl): ValidationErrors => {
  const isWhitespace = (control.value || '').trim().length === 0;
  if (isWhitespace) {
    return null;
  }
  const isValid = /^\s*https?:\/\/mp.weixin.qq.com\/s\/.{22}\s*$/.test(
    control.value,
  );
  return isValid ? null : { pattern: true };
};

const POSITIVE_INTEGER = /^[1-9][0-9]*$/;
const NON_NEGATIVE_INT = /^(?:[1-9][0-9]*|0)$/;

@Component({
  selector: 'modal-article-model',
  templateUrl: 'modal-article-model.component.html',
})
export class ModalArticleModelComponent {
  // kol_id,
  //         article_id,
  //         floor_level,
  //         title,
  //         url,
  //         from_type,
  //         from_collection_id,
  //         act_order,
  //         act_gmv,
  //         is_new,
  //         from_article_id,
  //         start_time: new Date(start_time * 1000),
  get isAdmin(): boolean {
    return isAdmin();
  }

  get levelMin(): number {
    return this.isAdmin ? 0 : 1;
  }

  get levelPlaceholder(): string {
    const p = '头条文章填1，次条填2，以此类推';
    return this.isAdmin ? `活动填0，${p}` : p;
  }

  form: FormGroup = this.fb.group({
    title: [null, [Validators.required, noWhitespaceValidator]],
    start_time: [null, [Validators.required]],
    floor_level: [
      null,
      [
        Validators.required,
        // Validators.min(this.isAdmin ? 0 : 1),
        // input-number 有 bug 无法处理输入0，日后改
        Validators.pattern(this.isAdmin ? NON_NEGATIVE_INT : POSITIVE_INTEGER),
      ],
    ],
    url: [null, [wechatArticleUrlValidator]],
  });
  isEdit = false;

  @Input()
  set item(item: any) {
    if (!item) {
      return;
    }
    this.isEdit = true;
    const { title, start_time, floor_level, url } = item;
    this.form.patchValue({
      title,
      floor_level,
      url,
      start_time: start_time * 1000,
    });
  }

  constructor(private fb: FormBuilder, private subject: NzModalSubject) {}

  submitForm($event: UIEvent, form: FormGroup) {
    $event.preventDefault();
    Object.values(form.controls).forEach(c => c.markAsDirty());
    const { invalid } = form;
    if (invalid) {
      return;
    }

    const start_time = moment(
      moment(<Date>this.form.get('start_time').value).format('YYYY-MM-DD'),
    ).unix();
    this.subject.next({
      action: this.isEdit ? 'edit' : 'add',
      value: {
        ...this.form.value,
        start_time,
      },
    });
    this.subject.destroy('onOk');
  }

  handleCancel(e) {
    this.subject.destroy('onCancel');
  }

  isFormControlHasError(name: string, validator: string = 'required') {
    const formControl = this.form.get(name);
    return formControl.dirty && formControl.hasError(validator);
  }
}
