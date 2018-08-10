import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompleteComponent } from "./complete.component";
import { CompleteRoutingModule } from "./complete.routing";
import { CreateModule } from "../create/create.module";

@NgModule({
  declarations: [
    CompleteComponent
  ],
  imports: [
    CompleteRoutingModule,
    CommonModule,
    FormsModule,
    CreateModule // 导入create模块，可以用它里面的组件等
  ],
  exports: [
    CompleteComponent
  ]
  // providers: [FooterService],
})
export class CompleteModule { }