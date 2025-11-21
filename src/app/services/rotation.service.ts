import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Hospital interface
export interface Hospital {
  id?: number;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Preceptor interface
export interface Preceptor {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  degree?: string;
  email?: string;
  phone?: string;
  contact?: string;
}

// Rotation interface with hospital and preceptor
export interface Rotation {
  id: number;
  rotationNumber: number;
  startDate: string;
  endDate: string;
  studentId: number;
  hospitalId?: number;
  preceptorId?: number;
  notes?: string;
  discipline?: string;
  caseLogCount?: number;
  hospital?: Hospital;
  preceptor?: Preceptor;
}

// Case Log interface
export interface CaseLog {
  id: number;
  rotationId: number;
  studentId: number;
  caseDate: string;
  status: string;
  createdDate?: string;
  modifiedDate?: string;
  caseData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class RotationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Get rotations summary for a student (with hospital and preceptor details)
  getRotationsSummary(studentId: number): Observable<Rotation[]> {
    console.log('🌐 RotationService: Fetching rotations for student', studentId);
    
    return this.http.get<any>(`${this.apiUrl}/students/${studentId}/rotations-summary`).pipe(
      map(response => {
        console.log('📦 RotationService: Raw API response:', response);
        
        // Handle both direct array response and wrapped response
        const rotations = Array.isArray(response) ? response : response.data || [];
        
        console.log('📊 RotationService: Processing', rotations.length, 'rotations');
        
        // Transform the data to ensure hospital and preceptor objects exist
        const transformed = rotations.map((rotation: any) => {
          const hospital = this.extractHospitalData(rotation);
          const preceptor = this.extractPreceptorData(rotation);
          
          console.log('🔍 Rotation', rotation.id || rotation.ID, ':', {
            hospital: hospital ? hospital.name : 'NOT FOUND',
            preceptor: preceptor ? preceptor.name : 'NOT FOUND',
            rawData: {
              hospital: rotation.hospital,
              preceptorFullName: rotation.preceptorFullName
            }
          });
          
          return {
            id: rotation.id || rotation.ID,
            rotationNumber: rotation.rotationNumber || rotation.ROTNUM,
            startDate: rotation.startDate || rotation.STARTING,
            endDate: rotation.endDate || rotation.ENDING,
            studentId: rotation.studentId || rotation.STUDID,
            hospitalId: rotation.hospitalId || rotation.HOSPID,
            preceptorId: rotation.preceptorId || rotation.PRECID,
            notes: rotation.notes || rotation.NOTES,
            discipline: rotation.discipline,
            caseLogCount: rotation.caseLogCount !== undefined ? rotation.caseLogCount : 0,
            hospital: hospital,
            preceptor: preceptor
          };
        });
        
        console.log('✅ RotationService: Transformed rotations:', transformed);
        return transformed;
      })
    );
  }

  // Extract hospital data from rotation response
  private extractHospitalData(rotation: any): Hospital | undefined {
    // Check if hospital object exists (nested structure)
    if (rotation.hospital && typeof rotation.hospital === 'object') {
      return {
        id: rotation.hospital.id,
        name: rotation.hospital.name || 'Unknown Hospital',
        city: rotation.hospital.city,
        state: rotation.hospital.state,
        address: rotation.hospital.address,
        phone: rotation.hospital.phone,
        email: rotation.hospital.email
      };
    }
    
    // Check for flat structure with 'hospital' as string (YOUR API FORMAT)
    if (rotation.hospital && typeof rotation.hospital === 'string') {
      return {
        id: rotation.hospitalId,
        name: rotation.hospital,
        city: rotation.hospitalCity,
        state: rotation.hospitalState
      };
    }
    
    // Check for HOSPITAL_NAME format (uppercase)
    if (rotation.HOSPITAL_NAME) {
      return {
        id: rotation.HOSPID || rotation.hospitalId,
        name: rotation.HOSPITAL_NAME,
        city: rotation.HOSPITAL_CITY,
        state: rotation.HOSPITAL_STATE,
        phone: rotation.HOSPITAL_PHONE,
        email: rotation.HOSPITAL_EMAIL
      };
    }
    
    // Check for hospitalName format (camelCase)
    if (rotation.hospitalName) {
      return {
        id: rotation.hospitalId,
        name: rotation.hospitalName,
        city: rotation.hospitalCity,
        state: rotation.hospitalState
      };
    }
    
    return undefined;
  }

  // Extract preceptor data from rotation response
  private extractPreceptorData(rotation: any): Preceptor | undefined {
    // Check if preceptor object exists (nested structure)
    if (rotation.preceptor && typeof rotation.preceptor === 'object') {
      return {
        id: rotation.preceptor.id,
        name: rotation.preceptor.name || rotation.preceptor.fullName || 'Unknown Preceptor',
        firstName: rotation.preceptor.firstName,
        lastName: rotation.preceptor.lastName,
        title: rotation.preceptor.title,
        degree: rotation.preceptor.degree,
        email: rotation.preceptor.email,
        phone: rotation.preceptor.phone,
        contact: rotation.preceptor.contact
      };
    }
    
    // Check for flat structure with preceptorFullName (YOUR API FORMAT)
    if (rotation.preceptorFullName) {
      return {
        id: rotation.preceptorId,
        name: rotation.preceptorFullName,
        firstName: rotation.preceptorFirstName,
        lastName: rotation.preceptorLastName,
        title: rotation.preceptorTitle,
        degree: rotation.preceptorDegree,
        email: rotation.preceptorEmail,
        phone: rotation.preceptorPhone || rotation.preceptorPhone1,
        contact: rotation.preceptorContact
      };
    }
    
    // Fallback: construct name from first and last name
    if (rotation.preceptorFirstName && rotation.preceptorLastName) {
      return {
        id: rotation.preceptorId,
        name: `${rotation.preceptorFirstName} ${rotation.preceptorLastName}`,
        firstName: rotation.preceptorFirstName,
        lastName: rotation.preceptorLastName,
        title: rotation.preceptorTitle,
        degree: rotation.preceptorDegree,
        email: rotation.preceptorEmail,
        phone: rotation.preceptorPhone
      };
    }
    
    // Check for PRECEPTOR_NAME format (uppercase)
    if (rotation.PRECEPTOR_NAME) {
      return {
        id: rotation.PRECID || rotation.preceptorId,
        name: rotation.PRECEPTOR_NAME,
        firstName: rotation.PRECEPTOR_FIRSTNAME,
        lastName: rotation.PRECEPTOR_LASTNAME,
        title: rotation.PRECEPTOR_TITLE,
        degree: rotation.PRECEPTOR_DEGREE,
        email: rotation.PRECEPTOR_EMAIL,
        phone: rotation.PRECEPTOR_PHONE || rotation.PRECEPTOR_PHONE1,
        contact: rotation.PRECEPTOR_CONTACT
      };
    }
    
    return undefined;
  }

  // Get single rotation by ID
  getRotation(rotationId: number): Observable<Rotation> {
    return this.http.get<any>(`${this.apiUrl}/rotations/${rotationId}`).pipe(
      map(response => response.data || response)
    );
  }

  // Create new rotation
  createRotation(rotation: Partial<Rotation>): Observable<Rotation> {
    return this.http.post<Rotation>(`${this.apiUrl}/rotations`, rotation);
  }

  // Update rotation
  updateRotation(rotationId: number, rotation: Partial<Rotation>): Observable<Rotation> {
    return this.http.put<Rotation>(`${this.apiUrl}/rotations/${rotationId}`, rotation);
  }

  // Delete rotation
  deleteRotation(rotationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rotations/${rotationId}`);
  }

  // ============================================
  // CASE LOG METHODS
  // ============================================

  // Get case logs for a rotation
  getCaseLogsForRotation(rotationId: number): Observable<CaseLog[]> {
    console.log('🌐 RotationService: Fetching case logs for rotation', rotationId);
    return this.http.get<any>(`${this.apiUrl}/rotations/${rotationId}/case-logs`).pipe(
      map(response => {
        console.log('📦 RotationService: Case logs response:', response);
        const caseLogs = response.data || [];
        
        // Transform to CaseLog interface
        return caseLogs.map((log: any) => ({
          id: log.id || log.ID,
          rotationId: log.rotationId || log.ROTID,
          studentId: log.studentId || log.STUDID,
          caseDate: log.caseDate || log.CASE_DATE,
          status: log.status || log.STATUS,
          createdDate: log.createdDate || log.CREATED_DATE,
          modifiedDate: log.modifiedDate || log.MODIFIED_DATE,
          caseData: log.caseData || log.CASE_DATA
        }));
      })
    );
  }

  // Get all case logs for a student
  getAllCaseLogsForStudent(studentId: number): Observable<CaseLog[]> {
    console.log('🌐 RotationService: Fetching all case logs for student', studentId);
    return this.http.get<any>(`${this.apiUrl}/students/${studentId}/case-logs`).pipe(
      map(response => {
        console.log('📦 RotationService: Case logs response:', response);
        const caseLogs = response.data || [];
        
        return caseLogs.map((log: any) => ({
          id: log.id || log.ID,
          rotationId: log.rotationId || log.ROTID,
          studentId: log.studentId || log.STUDID,
          caseDate: log.caseDate || log.CASE_DATE,
          status: log.status || log.STATUS,
          createdDate: log.createdDate || log.CREATED_DATE,
          modifiedDate: log.modifiedDate || log.MODIFIED_DATE,
          caseData: log.caseData || log.CASE_DATA
        }));
      })
    );
  }

  // Get single case log by ID
  getCaseLog(caseLogId: number): Observable<CaseLog> {
    console.log('🌐 RotationService: Fetching case log', caseLogId);
    return this.http.get<any>(`${this.apiUrl}/case-logs/${caseLogId}`).pipe(
      map(response => {
        console.log('📦 RotationService: Case log response:', response);
        const log = response.data || response;
        
        return {
          id: log.id || log.ID,
          rotationId: log.rotationId || log.ROTID,
          studentId: log.studentId || log.STUDID,
          caseDate: log.caseDate || log.CASE_DATE,
          status: log.status || log.STATUS,
          createdDate: log.createdDate || log.CREATED_DATE,
          modifiedDate: log.modifiedDate || log.MODIFIED_DATE,
          caseData: log.caseData || log.CASE_DATA
        };
      })
    );
  }

  // Create new case log
  createCaseLog(caseLog: Partial<CaseLog>): Observable<CaseLog> {
    console.log('🌐 RotationService: Creating case log', caseLog);
    return this.http.post<any>(`${this.apiUrl}/case-logs`, caseLog).pipe(
      map(response => response.data || response)
    );
  }

  // Update case log
  updateCaseLog(caseLogId: number, caseLog: Partial<CaseLog>): Observable<CaseLog> {
    console.log('🌐 RotationService: Updating case log', caseLogId);
    return this.http.put<any>(`${this.apiUrl}/case-logs/${caseLogId}`, caseLog).pipe(
      map(response => response.data || response)
    );
  }

  // Delete case log
  deleteCaseLog(caseLogId: number): Observable<void> {
    console.log('🌐 RotationService: Deleting case log', caseLogId);
    return this.http.delete<void>(`${this.apiUrl}/case-logs/${caseLogId}`);
  }
}