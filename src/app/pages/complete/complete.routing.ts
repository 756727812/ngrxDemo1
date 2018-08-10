import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompleteComponent } from "./complete.component";

export const routes:Routes = [
    {
      path:'complete',
      component: CompleteComponent
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
export class CompleteRoutingModule { }