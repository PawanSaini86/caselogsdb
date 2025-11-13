import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare var Formio: any;

@Component({
  selector: 'app-case-log-form',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto; background: white; min-height: 100vh;">
      <h2>Veterinary Case Log - Rotation {{ rotationId }}</h2>
      <div id="formio" style="margin-top: 20px;"></div>
    </div>
  `,
  styles: []
})
export class CaseLogFormComponent implements OnInit {
  rotationId!: number;
  studentId: number = 522;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rotationId = +params['rotationId'];
      console.log('🔵 Loading form for rotation:', this.rotationId);
      
      // Wait for DOM to be ready
      setTimeout(() => {
        this.createVeterinaryForm();
      }, 100);
    });
  }

  createVeterinaryForm() {
    // Check if Form.io is loaded
    if (typeof Formio === 'undefined') {
      console.error('❌ Formio is not loaded!');
      alert('Form.io library not loaded. Please add scripts to index.html:\n\n<link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">\n<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>');
      return;
    }

    console.log('✅ Form.io loaded, creating form...');

    const formDefinition = {
      display: "wizard",
      components: [
        {
          title: "Patient Encounter",
          type: "panel",
          key: "patientEncounter",
          components: [
            {
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Student Role",
                      type: "select",
                      key: "studentRole",
                      input: true,
                      data: {
                        values: [
                          { label: "Primary", value: "primary" },
                          { label: "Assisting", value: "assisting" },
                          { label: "Observing", value: "observing" }
                        ]
                      },
                      validate: { required: true }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Patient Type",
                      type: "select",
                      key: "patientType",
                      input: true,
                      data: {
                        values: [
                          { label: "Canine", value: "canine" },
                          { label: "Feline", value: "feline" },
                          { label: "Equine", value: "equine" },
                          { label: "Bovine", value: "bovine" },
                          { label: "Avian", value: "avian" },
                          { label: "Exotic", value: "exotic" }
                        ]
                      },
                      validate: { required: true }
                    }
                  ],
                  width: 6
                }
              ]
            },
            {
              label: "Setting",
              type: "select",
              key: "setting",
              input: true,
              data: {
                values: [
                  { label: "Ambulatory / Field Service", value: "ambulatory_field" },
                  { label: "Hospitalized (overnight)", value: "hospitalized_overnight" },
                  { label: "Hospital (no overnight)", value: "hospital_no_overnight" },
                  { label: "Simulation / Virtual", value: "simulation_virtual" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Species/Group",
              type: "select",
              key: "speciesGroup",
              input: true,
              data: {
                values: [
                  { label: "Small Animal", value: "small_animal" },
                  { label: "Large Animal", value: "large_animal" },
                  { label: "Equine", value: "equine" },
                  { label: "Exotic", value: "exotic" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Primary Body System",
              type: "select",
              key: "primaryBodySystem",
              input: true,
              data: {
                values: [
                  { label: "Cardiovascular", value: "cardiovascular" },
                  { label: "Respiratory", value: "respiratory" },
                  { label: "Gastrointestinal", value: "gastrointestinal" },
                  { label: "Neurological", value: "neurological" },
                  { label: "Musculoskeletal", value: "musculoskeletal" },
                  { label: "Integumentary", value: "integumentary" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Case Description",
              type: "textarea",
              key: "description",
              input: true,
              rows: 8,
              placeholder: "Describe the patient, presenting complaint, findings, and treatment...",
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
              key: "diagnosis1",
              input: true,
              placeholder: "Enter primary diagnosis",
              validate: { required: true }
            },
            {
              label: "Diagnosis Notes",
              type: "textarea",
              key: "diagnosisNotes",
              input: true,
              rows: 3,
              placeholder: "Additional diagnostic information..."
            }
          ]
        },
        {
          title: "Procedures",
          type: "panel",
          key: "procedures",
          components: [
            {
              label: "Procedure Performed",
              type: "textfield",
              key: "procedure1",
              input: true,
              placeholder: "e.g., Physical exam, Blood draw, Surgery",
              validate: { required: true }
            },
            {
              label: "Level of Involvement",
              type: "select",
              key: "level1",
              input: true,
              data: {
                values: [
                  { label: "Observed", value: "observed" },
                  { label: "Assisted", value: "assisted" },
                  { label: "Performed", value: "performed" }
                ]
              }
            }
          ]
        },
        {
          title: "Personal Reflection",
          type: "panel",
          key: "reflection",
          components: [
            {
              label: "What did you learn from this case?",
              type: "textarea",
              key: "learnings",
              input: true,
              rows: 4,
              placeholder: "Describe your key learnings and takeaways...",
              validate: { required: true }
            },
            {
              label: "How would you improve your performance?",
              type: "textarea",
              key: "improvements",
              input: true,
              rows: 3,
              placeholder: "What would you do differently next time?",
              validate: { required: true }
            }
          ]
        }
      ]
    };

    // Create the form
    Formio.createForm(document.getElementById('formio'), formDefinition)
      .then((form: any) => {
        console.log('✅ Veterinary form created successfully!');
        
        // Handle form submission
        form.on('submit', (submission: any) => {
          console.log('📝 Form submitted:', submission);
          this.saveToDatabase(submission);
        });
      })
      .catch((error: any) => {
        console.error('❌ Error creating form:', error);
        alert('Error creating form. Check console for details.');
      });
  }

  saveToDatabase(formSubmission: any) {
    console.log('💾 Saving case log to database...');

    const caseLog = {
      rotationId: this.rotationId,
      studentId: this.studentId,
      caseDate: new Date().toISOString().split('T')[0],
      
      // ALL form data goes into caseData as JSON
      caseData: {
        formType: 'veterinary',
        formVersion: '1.0',
        submittedAt: new Date().toISOString(),
        
        // Complete submission
        submission: formSubmission,
        
        // Form data
        studentRole: formSubmission.data.studentRole,
        patientType: formSubmission.data.patientType,
        setting: formSubmission.data.setting,
        speciesGroup: formSubmission.data.speciesGroup,
        primaryBodySystem: formSubmission.data.primaryBodySystem,
        description: formSubmission.data.description,
        diagnosis1: formSubmission.data.diagnosis1,
        diagnosisNotes: formSubmission.data.diagnosisNotes,
        procedure1: formSubmission.data.procedure1,
        level1: formSubmission.data.level1,
        learnings: formSubmission.data.learnings,
        improvements: formSubmission.data.improvements
      },
      
      status: 'DRAFT',
      createdBy: `student_${this.studentId}`
    };

    // POST to backend
    this.http.post('http://localhost:3000/api/case-logs', caseLog)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Case log saved successfully!', response);
          alert(`Case log saved successfully! ID: ${response.data.id}`);
          
          // Navigate back to rotations
          this.router.navigate(['/rotations']);
        },
        error: (error) => {
          console.error('❌ Error saving case log:', error);
          alert('Error saving case log. Please check console for details.');
        }
      });
  }
}