import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var Formio: any;

@Component({
  selector: 'app-case-log-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-log-form.component.html',
  styleUrls: ['./case-log-form.component.css']
})
export class CaseLogFormComponent implements OnInit, AfterViewInit {
  @ViewChild('formioContainer', { static: false }) formioContainer!: ElementRef;
  rotationId: string | null = null;
  
  // User type - in real app, get from authentication service
  // Default to 'medical' for healthcare students
  // Set to 'vet' for veterinary students
  userType: 'vet' | 'medical' = 'medical';
  
  // Form data for vet form
  formData = {
    activityType: 'Single Patient Encounter',
    date: '',
    location: '',
    setting: '',
    studentRole: '',
    patientType: '',
    speciesGroup: '',
    primaryBodySystem: '',
    description: '',
    isHospitalized: false,
    daysHospitalized: ''
  };
  
  maxCharacters = 4000;
  
  // Dropdown options for vet form
  locations = ['1. Third-party clinical site (preceptor oversight)', '2. University clinic', '3. Field service'];
  settings = ['Inpatient', 'Outpatient', 'Emergency', 'Surgery'];
  studentRoles = ['Primary', 'Assisting', 'Observing'];
  patientTypes = ['Canine', 'Feline', 'Equine', 'Bovine', 'Avian', 'Exotic'];
  bodySystems = ['Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Neurological', 'Musculoskeletal', 'Integumentary', 'Urogenital', 'Endocrine'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    this.formData.date = today;
  }

  ngOnInit() {
    this.rotationId = this.route.snapshot.paramMap.get('rotationId');
    
    // IMPORTANT: In real application, get user type from authentication service
    // Example:
    // this.userType = this.authService.getUserType();
    
    // For demonstration/testing purposes:
    // Check URL parameter to switch between user types
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('userType') === 'vet') {
      this.userType = 'vet';
    }
    
    // OR: Check localStorage for demo
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType === 'vet' || storedUserType === 'medical') {
      this.userType = storedUserType as 'vet' | 'medical';
    }
  }

  ngAfterViewInit() {
    // Only initialize Form.io for medical users
    if (this.userType === 'medical') {
      setTimeout(() => {
        this.createMedicalForm();
      }, 500);
    }
  }

  get remainingCharacters(): number {
    return this.maxCharacters - this.formData.description.length;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Vet form actions
  handleSave() {
    console.log('Vet Form - Save clicked', this.formData);
    alert('Veterinary Case Log Saved!');
  }

  handleSaveAndNew() {
    console.log('Vet Form - Save and New clicked', this.formData);
    alert('Veterinary Case Log Saved! Creating new...');
    this.resetForm();
  }

  handleSaveAndDuplicate() {
    console.log('Vet Form - Save and Duplicate clicked', this.formData);
    alert('Veterinary Case Log Saved and Duplicated!');
  }

  handleDownloadPDF() {
    console.log('Vet Form - Download PDF clicked', this.formData);
    alert('Generating Veterinary PDF...');
  }

  resetForm() {
    Object.keys(this.formData).forEach(key => {
      if (key !== 'activityType' && key !== 'date') {
        (this.formData as any)[key] = '';
      }
    });
    this.formData.isHospitalized = false;
  }

  // Medical form (Form.io) - Original form
  createMedicalForm() {
    if (typeof Formio === 'undefined') {
      console.error('Formio is not loaded');
      return;
    }

    const formDefinition = {
      display: "wizard",
      components: [
        {
          title: "Patient Demographics",
          type: "panel",
          key: "patientDemographics",
          components: [
            {
              label: "Patient ID",
              type: "textfield",
              key: "patientId",
              input: true,
              placeholder: "Enter Patient ID",
              validate: { required: true }
            },
            {
              label: "Age",
              type: "number",
              key: "age",
              input: true,
              placeholder: "Enter Age",
              validate: { required: true, min: 0, max: 150 }
            },
            {
              label: "Gender",
              type: "select",
              key: "gender",
              input: true,
              data: {
                values: [
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Race/Ethnicity",
              type: "select",
              key: "raceEthnicity",
              input: true,
              data: {
                values: [
                  { label: "Asian", value: "asian" },
                  { label: "Black", value: "black" },
                  { label: "Hispanic", value: "hispanic" },
                  { label: "White", value: "white" },
                  { label: "Other", value: "other" }
                ]
              },
              validate: { required: true }
            }
          ]
        },
        {
          title: "Clinical Setting",
          type: "panel",
          key: "clinicalSetting",
          components: [
            {
              label: "Setting Type",
              type: "select",
              key: "settingType",
              input: true,
              data: {
                values: [
                  { label: "Inpatient", value: "inpatient" },
                  { label: "Outpatient", value: "outpatient" },
                  { label: "Emergency Department", value: "emergency" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Location",
              type: "textfield",
              key: "location",
              input: true,
              placeholder: "Enter Location",
              validate: { required: true }
            }
          ]
        },
        {
          title: "Diagnosis",
          type: "panel",
          key: "diagnosis",
          components: [
            {
              label: "Primary Diagnosis",
              type: "textfield",
              key: "primaryDiagnosis",
              input: true,
              placeholder: "Enter primary diagnosis",
              validate: { required: true }
            },
            {
              label: "ICD-10 Code",
              type: "textfield",
              key: "icd10Code",
              input: true,
              placeholder: "Enter ICD-10 code"
            }
          ]
        }
      ]
    };

    Formio.createForm(this.formioContainer.nativeElement, formDefinition).then((form: any) => {
      form.on('submit', (submission: any) => {
        console.log('Medical Form Submitted:', submission);
        alert('Medical Case Log Submitted Successfully!');
      });
    });
  }
}
