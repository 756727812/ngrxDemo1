import { Component, OnInit, Input } from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { moneyValidator, ruleValidator } from '../../validators/validators';
import { accuracy } from '../../services/utils.service';
import { RulesData } from '../../models';

@Component({
  selector: 'rules-form',
  templateUrl: './rules-form.component.html',
  styleUrls: ['./rules-form.component.scss'],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class RulesFormComponent implements OnInit {
  @Input() rulesData: RulesData;
  types: any[] = [{ type: 0, label: '满额减' }, { type: 1, label: '满件折' }];
  form: FormGroup;
  isTypeDisabled: boolean = false;
  isEditDisabled: boolean = false;

  constructor(
    private ctrlContainer: FormGroupDirective,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    let initType = 0;
    if (this.rulesData) {
      initType = this.rulesData.thresholdType;
      this.isTypeDisabled = true;
      this.isEditDisabled = !this.rulesData.isEdit;
    }
    this.form = this.ctrlContainer.form;
    this.form.addControl(
      'rulesForm',
      this.fb.group({
        type: [initType],
        rules: this.fb.array([]),
        money: this.fb.group(
          {
            targetPrice: [''],
            offPrice: [''],
            capping: [0],
          },
          { validator: moneyValidator },
        ),
      }),
    );
    this.setForm(initType);
  }

  get rulesForm() {
    return <FormGroup>this.form.controls['rulesForm'];
  }

  isInvalid(controlName: string): boolean {
    return (
      (<FormGroup>this.form.controls['rulesForm']).controls[controlName]
        .touched &&
      (<FormGroup>this.form.controls['rulesForm']).controls[controlName].invalid
    );
  }

  isValid(controlName: string): boolean {
    return (
      (<FormGroup>this.form.controls['rulesForm']).controls[controlName]
        .touched &&
      (<FormGroup>this.form.controls['rulesForm']).controls[controlName]
        .dirty &&
      !(<FormGroup>this.form.controls['rulesForm']).controls[controlName].valid
    );
  }

  handleTypeChange(type) {
    this.setForm(type);
  }

  private createRuleForm(
    discountType?: any,
    thresholdValue?: any,
    discountValue?: any,
  ) {
    return this.fb.group({
      discountType: [discountType || 1],
      thresholdValue: [thresholdValue || '', [Validators.required]],
      discountValue: [discountValue || '', [Validators.required]],
    });
  }

  setForm(type: number) {
    if (type === 0) {
      this.rulesForm.setControl(
        'money',
        this.fb.group(
          {
            targetPrice: [
              this.rulesData
                ? this.rulesData.rules[0].thresholdValue / 100
                : '',
              [Validators.required],
            ],
            offPrice: [
              this.rulesData ? this.rulesData.rules[0].discountValue / 100 : '',
              [Validators.required],
            ],
            capping: [this.rulesData ? !this.rulesData.capping : 0],
          },
          { validator: moneyValidator },
        ),
      );
      this.rulesForm.setControl('rules', this.fb.array([]));
    } else {
      this.rulesForm.setControl(
        'money',
        this.fb.group({ targetPrice: [''], offPrice: [''], capping: [0] }),
      );
      let ruleForms;
      if (this.rulesData) {
        ruleForms = this.rulesData.rules.map(item => {
          return this.createRuleForm(
            item.discountType,
            item.thresholdValue,
            item.discountValue,
          );
        });
      } else {
        ruleForms = [this.createRuleForm()];
      }

      this.rulesForm.setControl(
        'rules',
        this.fb.array([...ruleForms], ruleValidator),
      );
    }
  }

  get isFull() {
    const arr = this.rulesForm.get('rules') as FormArray;
    return arr.length < 5;
  }

  get rules(): FormArray {
    return this.rulesForm.get('rules') as FormArray;
  }

  isHasRuleError(type, index) {
    if (
      this.rules.errors &&
      this.rules.errors[type].length &&
      this.rules.errors[type].indexOf(index) !== -1
    ) {
      return true;
    }
    return false;
  }

  rmRow(e: MouseEvent, index) {
    e.preventDefault();
    const arr = this.rulesForm.get('rules') as FormArray;
    arr.removeAt(index);
  }

  addRow() {
    const arr = this.rulesForm.get('rules') as FormArray;
    arr.push(this.createRuleForm());
  }

  validateValue(target, m, key) {
    const value = Number(target.value);
    if (!value || value < 0.1 || value > 9.9) {
      target.value = m[key] || 0.1;
      return;
    }
    m[key] = value;
  }

  padZero(type) {
    const c = this.rulesForm.get(type);
    const rValue = c.value;
    const tValue = +rValue;
    if (!tValue || (tValue && tValue <= 0)) {
      c.patchValue('');
      c.markAsDirty();
      return;
    }
    if (!accuracy.test(rValue)) {
      c.setErrors({ accuracy: true });
      c.markAsDirty();
    }
  }

  formatFloat(type, discountType: number) {
    const c = this.rulesForm.get(type);
    let value = +c.value;

    const MAX_DISCOUNT = 9.9;
    const MAX_FLOAT_NUM = 1;
    if (discountType === 0) {
      value = parseInt(value + '', 10);
    } else if (discountType === 1) {
      value =
        Math.floor(value * Math.pow(10, MAX_FLOAT_NUM)) /
        Math.pow(10, MAX_FLOAT_NUM);
      value = value > MAX_DISCOUNT ? MAX_DISCOUNT : value;
      value = parseFloat(value + '');
    }

    const patchValue = value <= 0 ? '' : value;
    c.patchValue(patchValue);
    c.markAsDirty();
  }
}
