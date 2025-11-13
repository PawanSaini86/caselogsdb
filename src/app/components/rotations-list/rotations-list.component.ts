import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { RotationService, Rotation } from '../../services/rotation.service';

// Try to import environment, fallback if not available
let environment: any;
try {
  environment = require('../../../environments/environment').environment;
} catch (e) {
  // Fallback if environment file doesn't exist
  environment = {
    production: false,
    apiUrl: 'http://localhost:3000/api',
    studentId: 522
  };
}

@Component({
  selector: 'app-rotations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rotations-list.component.html',
  styleUrls: ['./rotations-list.component.css']
})
export class RotationsListComponent implements OnInit {
  rotations: Rotation[] = [];
  loading: boolean = false;
  error: string | null = null;
  studentId: number = environment?.studentId || 522;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private rotationService: RotationService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    
    this.loadRotations();
    this.studentId = 522;
  }
  loadRotations() {
    this.loading = true;
    this.error = null;

    this.rotationService.getRotationsSummary(this.studentId).subscribe({
      next: (data) => {
        this.rotations = data;
        this.loading = false;
        console.log('Rotations loaded:', data);
      },
      error: (error) => {
        console.error('Error loading rotations:', error);
        this.error = 'Failed to load rotations. Please try again.';
        this.loading = false;
        
        // Fallback to mock data if API fails (for development)
        if (!environment?.production) {
          console.warn('Using mock data due to API error');
          this.loadMockData();
        }
      }
    });
  }

  // Fallback mock data for development
  loadMockData() {
      this.rotations = [
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
        }
      ];
  }

  viewRotation(rotationId: number) {
    this.router.navigate(['/case-logs', rotationId]);
  }

  addCaseLog(rotationId: number) {
  console.log('Navigating to case log form for rotation:', rotationId);
  this.router.navigate(['/case-log', rotationId]);
  }

  // Retry loading rotations
  retry() {
    this.loadRotations();
  }
}