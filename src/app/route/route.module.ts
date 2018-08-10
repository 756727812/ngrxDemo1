import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonService } from '../service/common.service';
import { RegisterComponentComponent } from '../pages/register-component/register-component.component';

export const routes:Routes = [
  {
    path:'',
    redirectTo:'/home',
    pathMatch:'full'
  },
  {
    path:"register",
    component: RegisterComponentComponent
  },
  // {
  //   path:'test',
  //   loadChildren: "../modules/footer.module#footModule"
  // },
  {
    path:'',
    loadChildren: "../pages/home/home.module#HomeModule"
  },
  {
    path:'',
    loadChildren: "../pages/create/create.module#CreateModule"
  },
  {
    path:'',
    loadChildren: "../pages/complete/complete.module#CompleteModule"
  },
  {
      path:'',
      loadChildren: "../modules/search.module#searchModule"
    },
    {
      path:'**',
      redirectTo: '',
      pathMatch:'full'
    }
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [CommonService],
})
export class AppRoutingModule { }