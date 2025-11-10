import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare var Formio: any;

@Component({
  selector: 'app-case-log-form',
  templateUrl: './case-log-form.component.html',
  styleUrls: ['./case-log-form.component.css']
})
export class CaseLogFormComponent implements OnInit {
  rotationId!: number;
  studentId: number = environment.studentId || 522;
  formType: 'medical' | 'veterinary' = 'veterinary';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get rotation ID from route
    this.route.params.subscribe(params => {
      this.rotationId = +params['rotationId'];
      this.createVeterinaryForm();
    });
  }

  createVeterinaryForm() {
    if (typeof Formio === 'undefined') {
      console.error('Formio is not loaded');
      return;
    }

    const formDefinition = {
      display: "wizard",
      components: [
        {
          title: "Patient Encounter",
          type: "panel",
          key: "patientDemographics",
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
                  { label: "1. Ambulatory / Field Service", value: "ambulatory_field" },
                  { label: "2. Hospitalized (with overnight stay)", value: "hospitalized_overnight" },
                  { label: "3. Hospital (without overnight stay)", value: "hospital_no_overnight" },
                  { label: "4. Simulation / Virtual / Online", value: "simulation_virtual" },
                  { label: "5. Lab Animal / Research", value: "lab_animal_research" },
                  { label: "6. Diagnostic Lab / Clin Path", value: "diagnostic_lab" }
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
                  { label: "Exotic", value: "exotic" },
                  { label: "Avian", value: "avian" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "What is the primary body system involved?",
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
                  { label: "Integumentary", value: "integumentary" },
                  { label: "Urogenital", value: "urogenital" },
                  { label: "Endocrine", value: "endocrine" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Multi-patient Encounter",
              type: "checkbox",
              key: "isMultiPatientEncounter",
              input: true
            },
            {
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Number of animals in group",
                      type: "number",
                      key: "numberOfAnimalsInGroup",
                      input: true,
                      placeholder: "Enter number of animals",
                      validate: { min: 1 },
                      conditional: {
                        show: true,
                        when: "isMultiPatientEncounter",
                        eq: true
                      }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Number of animals treated",
                      type: "number",
                      key: "numberOfAnimalsTreated",
                      input: true,
                      placeholder: "Enter number treated",
                      validate: { min: 1 },
                      conditional: {
                        show: true,
                        when: "isMultiPatientEncounter",
                        eq: true
                      }
                    }
                  ],
                  width: 6
                }
              ]
            },
            {
              label: "Species/Patient Details and/or Description of Activities",
              type: "textarea",
              key: "description",
              input: true,
              rows: 10,
              placeholder: "Enter detailed description...",
              validate: {
                maxLength: 4000
              }
            }
          ]
        },
        {
          title: "Diagnosis",
          type: "panel",
          key: "diagnosis",
          components: [
            {
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Diagnosis 1",
                      type: "select",
                      key: "diagnosis1",
                      input: true,
                      searchEnabled: true,
                      data: {
                        values: [
                          { label: "- No clinical problem", value: "no_clinical_problem" },
                          { label: "Allergic dermatitis", value: "allergic_dermatitis" },
                          { label: "Anemia", value: "anemia" },
                          { label: "Arthritis", value: "arthritis" },
                          { label: "Diabetes mellitus", value: "diabetes_mellitus" },
                          { label: "Fracture", value: "fracture" },
                          { label: "Gastroenteritis", value: "gastroenteritis" }
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
                      label: "Type 1",
                      type: "select",
                      key: "type1",
                      input: true,
                      data: {
                        values: [
                          { label: "Definitive", value: "definitive" },
                          { label: "Tentative", value: "tentative" },
                          { label: "Differential", value: "differential" }
                        ]
                      }
                    }
                  ],
                  width: 6
                }
              ]
            }
          ]
        },
        {
          title: "Procedures",
          type: "panel",
          key: "procedures",
          components: [
            {
              label: "Procedure 1",
              type: "select",
              key: "procedure1",
              input: true,
              searchEnabled: true,
              data: {
                values: [
                  { label: "- Physical exam", value: "physical_exam" },
                  { label: "Abdominal procedure", value: "abdominal_procedure" }
                ]
              },
              validate: { required: true }
            }
          ]
        },
        {
          title: "Competencies",
          type: "panel",
          key: "competencies",
          components: [
            {
              label: "Clinical Competency Entrustment",
              type: "select",
              key: "clinicalCompetencyEntrustment",
              input: true,
              data: {
                values: [
                  { label: "CC01 - Evaluate patient behavior", value: "cc01" }
                ]
              }
            }
          ]
        },
        {
          title: "Personal Reflection",
          type: "panel",
          key: "personalReflection",
          components: [
            {
              label: "Context of Personal Reflection",
              type: "textarea",
              key: "contextOfReflection",
              input: true,
              rows: 3
            },
            {
              label: "Personal Reactions and Feelings",
              type: "textarea",
              key: "personalReactionsAndFeelings",
              input: true,
              rows: 3,
              validate: { required: true }
            },
            {
              label: "Performance Evaluation",
              type: "textarea",
              key: "performanceEvaluation",
              input: true,
              rows: 3,
              validate: { required: true }
            },
            {
              label: "Action Plan for Improvement",
              type: "textarea",
              key: "actionPlanForImprovement",
              input: true,
              rows: 3,
              validate: { required: true }
            }
          ]
        }
      ]
    };

    // Create the form
    Formio.createForm(document.getElementById('formio'), formDefinition)
      .then((form: any) => {
        console.log('Veterinary form created successfully');
        
        // ========================================
        // HANDLE FORM SUBMISSION - SAVE TO DATABASE
        // ========================================
        form.on('submit', (submission: any) => {
          console.log('Form submitted:', submission);
          this.saveCaseLogToDatabase(submission);
        });
      })
      .catch((error: any) => {
        console.error('Error creating form:', error);
      });
  }

  /**
   * Save the complete form submission to the database
   * Everything goes into CASE_DATA as JSON
   */
  saveCaseLogToDatabase(formSubmission: any) {
    // Show loading indicator
    console.log('Saving case log to database...');

    // Prepare case log object
    const caseLog = {
      // Basic fields for quick querying
      rotationId: this.rotationId,
      studentId: this.studentId,
      caseDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
      
      // Extract key fields for database columns (for easy filtering/searching)
      diagnosis: formSubmission.data.diagnosis1 || 'Not specified',
      procedures: formSubmission.data.procedure1 || 'Not specified',
      
      // Save EVERYTHING in CASE_DATA as JSON
      caseData: {
        // Metadata
        formType: 'veterinary',
        formVersion: '1.0',
        submittedAt: new Date().toISOString(),
        
        // Complete Form.io submission (includes everything!)
        completeSubmission: formSubmission,
        
        // Organized by sections for easier access later
        patientEncounter: {
          studentRole: formSubmission.data.studentRole,
          patientType: formSubmission.data.patientType,
          setting: formSubmission.data.setting,
          speciesGroup: formSubmission.data.speciesGroup,
          primaryBodySystem: formSubmission.data.primaryBodySystem,
          isMultiPatientEncounter: formSubmission.data.isMultiPatientEncounter,
          numberOfAnimalsInGroup: formSubmission.data.numberOfAnimalsInGroup,
          numberOfAnimalsTreated: formSubmission.data.numberOfAnimalsTreated,
          isDischargedToday: formSubmission.data.isDischargedToday,
          daysHospitalized: formSubmission.data.daysHospitalized,
          description: formSubmission.data.description
        },
        
        diagnosis: {
          diagnosis1: formSubmission.data.diagnosis1,
          diagnosis2: formSubmission.data.diagnosis2,
          type1: formSubmission.data.type1,
          type2: formSubmission.data.type2,
          diagnosisNotes: formSubmission.data.diagnosisNotes
        },
        
        procedures: {
          procedure1: formSubmission.data.procedure1,
          level1: formSubmission.data.level1
        },
        
        competencies: {
          clinicalCompetencyEntrustment: formSubmission.data.clinicalCompetencyEntrustment
        },
        
        personalReflection: {
          contextOfReflection: formSubmission.data.contextOfReflection,
          personalReactionsAndFeelings: formSubmission.data.personalReactionsAndFeelings,
          performanceEvaluation: formSubmission.data.performanceEvaluation,
          actionPlanForImprovement: formSubmission.data.actionPlanForImprovement
        }
      },
      
      status: 'DRAFT',
      createdBy: `student_${this.studentId}`
    };

    // POST to backend API
    this.http.post(`${environment.apiUrl}/case-logs`, caseLog)
      .subscribe({
        next: (response: any) => {
          console.log('✅ Case log saved successfully!', response);
          alert('Case log saved successfully!');
          
          // Navigate back to rotation list
          this.router.navigate(['/rotations']);
        },
        error: (error) => {
          console.error('❌ Error saving case log:', error);
          alert('Error saving case log. Please try again.');
        }
      });
  }
}