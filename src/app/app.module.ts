import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AppRoutingModule } from "./route/route.module";
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

// import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RegisterComponentComponent } from './pages/register-component/register-component.component';


import { StoreModule } from '@ngrx/store';
import { petTagReducer } from './core/pet-tag.reducer';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponentComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule,
    // StoreModule.provideStore({ petTag: petTagReducer }),
    //In the latest version of Ngrx the provideStore changed to forRoot.
    StoreModule.forRoot({ petTag: petTagReducer }),
    // NgZorroAntdModule.forRoot()
  ],
  exports:[CommonModule],
  // providers: [FooterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
