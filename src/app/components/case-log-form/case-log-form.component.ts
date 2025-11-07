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
  userType: 'vet' | 'medical' = 'medical';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.rotationId = this.route.snapshot.paramMap.get('rotationId');
    
    // Check localStorage for user type
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType === 'vet' || storedUserType === 'medical') {
      this.userType = storedUserType as 'vet' | 'medical';
    }
    
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('userType') === 'vet') {
      this.userType = 'vet';
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.userType === 'vet') {
        this.createVeterinaryForm();
      } else {
        this.createMedicalForm();
      }
    }, 500);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Medical Student Form - UPDATED with new Personal Reflection section
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
                  { label: "Black or African American", value: "black" },
                  { label: "Hispanic or Latino", value: "hispanic" },
                  { label: "White", value: "white" },
                  { label: "Native American or Alaska Native", value: "native" },
                  { label: "Native Hawaiian or Pacific Islander", value: "pacific" },
                  { label: "Two or More Races", value: "multiple" },
                  { label: "Other", value: "other" },
                  { label: "Prefer not to answer", value: "decline" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Primary Language",
              type: "textfield",
              key: "primaryLanguage",
              input: true,
              placeholder: "Enter Language",
              validate: { required: true }
            },
            {
              label: "Insurance Type",
              type: "select",
              key: "insuranceType",
              input: true,
              data: {
                values: [
                  { label: "Private/Commercial", value: "private" },
                  { label: "Medicare", value: "medicare" },
                  { label: "Medicaid", value: "medicaid" },
                  { label: "Military/VA", value: "military" },
                  { label: "Self-Pay/Uninsured", value: "selfpay" },
                  { label: "Other", value: "other" }
                ]
              },
              validate: { required: true }
            }
          ]
        },
        {
          title: "Setting Type",
          type: "panel",
          key: "settingType",
          components: [
            {
              label: "Clinical Setting",
              type: "select",
              key: "clinicalSetting",
              input: true,
              data: {
                values: [
                  { label: "Inpatient", value: "inpatient" },
                  { label: "Outpatient", value: "outpatient" },
                  { label: "Emergency Department", value: "emergency" },
                  { label: "Operating Room", value: "or" },
                  { label: "Intensive Care Unit", value: "icu" },
                  { label: "Clinic", value: "clinic" },
                  { label: "Community Health Center", value: "community" },
                  { label: "Other", value: "other" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Location/Facility Name",
              type: "textfield",
              key: "location",
              input: true,
              placeholder: "Enter facility or location name",
              validate: { required: true }
            },
            {
              label: "Date of Encounter",
              type: "datetime",
              key: "encounterDate",
              input: true,
              format: "yyyy-MM-dd",
              enableTime: false,
              validate: { required: true }
            },
            {
              label: "Duration (minutes)",
              type: "number",
              key: "duration",
              input: true,
              placeholder: "Enter duration in minutes",
              validate: { min: 1 }
            }
          ]
        },
        {
          title: "Reasons for Visit",
          type: "panel",
          key: "reasonsForVisit",
          components: [
            {
              label: "Chief Complaint",
              type: "textarea",
              key: "chiefComplaint",
              input: true,
              rows: 3,
              placeholder: "Enter the patient's chief complaint",
              validate: { required: true }
            },
            {
              label: "History of Present Illness",
              type: "textarea",
              key: "historyPresentIllness",
              input: true,
              rows: 5,
              placeholder: "Describe the history of present illness",
              validate: { required: true }
            },
            {
              label: "Relevant Past Medical History",
              type: "textarea",
              key: "pastMedicalHistory",
              input: true,
              rows: 4,
              placeholder: "List relevant past medical history"
            },
            {
              label: "Current Medications",
              type: "textarea",
              key: "medications",
              input: true,
              rows: 3,
              placeholder: "List current medications"
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
              label: "Primary ICD-10 Code",
              type: "textfield",
              key: "primaryIcd10Code",
              input: true,
              placeholder: "Enter ICD-10 code (e.g., I10)"
            },
            {
              label: "Secondary Diagnoses",
              type: "textarea",
              key: "secondaryDiagnoses",
              input: true,
              rows: 3,
              placeholder: "List any secondary diagnoses (one per line)"
            },
            {
              label: "Differential Diagnoses Considered",
              type: "textarea",
              key: "differentialDiagnoses",
              input: true,
              rows: 3,
              placeholder: "List differential diagnoses that were considered"
            },
            {
              label: "Assessment & Clinical Reasoning",
              type: "textarea",
              key: "clinicalReasoning",
              input: true,
              rows: 5,
              placeholder: "Describe your clinical reasoning and assessment",
              validate: { required: true }
            }
          ]
        },
        {
          title: "Procedures",
          type: "panel",
          key: "procedures",
          components: [
            {
              label: "Procedures Performed/Observed",
              type: "textarea",
              key: "proceduresPerformed",
              input: true,
              rows: 4,
              placeholder: "List all procedures (indicate if performed, assisted, or observed)",
              validate: { required: true }
            },
            {
              label: "CPT Codes",
              type: "textfield",
              key: "cptCodes",
              input: true,
              placeholder: "Enter relevant CPT codes (comma separated)"
            },
            {
              label: "Diagnostic Tests Ordered",
              type: "textarea",
              key: "diagnosticTests",
              input: true,
              rows: 3,
              placeholder: "List any diagnostic tests ordered (labs, imaging, etc.)"
            },
            {
              label: "Test Results Summary",
              type: "textarea",
              key: "testResults",
              input: true,
              rows: 3,
              placeholder: "Summarize relevant test results"
            },
            {
              label: "Treatment Plan",
              type: "textarea",
              key: "treatmentPlan",
              input: true,
              rows: 4,
              placeholder: "Describe the treatment plan",
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
              label: "Student Role in Care",
              type: "select",
              key: "studentRole",
              input: true,
              data: {
                values: [
                  { label: "Primary (Led patient care)", value: "primary" },
                  { label: "Active Participant", value: "active" },
                  { label: "Observer", value: "observer" }
                ]
              },
              validate: { required: true }
            },
            {
              label: "Core Competencies Demonstrated",
              type: "selectboxes",
              key: "competencies",
              input: true,
              values: [
                { label: "Patient Care", value: "patientCare" },
                { label: "Medical Knowledge", value: "medicalKnowledge" },
                { label: "Practice-Based Learning", value: "practiceLearning" },
                { label: "Interpersonal & Communication Skills", value: "communication" },
                { label: "Professionalism", value: "professionalism" },
                { label: "Systems-Based Practice", value: "systemsPractice" }
              ]
            },
            {
              label: "Supervising Physician",
              type: "textfield",
              key: "supervisingPhysician",
              input: true,
              placeholder: "Enter name of supervising physician",
              validate: { required: true }
            },
            {
              label: "Additional Notes",
              type: "textarea",
              key: "additionalNotes",
              input: true,
              rows: 3,
              placeholder: "Any additional notes or comments"
            }
          ]
        }
      ]
    };

    Formio.createForm(this.formioContainer.nativeElement, formDefinition).then((form: any) => {
      form.on('submit', (submission: any) => {
        console.log('Medical Case Log Submitted:', submission);
        alert('Medical Case Log Submitted Successfully!');
      });
    });
  }

  // Veterinary Student Form - Keep existing
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
              label: "If hospitalized patient, was the patient discharged today?",
              type: "checkbox",
              key: "isDischargedToday",
              input: true
            },
            {
              label: "If discharged today, how many days was the patient hospitalized?",
              type: "number",
              key: "daysHospitalized",
              input: true,
              placeholder: "Enter number of days",
              conditional: {
                show: true,
                when: "isDischargedToday",
                eq: true
              }
            },
            {
              label: "Species/Patient Details and/or Description of Activities",
              type: "textarea",
              key: "description",
              input: true,
              rows: 10,
              placeholder: "Enter detailed description of the case, patient details, and activities performed...",
              validate: {
                maxLength: 4000
              },
              description: "4000 characters maximum"
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
                    },
                    {
                      label: "Diagnosis 2",
                      type: "select",
                      key: "diagnosis2",
                      input: true,
                      searchEnabled: true,
                      data: {
                        values: [
                          { label: "- No clinical problem", value: "no_clinical_problem" },
                          { label: "Allergic dermatitis", value: "allergic_dermatitis" },
                          { label: "Anemia", value: "anemia" }
                        ]
                      }
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
                    },
                    {
                      label: "Type 2",
                      type: "select",
                      key: "type2",
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
            },
            {
              label: "Diagnosis Description/Notes",
              type: "textarea",
              key: "diagnosisNotes",
              input: true,
              rows: 3,
              placeholder: "Enter additional diagnosis information or notes"
            }
          ]
        },
        {
          title: "Procedures",
          type: "panel",
          key: "procedures",
          components: [
            {
              label: "Procedures: Select the procedures for this case",
              type: "content",
              key: "proceduresHeader",
              html: "<h3>Procedures: Select the procedures for this case</h3>"
            },
            {
              type: "columns",
              columns: [
                {
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
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Level 1",
                      type: "select",
                      key: "level1",
                      input: true,
                      data: {
                        values: [
                          { label: "Observed", value: "observed" },
                          { label: "Performed with Assistance", value: "performed_with_assistance" }
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
          title: "Competencies",
          type: "panel",
          key: "competencies",
          components: [
            {
              label: "Clinical Competency Entrustment",
              type: "select",
              key: "clinicalCompetencyEntrustment",
              input: true,
              searchEnabled: true,
              data: {
                values: [
                  { label: "CC01 - Evaluate patient behavior and temperament", value: "cc01" }
                ]
              },
              validate: { required: true }
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
              rows: 3,
              placeholder: "Enter context of your personal reflection...",
              validate: {
                maxLength: 4000
              },
              description: "4000 characters maximum"
            },
            {
              label: "Why did you choose this particular case, what events occurred, and how did your thoughts, emotions, and overall reactions develop and change as the situation progressed?",
              type: "textarea",
              key: "personalReactionsAndFeelings",
              input: true,
              rows: 3,
              placeholder: "Enter your personal reactions and feelings...",
              validate: {
                required: true,
                maxLength: 4000
              },
              description: "4000 characters maximum"
            },
            {
              label: "How would you evaluate your performance as a student doctor, including the knowledge and skills you applied, the key takeaways from the experience, the areas that require further development, and at least two learning issues you identified?",
              type: "textarea",
              key: "performanceEvaluation",
              input: true,
              rows: 3,
              placeholder: "Enter your performance evaluation and analysis...",
              validate: {
                required: true,
                maxLength: 4000
              },
              description: "4000 characters maximum"
            },
            {
              label: "What conclusions can you draw about your performance, how does it compare to that of a new graduate, what key knowledge and skills gained from this case can be applied to future situations, and what specific steps will you take to enhance your performance?",
              type: "textarea",
              key: "actionPlanForImprovement",
              input: true,
              rows: 3,
              placeholder: "Enter your action plan for improvement...",
              validate: {
                required: true,
                maxLength: 4000
              },
              description: "4000 characters maximum"
            }
          ]
        }
      ]
    };
    Formio.createForm(this.formioContainer.nativeElement, formDefinition).then((form: any) => {
      form.on('submit', (submission: any) => {
        console.log('Veterinary Case Log Submitted:', submission);
        alert('Veterinary Case Log Submitted Successfully!');
      });
    });
  }
}