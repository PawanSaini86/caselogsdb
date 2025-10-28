import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormioModule } from '@formio/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CaseLogFormComponent } from './components/case-log-form/case-log-form.component';

@NgModule({
  declarations: [
    AppComponent,
    CaseLogFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormioModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }