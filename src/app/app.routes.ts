import { Routes } from '@angular/router';
import { RotationsListComponent } from './components/rotations-list/rotations-list.component';
import { CaseLogFormComponent } from './components/case-log-form/case-log-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/rotations', pathMatch: 'full' },
  { path: 'rotations', component: RotationsListComponent },
  
  { path: 'case-log/:rotationId', component: CaseLogFormComponent },
  
  { path: '**', redirectTo: '/rotations' }
];