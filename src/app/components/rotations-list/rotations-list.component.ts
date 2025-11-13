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
  studentId: number = 522; 
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private rotationService: RotationService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    console.log('🔍 Loading rotations for student:', this.studentId);
    this.loadRotations();
  }

  loadRotations() {
    this.loading = true;
    this.error = null;

    console.log('📡 Calling API: /api/students/522/rotations-summary');
    
    this.rotationService.getRotationsSummary(this.studentId).subscribe({
      next: (data) => {
        console.log('✅ Rotations loaded successfully:', data);
        this.rotations = data;
        this.loading = false;
        
        if (data.length === 0) {
          console.warn('⚠️ No rotations found for student 522');
          this.error = 'No rotations found. Please run the SQL script to add rotations.';
        }
      },
      error: (error) => {
        console.error('❌ Error loading rotations:', error);
        this.error = `Failed to load rotations: ${error.message}`;
        this.loading = false;
        
        // Show helpful error message
        if (error.message.includes('404')) {
          this.error = 'API endpoint not found. Make sure backend server is running.';
        } else if (error.message.includes('0')) {
          this.error = 'Cannot connect to backend. Is the server running on http://localhost:3000?';
        }
      }
    });
  }

  viewRotation(rotationId: number) {
    console.log('Viewing logs for rotation:', rotationId);
    this.router.navigate(['/case-logs', rotationId]);
  }

  addCaseLog(rotationId: number) {
    console.log('Adding case log for rotation:', rotationId);
    this.router.navigate(['/case-log', rotationId]);
  }

  // Format date to MM/DD/YYYY
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  }

  // Get hospital display name
  getHospitalName(rotation: Rotation): string {
    if (rotation.hospital && rotation.hospital.name) {
      return rotation.hospital.name;
    }
    return 'No Hospital Assigned';
  }

  // Get hospital location
  getHospitalLocation(rotation: Rotation): string {
    if (rotation.hospital && rotation.hospital.city && rotation.hospital.state) {
      return `${rotation.hospital.city}, ${rotation.hospital.state}`;
    }
    return '';
  }

  // Get preceptor display name
  getPreceptorName(rotation: Rotation): string {
    if (rotation.preceptor && rotation.preceptor.name) {
      return rotation.preceptor.name;
    }
    return 'No Preceptor Assigned';
  }

  // Get preceptor credentials
  getPreceptorCredentials(rotation: Rotation): string {
    if (rotation.preceptor && rotation.preceptor.degree) {
      return rotation.preceptor.degree;
    }
    return '';
  }

  // Check if hospital info exists
  hasHospitalInfo(rotation: Rotation): boolean {
    return !!(rotation.hospital && rotation.hospital.name);
  }

  // Check if preceptor info exists
  hasPreceptorInfo(rotation: Rotation): boolean {
    return !!(rotation.preceptor && rotation.preceptor.name);
  }

  // Retry loading rotations
  retry() {
    console.log('🔄 Retrying to load rotations...');
    this.loadRotations();
  }
}