import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateComponent } from "./create.component";
import { CreateRoutingModule } from "./create.routing";
import { TagShapeComponent } from './tag-shape/tag-shape.component';
import { TagTextComponent } from './tag-text/tag-text.component';
import { TagExtrasComponent } from './tag-extras/tag-extras.component';
import { TagPreviewComponent } from './tag-preview/tag-preview.component';

@NgModule({
  declarations: [
    CreateComponent,
    TagShapeComponent,
    TagTextComponent,
    TagExtrasComponent,
    TagPreviewComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    // ReactiveFormsModule,
    CreateRoutingModule
  ],
  exports: [
    CreateComponent,
    TagPreviewComponent // 导出组件其他地方才能用
  ]
  // providers: [FooterService],
})
export class CreateModule { }