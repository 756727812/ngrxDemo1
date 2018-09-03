import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import * as bowser from 'bowser';

@Component({
  selector: 'c2c-register',
  templateUrl: './c2c-register.component.html',
  styleUrls: ['./c2c-register.component.less'],
})
export class C2cRegisterComponent implements OnInit {
  error: string = ''; // 错误提示
  btn_disabled: boolean; // 提交按钮是否禁用
  isMobile: boolean = bowser.mobile;
  formData: {
    seller_company: string;
    brand_contact_name: string;
    wx_official_name: string;
    wx_official_account: string;
    brand_suitable_crowd: string;
    brand_avg_price: string;
    brand_consume_crowd: string;
    brand_gross_profit: string;
    brand_business_category: string;
    connection_man_name: string;
  } = {
    seller_company: '',
    brand_contact_name: '',
    wx_official_name: '',
    wx_official_account: '',
    brand_suitable_crowd: '',
    brand_avg_price: '',
    brand_consume_crowd: '',
    brand_gross_profit: '',
    brand_business_category: '',
    connection_man_name: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}

  onSubmit(): void {
    this.btn_disabled = true;
    this.btn_disabled = true;
    const params = {
      ...this.formData,
      seller_type: 3,
    };
    this.authService.addAndUpdateInfo(params).subscribe(
      () => {
        this.router.navigate(['/register/3']);
      },
      (e: any) => {
        this.error = e.res.msg;
      },
      () => {
        this.btn_disabled = false;
      },
    );
  }
}
