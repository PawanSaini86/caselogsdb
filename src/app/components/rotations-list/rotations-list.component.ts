import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserTypeSwitcherComponent } from '../user-type-switcher/user-type-switcher.component';


interface Rotation {
  id: number;
  rotation: string;
  discipline: string;
  preceptor: string;
  site: string;
  startDate: string;
  endDate: string;
  caseLogsCount: number;
}

@Component({
  selector: 'app-rotations-list',
  standalone: true,
  imports: [CommonModule,UserTypeSwitcherComponent],
  templateUrl: './rotations-list.component.html',
  styleUrls: ['./rotations-list.component.css']
})
export class RotationsListComponent {
  rotations: Rotation[] = [
    { 
      id: 1, 
      rotation: 'Rotation 1',
      discipline: 'Internal Medicine', 
      preceptor: 'Dr. Sarah Johnson', 
      site: 'City General Hospital',
      startDate: '09/01/2025', 
      endDate: '10/26/2025',
      caseLogsCount: 6
    },
    { 
      id: 2, 
      rotation: 'Rotation 2',
      discipline: 'Surgery', 
      preceptor: 'Dr. Michael Chen', 
      site: 'Memorial Medical Center',
      startDate: '10/28/2025', 
      endDate: '12/08/2025',
      caseLogsCount: 3
    },
    { 
      id: 3, 
      rotation: 'Rotation 3',
      discipline: 'Pediatrics', 
      preceptor: 'Dr. Emily Rodriguez', 
      site: 'Children\'s Hospital',
      startDate: '12/09/2025', 
      endDate: '01/19/2026',
      caseLogsCount: 0
    },
    { 
      id: 4, 
      rotation: 'Rotation 4',
      discipline: 'Family Medicine', 
      preceptor: 'Dr. James Wilson', 
      site: 'Community Health Center',
      startDate: '01/20/2026', 
      endDate: '03/06/2026',
      caseLogsCount: 0
    }
  ];

  constructor(private router: Router) {}

  viewRotation(rotationId: number) {
    this.router.navigate(['/case-logs', rotationId]);
  }

  addCaseLog(rotationId: number) {
    this.router.navigate(['/case-log', rotationId]);
  }
}
