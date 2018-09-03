import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { NzModalSubject, NzMessageService } from 'ng-zorro-antd';
import { RulesService } from '../../services/rules.service';

@Component({
  selector: 'app-rules-card-add-form',
  templateUrl: './rules-card-add-form.component.html',
  styleUrls: ['./rules-card-add-form.component.less'],
})
export class RulesCardAddFormComponent implements OnInit {
  myForm: FormGroup;
  defaultRules: any[] = [];
  isLoading: boolean = false;
  ruleNameTextLimitCount: number = 8;
  ruleNameTextCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private subject: NzModalSubject,
    private rulesService: RulesService,
    private nzMessageService: NzMessageService,
  ) {}

  ngOnInit() {
    this.createForm();
    this.getDefaultRules();
  }

  createForm() {
    this.myForm = this.fb.group({
      rule_name: ['', [Validators.required, Validators.maxLength(8)]],
      rule_id: [null, [Validators.required]],
    });
    this.myForm.get('rule_name').valueChanges.forEach((value: string) => {
      this.ruleNameTextCount = value.length;
    });
  }

  submitForm() {
    this.markAsDirty();
    if (!this.myForm.valid) {
      return;
    }
    const data = this.myForm.value;
    this.isLoading = true;
    this.rulesService
      .addRule(data)
      .pipe(
        catchError((error: any) => {
          this.isLoading = false;
          this.nzMessageService.create('error', `添加失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res.result === 1) {
          this.isLoading = false;
          this.nzMessageService.create('success', `添加成功`);
          this.subject.next({
            result: true,
          });
          this.subject.destroy();
        } else {
          this.nzMessageService.create('error', `添加失败`);
        }
      });
  }

  getDefaultRules() {
    this.rulesService
      .getTplRule()
      .pipe(
        catchError((error: any) => {
          this.nzMessageService.create('error', `查询默认规则失败`);
          return Observable.of(null);
        }),
      )
      .subscribe(res => {
        if (res.result === 1) {
          this.defaultRules = res.data;
          this.myForm
            .get('rule_id')
            .setValue(
              (this.defaultRules[0] && this.defaultRules[0].rule_id) || null,
            );
        } else {
          this.nzMessageService.create('error', `查询默认规则失败`);
        }
      });
  }

  markAsDirty() {
    Object.keys(this.myForm.controls).forEach(field => {
      this.myForm.controls[field].markAsDirty();
    });
  }

  getFormControl(name) {
    return this.myForm.controls[name];
  }
}
