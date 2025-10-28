import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface CaseLog {
  id: number;
  rotationId: number;
  date: string;
  patientId: string;
  age: number;
  gender: string;
  diagnosis: string;
  procedures: string;
  clinicalSetting: string;
  approved: boolean;
  submittedDate: string;
}

interface Rotation {
  id: number;
  discipline: string;
  rotation: string;
}

@Component({
  selector: 'app-case-logs-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './case-logs-list.component.html',
  styleUrls: ['./case-logs-list.component.css']
})
export class CaseLogsListComponent implements OnInit {
  rotationId: string | null = null;
  rotation: Rotation | null = null;
  caseLogs: CaseLog[] = [];
  filteredLogs: CaseLog[] = [];
  filterStatus: string = 'all'; // 'all', 'approved', 'pending'

  // Mock data - replace with actual API calls
  rotations: Rotation[] = [
    { id: 1, discipline: 'Internal Medicine', rotation: 'Rotation 1' },
    { id: 2, discipline: 'Surgery', rotation: 'Rotation 2' },
    { id: 3, discipline: 'Pediatrics', rotation: 'Rotation 3' },
    { id: 4, discipline: 'Family Medicine', rotation: 'Rotation 4' }
  ];

  allCaseLogs: CaseLog[] = [
    {
      id: 1,
      rotationId: 1,
      date: '10/01/2025',
      patientId: 'PT-001234',
      age: 65,
      gender: 'Male',
      diagnosis: 'Hypertension, Type 2 Diabetes Mellitus',
      procedures: 'Physical Exam, BP Monitoring, Blood Glucose Testing',
      clinicalSetting: 'Outpatient',
      approved: true,
      submittedDate: '10/02/2025'
    },
    {
      id: 2,
      rotationId: 1,
      date: '10/02/2025',
      patientId: 'PT-001235',
      age: 45,
      gender: 'Female',
      diagnosis: 'Community Acquired Pneumonia',
      procedures: 'Chest X-ray Review, Antibiotic Prescription, Respiratory Assessment',
      clinicalSetting: 'Inpatient',
      approved: true,
      submittedDate: '10/03/2025'
    },
    {
      id: 3,
      rotationId: 1,
      date: '10/03/2025',
      patientId: 'PT-001236',
      age: 28,
      gender: 'Male',
      diagnosis: 'Acute Appendicitis',
      procedures: 'Abdominal Exam, Surgical Consultation, Pre-op Assessment',
      clinicalSetting: 'Emergency Department',
      approved: false,
      submittedDate: '10/04/2025'
    },
    {
      id: 4,
      rotationId: 1,
      date: '10/05/2025',
      patientId: 'PT-001237',
      age: 52,
      gender: 'Female',
      diagnosis: 'Gastroesophageal Reflux Disease (GERD)',
      procedures: 'History Taking, Lifestyle Counseling, Medication Management',
      clinicalSetting: 'Outpatient',
      approved: true,
      submittedDate: '10/06/2025'
    },
    {
      id: 5,
      rotationId: 1,
      date: '10/07/2025',
      patientId: 'PT-001238',
      age: 38,
      gender: 'Female',
      diagnosis: 'Migraine Headache',
      procedures: 'Neurological Exam, Pain Management, Patient Education',
      clinicalSetting: 'Outpatient',
      approved: true,
      submittedDate: '10/08/2025'
    },
    {
      id: 6,
      rotationId: 1,
      date: '10/08/2025',
      patientId: 'PT-001239',
      age: 72,
      gender: 'Female',
      diagnosis: 'Urinary Tract Infection',
      procedures: 'Urinalysis, Antibiotic Therapy, Follow-up Planning',
      clinicalSetting: 'Outpatient',
      approved: false,
      submittedDate: '10/09/2025'
    },
    {
      id: 7,
      rotationId: 2,
      date: '11/01/2025',
      patientId: 'PT-002001',
      age: 55,
      gender: 'Male',
      diagnosis: 'Cholecystitis',
      procedures: 'Laparoscopic Cholecystectomy (Assisted)',
      clinicalSetting: 'Operating Room',
      approved: true,
      submittedDate: '11/02/2025'
    },
    {
      id: 8,
      rotationId: 2,
      date: '11/03/2025',
      patientId: 'PT-002002',
      age: 42,
      gender: 'Male',
      diagnosis: 'Inguinal Hernia',
      procedures: 'Hernia Repair (Observed)',
      clinicalSetting: 'Operating Room',
      approved: true,
      submittedDate: '11/04/2025'
    },
    {
      id: 9,
      rotationId: 2,
      date: '11/05/2025',
      patientId: 'PT-002003',
      age: 68,
      gender: 'Female',
      diagnosis: 'Colon Cancer',
      procedures: 'Colonoscopy, Biopsy, Surgical Planning',
      clinicalSetting: 'Outpatient',
      approved: false,
      submittedDate: '11/06/2025'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.rotationId = this.route.snapshot.paramMap.get('rotationId');
    
    if (this.rotationId) {
      const rotId = parseInt(this.rotationId);
      this.rotation = this.rotations.find(r => r.id === rotId) || null;
      this.caseLogs = this.allCaseLogs.filter(log => log.rotationId === rotId);
      this.filteredLogs = this.caseLogs;
    }
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
    this.router.navigate(['/case-log-detail', logId]);
  }

  editCaseLog(logId: number) {
    this.router.navigate(['/case-log-edit', logId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addNewCaseLog() {
    this.router.navigate(['/case-log', this.rotationId]);
  }

  getApprovedCount(): number {
    return this.caseLogs.filter(log => log.approved).length;
  }

  getPendingCount(): number {
    return this.caseLogs.filter(log => !log.approved).length;
  }
}
