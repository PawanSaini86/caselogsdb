import { Routes } from '@angular/router';
import { RotationsListComponent } from './components/rotations-list/rotations-list.component';
import { CaseLogFormComponent } from './components/case-log-form/case-log-form.component';
import { CaseLogsListComponent } from './components/case-logs-list/case-logs-list.component';

export const routes: Routes = [
  { path: '', component: RotationsListComponent },
  { path: 'case-log/:rotationId', component: CaseLogFormComponent },
  { path: 'case-logs/:rotationId', component: CaseLogsListComponent },
  { path: 'rotation/:id', component: RotationsListComponent }
];
