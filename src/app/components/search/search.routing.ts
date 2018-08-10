
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from "./search.component";

export const routes:Routes = [
    {
      path:'search',
      component: SearchComponent
    }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [],
})
export class SearchRoutingModule { }