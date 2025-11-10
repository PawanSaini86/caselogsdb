import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RotationDetails {
  rotnum: string;
  grade: string;
  notes: string;
  preceptorDetails: {
    id: number;
    firstName: string;
    lastName: string;
    title: string;
    degree: string;
    email: string;
    phone: string;
  };
  hospitalDetails: {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

export interface Rotation {
  id: number;
  rotation: string;
  discipline: string;
  preceptor: string;
  site: string;
  startDate: string;
  endDate: string;
  caseLogsCount: number;
  details?: RotationDetails;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RotationService {
  private apiUrl = environment.apiUrl;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get all rotations for a specific student with full details
   */
  getRotationsForStudent(studentId: number): Observable<Rotation[]> {
    return this.http.get<ApiResponse<Rotation[]>>(
      `${this.apiUrl}/rotations/student/${studentId}`
    ).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch rotations');
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get rotations summary (with case logs count) for a student
   */
  getRotationsSummary(studentId: number): Observable<Rotation[]> {
    return this.http.get<ApiResponse<Rotation[]>>(
      `${this.apiUrl}/students/${studentId}/rotations-summary`
    ).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch rotations summary');
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get case logs count for a specific rotation
   */
  getCaseLogsCount(rotationId: number): Observable<number> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/rotations/${rotationId}/case-logs/count`
    ).pipe(
      map(response => {
        if (response.success) {
          return response.count || 0;
        }
        throw new Error(response.error || 'Failed to fetch case logs count');
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Test database connection
   */
  testConnection(): Observable<boolean> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/test-connection`
    ).pipe(
      map(response => response.success),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Health check
   */
  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Handle HTTP errors (SSR-safe)
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    // SSR-safe error handling
    if (this.isBrowser && typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error or SSR environment
      if (error.status) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('RotationService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}