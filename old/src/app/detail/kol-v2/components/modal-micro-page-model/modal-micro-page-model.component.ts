import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NzModalSubject } from 'ng-zorro-antd';
import { noWhitespaceValidator } from '@shared/validators';

@Component({
  selector: 'modal-micro-page-model',
  templateUrl: 'modal-micro-page-model.component.html',
})
export class ModalMicroPageModelComponent {
  form: FormGroup = this.fb.group({
    name: [null, [Validators.required, noWhitespaceValidator]],
  });
  isEdit = false;

  @Input()
  set name(name: string) {
    if (name) {
      this.isEdit = true;
    }
    this.form.patchValue({ name });
  }

  constructor(private fb: FormBuilder, private subject: NzModalSubject) {}

  submitForm($event: UIEvent, form: FormGroup) {
    $event.preventDefault();
    Object.values(form.controls).forEach(c => c.markAsDirty());
    const { invalid } = form;
    if (invalid) {
      return;
    }

    this.subject.next({
      action: this.isEdit ? 'edit' : 'add',
      value: this.form.get('name').value,
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
