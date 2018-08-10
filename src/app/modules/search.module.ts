import { NgModule } from '@angular/core';
import { SearchComponent } from "../components/search/search.component";
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from "../components/search/search.routing"

@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    SearchRoutingModule
  ],
  exports: [
    SearchComponent
  ]
  // providers: [FooterService],
})
export class searchModule { }