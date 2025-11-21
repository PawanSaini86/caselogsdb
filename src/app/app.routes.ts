import { Routes } from '@angular/router';
import { RotationsListComponent } from './components/rotations-list/rotations-list.component';
import { CaseLogFormComponent } from './components/case-log-form/case-log-form.component';
import { CaseLogsListComponent } from './components/case-logs-list/case-logs-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/rotations', pathMatch: 'full' },
  { path: 'rotations', component: RotationsListComponent },
  
  // VIEW case logs for a rotation (THIS WAS MISSING!)
  { path: 'case-logs/:rotationId', component: CaseLogsListComponent },
  
  // ADD new case log
  { path: 'case-log/:rotationId', component: CaseLogFormComponent },
  
  { path: '**', redirectTo: '/rotations' }
];