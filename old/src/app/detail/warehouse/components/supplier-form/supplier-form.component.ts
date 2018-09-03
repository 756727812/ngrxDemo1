import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormArray,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { Supplier } from '../../models/supplier.model';
import { TYPE_OPTIONS } from '../../containers/suppliers/suppliers.component';
import { SupplierService } from '../../services';
import { Accessor } from '../../models/accessor.model';

@Component({
  selector: 'supplier-form',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'supplier-form.component.html',
})
export class SupplierFormComponent implements OnChanges {
  exists = false;
  detailMode = false;
  typeOptions = TYPE_OPTIONS;
  searchOptions = [
    { value: 'jack', label: 'Jack' },
    { value: 'lucy', label: 'Lucy' },
    { value: 'tom', label: 'Tom' },
  ];
  private debouncer;

  @Input() supplier: Supplier;
  @Input()
  set type(value: string) {
    this.detailMode = value === 'detail';
  }
  @Input() accessors: Accessor[] = [];

  @Output() create = new EventEmitter<Supplier>();
  @Output() update = new EventEmitter<Supplier>();

  form: FormGroup;

  constructor(private fb: FormBuilder, private supplierServ: SupplierService) {
    this.buildForm();
  }

  log(a) {
    console.log(a);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.supplier && this.supplier.id) {
      this.exists = true;

      // 兼容脏数据
      const value = { ...this.supplier };
      if (
        Array.isArray(this.accessors) &&
        this.accessors.length &&
        !this.accessors.find(item => value.seeAccesser === item.sellerName)
      ) {
        value.seeAccesser = null;
      }

      this.form.patchValue(value);
    }
  }

  getFormControl(name: string) {
    return this.form.get(name);
  }

  isFormControlHasError(name: string, validator: string = 'required') {
    const formControl = this.getFormControl(name);
    return formControl.dirty && formControl.hasError(validator);
  }

  submitForm($event: UIEvent, form: FormGroup) {
    $event.preventDefault();
    Object.keys(this.form.controls).forEach(key =>
      this.form.get(key).markAsDirty(),
    );

    const { valid } = form;
    if (valid) {
      if (this.exists) {
        this.update.emit({ ...this.supplier, ...form.value });
      } else {
        this.create.emit(form.value);
      }
    }
  }

  private buildForm() {
    this.form = this.fb.group({
      companyName: [
        '',
        [Validators.required, this.noWhitespaceValidator],
        this.companyNameAsyncValidator,
      ],
      type: ['', Validators.required],
      contact: ['', [Validators.required, this.noWhitespaceValidator]],
      contactInfo: ['', [Validators.required, this.noWhitespaceValidator]],
      address: [''],
      paymentMethod: [0, Validators.required],
      alipayAccount: ['', [this.paymentValidatorGenerator(0)]],
      bankAccountName: ['', [this.paymentValidatorGenerator(1)]],
      bankName: ['', [this.paymentValidatorGenerator(1)]],
      bankAddress: [''],
      bankAccountNo: ['', [this.paymentValidatorGenerator(1)]],
      swiftCode: [''],
      seeAccesser: ['', [Validators.required, this.noWhitespaceValidator]],
      remark: [''],
    });

    this.getFormControl('paymentMethod').valueChanges.subscribe(
      (value: 0 | 1) => {
        const fcs = [
          ['alipayAccount'],
          ['bankAccountName', 'bankName', 'bankAccountNo'],
        ];
        fcs.forEach(l =>
          l.forEach(name => this.getFormControl(name).clearValidators()),
        );
        fcs[value].forEach(name => {
          this.getFormControl(name).setValidators([
            this.paymentValidatorGenerator(value),
          ]);
        });
        fcs.forEach(l =>
          l.forEach(name => this.getFormControl(name).updateValueAndValidity()),
        );
      },
    );
  }

  private noWhitespaceValidator = (control: FormControl): ValidationErrors => {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { required: true };
  };

  // TODO, 直接用 HTTPClient 无法 complete？
  private companyNameAsyncValidator = (control: FormControl): any => {
    clearTimeout(this.debouncer);
    return Observable.create(observer => {
      if (
        this.detailMode ||
        (this.exists && control.value === this.supplier.companyName)
      ) {
        observer.next(null);
        observer.complete();
        return;
      }
      this.debouncer = setTimeout(() => {
        this.supplierServ
          .checkIfCompanyNameExists({ companyName: control.value })
          .subscribe(duplicated => {
            observer.next(duplicated ? { duplicated, error: true } : null);
            observer.complete();
          });
      }, 300);
    });
  };

  private paymentValidatorGenerator = (method: number) => (
    control: FormControl,
  ): { [key: string]: boolean } => {
    if (!this.form) {
      return;
    }
    const methodValue = this.form.get('paymentMethod').value;
    const isWhitespace = (control.value || '').trim().length === 0;
    if (methodValue === method && isWhitespace) {
      return { required: true };
    }
  };
}
