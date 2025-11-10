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
  userType: 'vet' | 'medical' = 'medical';
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
    this.loadUserType();
    this.loadRotations();
  }

  loadUserType() {
    // Only access localStorage in browser
    if (this.isBrowser) {
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

    // For demo: set student ID based on user type
    // In production, this should come from authentication
    if (this.userType === 'vet') {
      this.studentId = 522; // Vet student ID from database
    } else {
      this.studentId = 522; // Medical student ID
    }
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
    if (this.userType === 'vet') {
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
    } else {
      this.rotations = [
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
        }
      ];
    }
  }

  switchUserType(type: 'vet' | 'medical') {
    this.userType = type;
    
    // Only access localStorage in browser
    if (this.isBrowser) {
      localStorage.setItem('userType', type);
    }
    
    this.loadRotations();
  }

  viewRotation(rotationId: number) {
    this.router.navigate(['/case-logs', rotationId]);
  }

  addCaseLog(rotationId: number) {
    this.router.navigate(['/case-log', rotationId]);
  }

  // Retry loading rotations
  retry() {
    this.loadRotations();
  }
}