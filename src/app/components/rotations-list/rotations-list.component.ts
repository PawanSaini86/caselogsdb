import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  imports: [CommonModule],
  templateUrl: './rotations-list.component.html',
  styleUrls: ['./rotations-list.component.css']
})
export class RotationsListComponent implements OnInit {
  userType: 'vet' | 'medical' = 'medical';
  rotations: Rotation[] = [];

  // Medical rotations
  medicalRotations: Rotation[] = [
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

  // Veterinary rotations
  vetRotations: Rotation[] = [
    { 
      id: 101, 
      rotation: 'CVM 7533',
      discipline: 'Small Animal Medicine', 
      preceptor: 'Dr. Jennifer Martinez, DVM', 
      site: 'Veterinary Teaching Hospital',
      startDate: '09/01/2025', 
      endDate: '10/12/2025',
      caseLogsCount: 8
    },
    { 
      id: 102, 
      rotation: 'CVM 7534',
      discipline: 'Large Animal Surgery', 
      preceptor: 'Dr. Robert Thompson, DVM', 
      site: 'Equine Medical Center',
      startDate: '10/14/2025', 
      endDate: '11/25/2025',
      caseLogsCount: 5
    },
    { 
      id: 103, 
      rotation: 'CVM 7535',
      discipline: 'Emergency & Critical Care', 
      preceptor: 'Dr. Lisa Chang, DVM, DACVECC', 
      site: '24-Hour Emergency Animal Hospital',
      startDate: '11/27/2025', 
      endDate: '01/08/2026',
      caseLogsCount: 12
    },
    { 
      id: 104, 
      rotation: 'CVM 7536',
      discipline: 'Exotic Animal Medicine', 
      preceptor: 'Dr. David Parker, DVM', 
      site: 'Wildlife and Exotic Animal Clinic',
      startDate: '01/10/2026', 
      endDate: '02/20/2026',
      caseLogsCount: 3
    },
    { 
      id: 105, 
      rotation: 'CVM 7537',
      discipline: 'Veterinary Anesthesia', 
      preceptor: 'Dr. Amanda Foster, DVM, DACVAA', 
      site: 'Veterinary Specialty Center',
      startDate: '02/22/2026', 
      endDate: '04/05/2026',
      caseLogsCount: 0
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUserType();
    this.loadRotations();
  }

  loadUserType() {
    // Check localStorage first
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType === 'vet' || storedUserType === 'medical') {
      this.userType = storedUserType as 'vet' | 'medical';
    }
    
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('userType') === 'vet') {
      this.userType = 'vet';
      localStorage.setItem('userType', 'vet');
    } else if (urlParams.get('userType') === 'medical') {
      this.userType = 'medical';
      localStorage.setItem('userType', 'medical');
    }
  }

  loadRotations() {
    if (this.userType === 'vet') {
      this.rotations = this.vetRotations;
    } else {
      this.rotations = this.medicalRotations;
    }
  }

  switchUserType(type: 'vet' | 'medical') {
    this.userType = type;
    localStorage.setItem('userType', type);
    this.loadRotations();
  }

  viewRotation(rotationId: number) {
    this.router.navigate(['/case-logs', rotationId]);
  }

  addCaseLog(rotationId: number) {
    this.router.navigate(['/case-log', rotationId]);
  }
}
