import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RotationService, Rotation, CaseLog } from '../../services/rotation.service';

interface CaseLogDisplay {
  id: number;
  rotationId: number;
  date: string;
  status: string;
  approved: boolean;
  submittedDate: string;
  // Extracted from caseData
  patientType?: string;
  diagnosis?: string;
  procedures?: string;
  clinicalSetting?: string;
  studentRole?: string;
}

@Component({
  selector: 'app-case-logs-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-logs-list.component.html',
  styleUrls: ['./case-logs-list.component.css']
})
export class CaseLogsListComponent implements OnInit {
  rotationId: number | null = null;
  rotation: Rotation | null = null;
  caseLogs: CaseLogDisplay[] = [];
  filteredLogs: CaseLogDisplay[] = [];
  filterStatus: string = 'all';
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rotationService: RotationService
  ) {}

  ngOnInit() {
    const rotationIdParam = this.route.snapshot.paramMap.get('rotationId');
    
    if (rotationIdParam) {
      this.rotationId = parseInt(rotationIdParam);
      console.log('📋 Loading case logs for rotation:', this.rotationId);
      
      this.loadRotation();
      this.loadCaseLogs();
    }
  }

  loadRotation() {
    if (!this.rotationId) return;
    
    this.rotationService.getRotation(this.rotationId).subscribe({
      next: (rotation) => {
        console.log('✅ Rotation loaded:', rotation);
        this.rotation = rotation;
      },
      error: (error) => {
        console.error('❌ Error loading rotation:', error);
      }
    });
  }

  loadCaseLogs() {
    if (!this.rotationId) return;
    
    this.loading = true;
    this.error = null;
    
    console.log('📡 Fetching case logs from API for rotation:', this.rotationId);
    
    this.rotationService.getCaseLogsForRotation(this.rotationId).subscribe({
      next: (logs: CaseLog[]) => {
        console.log('✅ Case logs loaded:', logs);
        
        this.caseLogs = logs.map(log => this.transformCaseLog(log));
        this.filteredLogs = this.caseLogs;
        this.loading = false;
        
        console.log('📊 Transformed case logs:', this.caseLogs);
      },
      error: (error) => {
        console.error('❌ Error loading case logs:', error);
        this.error = `Failed to load case logs: ${error.message}`;
        this.loading = false;
        
        if (error.message.includes('404')) {
          this.error = 'Case logs not found. Please add a case log first.';
        } else if (error.message.includes('0')) {
          this.error = 'Cannot connect to backend. Is the server running?';
        }
      }
    });
  }

  transformCaseLog(log: CaseLog): CaseLogDisplay {
    let caseData: any = {};
    
    if (log.caseData) {
      if (typeof log.caseData === 'string') {
        try {
          caseData = JSON.parse(log.caseData);
        } catch (e) {
          console.warn('Could not parse caseData for log', log.id);
        }
      } else {
        caseData = log.caseData;
      }
    }
    
    const submission = caseData.submission?.data || caseData;
    
    return {
      id: log.id,
      rotationId: log.rotationId,
      date: this.formatDate(log.caseDate),
      status: log.status || 'DRAFT',
      approved: log.status === 'APPROVED',
      submittedDate: this.formatDate(log.createdDate || log.caseDate),
      
      patientType: this.formatLabel(submission.patientType || 'N/A'),
      diagnosis: this.formatDiagnosis(submission),
      procedures: this.formatProcedures(submission),
      clinicalSetting: this.formatLabel(submission.setting || 'N/A'),
      studentRole: this.formatLabel(submission.studentRole || 'N/A')
    };
  }

  formatDiagnosis(data: any): string {
    const diagnoses = [];
    
    if (data.diagnosis1) {
      diagnoses.push(this.formatLabel(data.diagnosis1));
    }
    if (data.diagnosis2) {
      diagnoses.push(this.formatLabel(data.diagnosis2));
    }
    if (data.diagnosis3) {
      diagnoses.push(this.formatLabel(data.diagnosis3));
    }
    
    return diagnoses.length > 0 ? diagnoses.join(', ') : 'No diagnosis recorded';
  }

  formatProcedures(data: any): string {
    const procedures = [];
    
    if (data.procedure1) {
      procedures.push(this.formatLabel(data.procedure1));
    }
    if (data.procedure2) {
      procedures.push(this.formatLabel(data.procedure2));
    }
    if (data.procedure3) {
      procedures.push(this.formatLabel(data.procedure3));
    }
    
    return procedures.length > 0 ? procedures.join(', ') : 'No procedures recorded';
  }

  formatLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    
    if (dateString.includes('/')) return dateString;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  }

  // Truncate long text for inline display
  truncate(text: string | undefined, maxLength: number): string {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  filterLogs(status: string) {
    this.filterStatus = status;
    
    if (status === 'all') {
      this.filteredLogs = this.caseLogs;
    } else if (status === 'approved') {
      this.filteredLogs = this.caseLogs.filter(log => log.approved);
    } else if (status === 'pending') {
      this.filteredLogs = this.caseLogs.filter(log => !log.approved);
    }
  }

  viewCaseLog(logId: number) {
    console.log('👁️ Viewing case log:', logId);
    this.router.navigate(['/case-log-detail', logId]);
  }

  editCaseLog(logId: number) {
    console.log('✏️ Editing case log:', logId);
    this.router.navigate(['/case-log-edit', logId]);
  }

  goBack() {
    this.router.navigate(['/rotations']);
  }

  addNewCaseLog() {
    if (this.rotationId) {
      this.router.navigate(['/case-log', this.rotationId]);
    }
  }

  getApprovedCount(): number {
    return this.caseLogs.filter(log => log.approved).length;
  }

  getPendingCount(): number {
    return this.caseLogs.filter(log => !log.approved).length;
  }

  retry() {
    console.log('🔄 Retrying to load case logs...');
    this.loadCaseLogs();
  }
}