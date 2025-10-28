import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseLogFormComponent } from './components/case-log-form/case-log-form.component';

const routes: Routes = [
  { path: '', component: CaseLogFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
