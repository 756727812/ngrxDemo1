import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  cateNameValidator,
  mapCateValidator,
} from '../../validators/validators';
import { NzModalSubject } from 'ng-zorro-antd';
@Component({
  selector: 'app-cate-config-modal',
  templateUrl: './cate-config-modal.component.html',
  styles: [
    `
      :host ::ng-deep .ant-checkbox-wrapper {
        margin: 0 !important;
      }
    `,
  ],
})
export class CateConfigModalComponent implements OnInit {
  sForm: FormGroup;
  @Input() mallClassName: string = '';

  @Input() mapCate = [];

  constructor(private fb: FormBuilder, private subject: NzModalSubject) {}

  ngOnInit() {
    this.sForm = this.fb.group({
      mallClassName: [this.mallClassName, [cateNameValidator]],
      mapCate: [this.mapCate, mapCateValidator],
    });
  }

  submitForm(form) {
    for (const i in this.sForm.controls) {
      this.sForm.controls[i].markAsDirty();
      this.sForm.controls[i].updateValueAndValidity({ onlySelf: true });
    }
    const mapCateValue = form.mapCate.filter(r => r.checked).map(r => {
      return {
        classId: r.classId,
      };
    });
    const data = {
      mallClassName: form.mallClassName,
      relateList: mapCateValue,
    };
    if (!this.sForm.valid) return;
    this.subject.destroy({
      data,
    });
  }
}
