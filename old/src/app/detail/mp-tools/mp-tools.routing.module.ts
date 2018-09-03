import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TuiwenComponent } from './containers/tuiwen/tuiwen.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tuiwen',
      },
      {
        path: 'tuiwen',
        component: TuiwenComponent,
      },
      {
        path: '**',
        redirectTo: 'tuiwen',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class MpToolsRoutingModule {}
