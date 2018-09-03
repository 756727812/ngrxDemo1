import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {
  TemplateMsgListComponent,
  TemplateMsgFormComponent,
} from './containers';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'template-msg-list',
  },
  {
    path: 'template-msg-list',
    component: TemplateMsgListComponent,
  },
  {
    path: 'template-msg-form',
    component: TemplateMsgFormComponent,
  },
  {
    path: '**',
    redirectTo: 'template-msg-list',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemplateMessageRoutingModule {}
