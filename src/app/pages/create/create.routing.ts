import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from "./create.component";

export const routes:Routes = [
    {
      path:'create',
      component: CreateComponent
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
export class CreateRoutingModule { }