import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CanDeactivateGuard } from '@shared/guards';
import { BiAdminComponent } from '../bi/containers';
import { BenefitListComponent } from './containers/benefit-list/benefit-list.component';
import { BenefitAddComponent } from './containers/benefit-add/benefit-add.component';
import { BenefitDetailComponent } from './containers/benefit-detail/benefit-detail.component';
import { BenefitEditComponent } from './containers/benefit-edit/benefit-edit.component';
import { BenefitGoodGroupComponent } from './containers/group-info/goods-group.component';
import { BenefitGuard } from './guards/benefit.gurard';
import { BenefitCanDeactiveGuard } from './guards/deactive.guard';

export const routes: Routes = [
  {
    path:"",
    pathMatch:"full",
    redirectTo:"center",
  },
  {
    path:"center",
    data:{
      from:"center",
    },
    canActivate:[BenefitGuard],
    children: [
      {
        path:'',
        pathMatch:'full',
        redirectTo:'benefit-list',
      },
      {
        path: 'benefit-list',
        component: BenefitListComponent
      },
      {
        path: 'benefit-add',
        component: BenefitAddComponent,
        canDeactivate:[BenefitCanDeactiveGuard]
      },
      {
        path:'benefit-edit',
        component:BenefitEditComponent
      },
      {
        path:'benefit-detail',
        component:BenefitDetailComponent
      },
      {
        path:'goods-group',
        component:BenefitGoodGroupComponent
      },
      {
        path:'**',
        redirectTo:'benefit-list'
      }
    ]
  },
  {
    path: 'v2/:kolId/:wechatId/:xpdId',
    data:{
      from:"v2",
    },
    canActivate:[BenefitGuard],
    children: [
      {
        path:'',
        pathMatch:'full',
        redirectTo:'benefit-list',
      },
      {
        path: 'benefit-list',
        component: BenefitListComponent
      },
      {
        path: 'benefit-add',
        component: BenefitAddComponent,
        canDeactivate:[BenefitCanDeactiveGuard]
      },
      {
        path:'benefit-edit',
        component:BenefitEditComponent
      },
      {
        path:'benefit-detail',
        component:BenefitDetailComponent
      },
      {
        path:'goods-group',
        component:BenefitGoodGroupComponent
      },
      {
        path:'**',
        redirectTo:'benefit-list'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers:[BenefitGuard,BenefitCanDeactiveGuard]
})
export class BenefitRoutingModule {}
