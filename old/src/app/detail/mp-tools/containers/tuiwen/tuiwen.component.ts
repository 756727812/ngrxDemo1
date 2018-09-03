import {
  FormBuilder,
  FormControl,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { Component, Injector, OnInit } from '@angular/core';
import { MpToolsBase } from '../../mp-tools.base';
import { trim } from 'lodash';
import { urlPattern } from '../../services/mp-tools.service';
@Component({
  selector: 'benefit-list',
  templateUrl: './tuiwen.component.html',
  styleUrls: ['./tuiwen.component.less'],
})
export class TuiwenComponent extends MpToolsBase implements OnInit {
  tForm: FormGroup;
  fields = [];
  maxLimit = 5;

  constructor(private fb: FormBuilder, private injector: Injector) {
    super(injector);
  }

  addField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const id =
      this.fields.length > 0 ? this.fields[this.fields.length - 1].id + 1 : 0;
    const control = {
      id,
      group: `group${id}`,
    };
    this.fields.push(control);
    this.tForm.addControl(
      control.group,
      this.fb.group({
        field1: new FormControl(null, [this.textValidor]),
        field2: new FormControl(null, [this.RequiredValidator]),
      }),
    );
  }

  RequiredValidator(c: AbstractControl): { [key: string]: any } | null {
    const value = (c.value || '').trim();
    if (!value) return { required: true };
    return null;
  }

  textValidor(c: FormControl): { [key: string]: any } | null {
    const value = (c.value || '').trim();
    if (!value) return { required: true, message: '文案内容不能为空' };
    const strLen = value.replace(/[\u4e00-\u9fa5]/g, 'xx').length;
    if (strLen > 30) {
      return { maxlength: true, message: '内容长度最长不超过15个字符' };
    }
    return null;
  }

  removeField(i, e: MouseEvent) {
    e.preventDefault();
    if (this.fields.length > 1) {
      const index = this.fields.indexOf(i);
      this.fields.splice(index, 1);
      this.tForm.removeControl(i.group);
    }
  }

  getFormControl(id, field) {
    return this.tForm.get(`group${id}.${field}`);
  }

  _submitForm(ev: Event, data) {
    if (ev) ev.preventDefault();
    for (let i = 0, len = this.fields.length; i < len; i += 1) {
      this.tForm.get(`${this.fields[i].group}.field1`).markAsDirty();
      this.tForm.get(`${this.fields[i].group}.field2`).markAsDirty();
    }
    if (!this.tForm.valid) {
      return;
    }

    const res = Object.keys(data).map((r, ordered) => {
      const name = trim(this.tForm.get(`${r}.field1`).value);
      const url = trim(this.tForm.get(`${r}.field2`).value);
      return {
        name,
        url,
        ordered,
      };
    });
    this.mpToolService.saveTuiwen(res).subscribe(r => {
      this.notify.success('信息提示', '内容发布成功！');
    });
  }

  ngOnInit() {
    this.tForm = this.fb.group({});
    this.addField();
  }
}
