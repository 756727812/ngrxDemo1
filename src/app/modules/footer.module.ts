
import { NgModule } from '@angular/core';
import { FooterComponent } from "../components/footer/footer";
import { CommonModule } from '@angular/common';
console.log(FooterComponent);
@NgModule({
  declarations: [
    FooterComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FooterComponent
  ]
})
export class footModule { }