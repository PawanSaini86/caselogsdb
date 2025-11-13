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
      <h2>Clinical Case Log</h2>
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
            },
            {
              type: "columns",
              columns: [
                {
                  components: [
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
                          { label: "Anemia", value: "anemia" },
                          { label: "Arthritis", value: "arthritis" },
                          { label: "Diabetes mellitus", value: "diabetes_mellitus" },
                          { label: "Fracture", value: "fracture" },
                          { label: "Gastroenteritis", value: "gastroenteritis" }
                        ]
                      }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
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
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Diagnosis 3",
                      type: "select",
                      key: "diagnosis3",
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
                      }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Type 3",
                      type: "select",
                      key: "type3",
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
                          { label: "Abdominal procedure", value: "abdominal_procedure" },
                          { label: "Abdominocentesis", value: "abdominocentesis" },
                          { label: "Administer enema", value: "administer_enema" },
                          { label: "Advanced imaging (CT / MRI / Scintigraphy)", value: "advanced_imaging" },
                          { label: "Airway intubation", value: "airway_intubation" },
                          { label: "Allergy testing", value: "allergy_testing" },
                          { label: "Anesthesia monitoring", value: "anesthesia_monitoring" },
                          { label: "Arthrocentesis", value: "arthrocentesis" },
                          { label: "Bandaging / Splinting", value: "bandaging_splinting" },
                          { label: "Biopsy collection", value: "biopsy_collection" },
                          { label: "Blood draw / Venipuncture", value: "blood_draw" },
                          { label: "Blood transfusion", value: "blood_transfusion" },
                          { label: "Bone marrow aspiration", value: "bone_marrow_aspiration" },
                          { label: "Cardiac auscultation", value: "cardiac_auscultation" },
                          { label: "Catheterization (urinary)", value: "catheterization_urinary" },
                          { label: "Catheterization (IV)", value: "catheterization_iv" },
                          { label: "Chest tube placement", value: "chest_tube_placement" },
                          { label: "CPR / Emergency resuscitation", value: "cpr_resuscitation" },
                          { label: "Dental cleaning / Prophylaxis", value: "dental_cleaning" },
                          { label: "Dental extraction", value: "dental_extraction" },
                          { label: "Diagnostic imaging (X-ray)", value: "xray" },
                          { label: "Diagnostic imaging (Ultrasound)", value: "ultrasound" },
                          { label: "Ear cleaning", value: "ear_cleaning" },
                          { label: "ECG / EKG", value: "ecg" },
                          { label: "Euthanasia", value: "euthanasia" },
                          { label: "Fecal examination", value: "fecal_exam" },
                          { label: "Fluid therapy", value: "fluid_therapy" },
                          { label: "Gastric lavage", value: "gastric_lavage" },
                          { label: "Hoof trimming", value: "hoof_trimming" },
                          { label: "Intubation", value: "intubation" },
                          { label: "IV catheter placement", value: "iv_catheter" },
                          { label: "Laceration repair / Suturing", value: "suturing" },
                          { label: "Microchip placement", value: "microchip" },
                          { label: "Nail trimming", value: "nail_trimming" },
                          { label: "Nasogastric intubation", value: "nasogastric_intubation" },
                          { label: "Necropsy / Postmortem exam", value: "necropsy" },
                          { label: "Neurological examination", value: "neuro_exam" },
                          { label: "Ophthalmic examination", value: "ophthalmic_exam" },
                          { label: "Orthopedic examination", value: "orthopedic_exam" },
                          { label: "Pain assessment", value: "pain_assessment" },
                          { label: "Paracentesis", value: "paracentesis" },
                          { label: "Physical examination", value: "physical_examination" },
                          { label: "Radiography", value: "radiography" },
                          { label: "Rectal examination", value: "rectal_exam" },
                          { label: "Reproductive examination", value: "reproductive_exam" },
                          { label: "Respiratory assessment", value: "respiratory_assessment" },
                          { label: "Skin scraping", value: "skin_scraping" },
                          { label: "Surgery (soft tissue)", value: "surgery_soft_tissue" },
                          { label: "Surgery (orthopedic)", value: "surgery_orthopedic" },
                          { label: "Thoracocentesis", value: "thoracocentesis" },
                          { label: "Urinalysis", value: "urinalysis" },
                          { label: "Vaccine administration", value: "vaccine_admin" },
                          { label: "Venipuncture", value: "venipuncture" },
                          { label: "Wound management", value: "wound_management" }
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
                          { label: "Performed with Assistance", value: "performed_with_assistance" },
                          { label: "Performed Independently", value: "performed_independently" }
                        ]
                      }
                    }
                  ],
                  width: 6
                }
              ]
            },
            {
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Procedure 2",
                      type: "select",
                      key: "procedure2",
                      input: true,
                      searchEnabled: true,
                      data: {
                        values: [
                          { label: "- Physical exam", value: "physical_exam" },
                          { label: "Abdominal procedure", value: "abdominal_procedure" },
                          { label: "Abdominocentesis", value: "abdominocentesis" },
                          { label: "Administer enema", value: "administer_enema" },
                          { label: "Advanced imaging (CT / MRI / Scintigraphy)", value: "advanced_imaging" },
                          { label: "Airway intubation", value: "airway_intubation" },
                          { label: "Allergy testing", value: "allergy_testing" },
                          { label: "Anesthesia monitoring", value: "anesthesia_monitoring" },
                          { label: "Arthrocentesis", value: "arthrocentesis" },
                          { label: "Bandaging / Splinting", value: "bandaging_splinting" },
                          { label: "Biopsy collection", value: "biopsy_collection" },
                          { label: "Blood draw / Venipuncture", value: "blood_draw" },
                          { label: "Blood transfusion", value: "blood_transfusion" },
                          { label: "Bone marrow aspiration", value: "bone_marrow_aspiration" },
                          { label: "Cardiac auscultation", value: "cardiac_auscultation" },
                          { label: "Catheterization (urinary)", value: "catheterization_urinary" },
                          { label: "Catheterization (IV)", value: "catheterization_iv" },
                          { label: "Chest tube placement", value: "chest_tube_placement" },
                          { label: "CPR / Emergency resuscitation", value: "cpr_resuscitation" },
                          { label: "Dental cleaning / Prophylaxis", value: "dental_cleaning" },
                          { label: "Dental extraction", value: "dental_extraction" },
                          { label: "Diagnostic imaging (X-ray)", value: "xray" },
                          { label: "Diagnostic imaging (Ultrasound)", value: "ultrasound" },
                          { label: "Ear cleaning", value: "ear_cleaning" },
                          { label: "ECG / EKG", value: "ecg" },
                          { label: "Euthanasia", value: "euthanasia" },
                          { label: "Fecal examination", value: "fecal_exam" },
                          { label: "Fluid therapy", value: "fluid_therapy" },
                          { label: "Gastric lavage", value: "gastric_lavage" },
                          { label: "Hoof trimming", value: "hoof_trimming" },
                          { label: "Intubation", value: "intubation" },
                          { label: "IV catheter placement", value: "iv_catheter" },
                          { label: "Laceration repair / Suturing", value: "suturing" },
                          { label: "Microchip placement", value: "microchip" },
                          { label: "Nail trimming", value: "nail_trimming" },
                          { label: "Nasogastric intubation", value: "nasogastric_intubation" },
                          { label: "Necropsy / Postmortem exam", value: "necropsy" },
                          { label: "Neurological examination", value: "neuro_exam" },
                          { label: "Ophthalmic examination", value: "ophthalmic_exam" },
                          { label: "Orthopedic examination", value: "orthopedic_exam" },
                          { label: "Pain assessment", value: "pain_assessment" },
                          { label: "Paracentesis", value: "paracentesis" },
                          { label: "Physical examination", value: "physical_examination" },
                          { label: "Radiography", value: "radiography" },
                          { label: "Rectal examination", value: "rectal_exam" },
                          { label: "Reproductive examination", value: "reproductive_exam" },
                          { label: "Respiratory assessment", value: "respiratory_assessment" },
                          { label: "Skin scraping", value: "skin_scraping" },
                          { label: "Surgery (soft tissue)", value: "surgery_soft_tissue" },
                          { label: "Surgery (orthopedic)", value: "surgery_orthopedic" },
                          { label: "Thoracocentesis", value: "thoracocentesis" },
                          { label: "Urinalysis", value: "urinalysis" },
                          { label: "Vaccine administration", value: "vaccine_admin" },
                          { label: "Venipuncture", value: "venipuncture" },
                          { label: "Wound management", value: "wound_management" }
                        ]
                      }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Level 2",
                      type: "select",
                      key: "level2",
                      input: true,
                      data: {
                        values: [
                          { label: "Observed", value: "observed" },
                          { label: "Performed with Assistance", value: "performed_with_assistance" },
                          { label: "Performed Independently", value: "performed_independently" }
                        ]
                      }
                    }
                  ],
                  width: 6
                }
              ]
            },
            {
              type: "columns",
              columns: [
                {
                  components: [
                    {
                      label: "Procedure 3",
                      type: "select",
                      key: "procedure3",
                      input: true,
                      searchEnabled: true,
                      data: {
                        values: [
                          { label: "- Physical exam", value: "physical_exam" },
                          { label: "Abdominal procedure", value: "abdominal_procedure" },
                          { label: "Abdominocentesis", value: "abdominocentesis" },
                          { label: "Administer enema", value: "administer_enema" },
                          { label: "Advanced imaging (CT / MRI / Scintigraphy)", value: "advanced_imaging" },
                          { label: "Airway intubation", value: "airway_intubation" },
                          { label: "Allergy testing", value: "allergy_testing" },
                          { label: "Anesthesia monitoring", value: "anesthesia_monitoring" },
                          { label: "Arthrocentesis", value: "arthrocentesis" },
                          { label: "Bandaging / Splinting", value: "bandaging_splinting" },
                          { label: "Biopsy collection", value: "biopsy_collection" },
                          { label: "Blood draw / Venipuncture", value: "blood_draw" },
                          { label: "Blood transfusion", value: "blood_transfusion" },
                          { label: "Bone marrow aspiration", value: "bone_marrow_aspiration" },
                          { label: "Cardiac auscultation", value: "cardiac_auscultation" },
                          { label: "Catheterization (urinary)", value: "catheterization_urinary" },
                          { label: "Catheterization (IV)", value: "catheterization_iv" },
                          { label: "Chest tube placement", value: "chest_tube_placement" },
                          { label: "CPR / Emergency resuscitation", value: "cpr_resuscitation" },
                          { label: "Dental cleaning / Prophylaxis", value: "dental_cleaning" },
                          { label: "Dental extraction", value: "dental_extraction" },
                          { label: "Diagnostic imaging (X-ray)", value: "xray" },
                          { label: "Diagnostic imaging (Ultrasound)", value: "ultrasound" },
                          { label: "Ear cleaning", value: "ear_cleaning" },
                          { label: "ECG / EKG", value: "ecg" },
                          { label: "Euthanasia", value: "euthanasia" },
                          { label: "Fecal examination", value: "fecal_exam" },
                          { label: "Fluid therapy", value: "fluid_therapy" },
                          { label: "Gastric lavage", value: "gastric_lavage" },
                          { label: "Hoof trimming", value: "hoof_trimming" },
                          { label: "Intubation", value: "intubation" },
                          { label: "IV catheter placement", value: "iv_catheter" },
                          { label: "Laceration repair / Suturing", value: "suturing" },
                          { label: "Microchip placement", value: "microchip" },
                          { label: "Nail trimming", value: "nail_trimming" },
                          { label: "Nasogastric intubation", value: "nasogastric_intubation" },
                          { label: "Necropsy / Postmortem exam", value: "necropsy" },
                          { label: "Neurological examination", value: "neuro_exam" },
                          { label: "Ophthalmic examination", value: "ophthalmic_exam" },
                          { label: "Orthopedic examination", value: "orthopedic_exam" },
                          { label: "Pain assessment", value: "pain_assessment" },
                          { label: "Paracentesis", value: "paracentesis" },
                          { label: "Physical examination", value: "physical_examination" },
                          { label: "Radiography", value: "radiography" },
                          { label: "Rectal examination", value: "rectal_exam" },
                          { label: "Reproductive examination", value: "reproductive_exam" },
                          { label: "Respiratory assessment", value: "respiratory_assessment" },
                          { label: "Skin scraping", value: "skin_scraping" },
                          { label: "Surgery (soft tissue)", value: "surgery_soft_tissue" },
                          { label: "Surgery (orthopedic)", value: "surgery_orthopedic" },
                          { label: "Thoracocentesis", value: "thoracocentesis" },
                          { label: "Urinalysis", value: "urinalysis" },
                          { label: "Vaccine administration", value: "vaccine_admin" },
                          { label: "Venipuncture", value: "venipuncture" },
                          { label: "Wound management", value: "wound_management" }
                        ]
                      }
                    }
                  ],
                  width: 6
                },
                {
                  components: [
                    {
                      label: "Level 3",
                      type: "select",
                      key: "level3",
                      input: true,
                      data: {
                        values: [
                          { label: "Observed", value: "observed" },
                          { label: "Performed with Assistance", value: "performed_with_assistance" },
                          { label: "Performed Independently", value: "performed_independently" }
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
              label: "Clinical Competency Entrustment (Select multiple)",
              type: "select",
              key: "clinicalCompetencyEntrustment",
              input: true,
              multiple: true,
              searchEnabled: true,
              data: {
                values: [
                  { 
                    label: "CC01 - Evaluate patient behavior and temperament", 
                    value: "cc01_main" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 1. Don't trust to perform any aspect of the task", 
                    value: "cc01_level_1" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 2. Trust to perform only minor aspects of the task", 
                    value: "cc01_level_2" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc01_level_3" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 4. Trust to perform most aspects of the task", 
                    value: "cc01_level_4" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc01_level_5" 
                  },
                  { 
                    label: "  CC01-Patient Behavior: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc01_level_6" 
                  },
                  { 
                    label: "CC02 - Safely handle and restrain patient", 
                    value: "cc02_main" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 1. Don't trust to perform any aspect of the task", 
                    value: "cc02_level_1" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 2. Trust to perform only minor aspects of the task", 
                    value: "cc02_level_2" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc02_level_3" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 4. Trust to perform most aspects of the task", 
                    value: "cc02_level_4" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc02_level_5" 
                  },
                  { 
                    label: "  CC02-Patient Handling: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc02_level_6" 
                  },
                  { 
                    label: "CC03 - Perform complete physical examination", 
                    value: "cc03_main" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 1. Don't trust to perform any aspect of the task", 
                    value: "cc03_level_1" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 2. Trust to perform only minor aspects of the task", 
                    value: "cc03_level_2" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc03_level_3" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 4. Trust to perform most aspects of the task", 
                    value: "cc03_level_4" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc03_level_5" 
                  },
                  { 
                    label: "  CC03-Physical Exam: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc03_level_6" 
                  },
                  { 
                    label: "CC04 - Develop appropriate differential diagnoses", 
                    value: "cc04_main" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 1. Don't trust to perform any aspect of the task", 
                    value: "cc04_level_1" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 2. Trust to perform only minor aspects of the task", 
                    value: "cc04_level_2" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc04_level_3" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 4. Trust to perform most aspects of the task", 
                    value: "cc04_level_4" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc04_level_5" 
                  },
                  { 
                    label: "  CC04-Differential Diagnosis: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc04_level_6" 
                  },
                  { 
                    label: "CC05 - Develop appropriate diagnostic plan", 
                    value: "cc05_main" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 1. Don't trust to perform any aspect of the task", 
                    value: "cc05_level_1" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 2. Trust to perform only minor aspects of the task", 
                    value: "cc05_level_2" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc05_level_3" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 4. Trust to perform most aspects of the task", 
                    value: "cc05_level_4" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc05_level_5" 
                  },
                  { 
                    label: "  CC05-Diagnostic Plan: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc05_level_6" 
                  },
                  { 
                    label: "CC06 - Develop appropriate treatment plan", 
                    value: "cc06_main" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 1. Don't trust to perform any aspect of the task", 
                    value: "cc06_level_1" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 2. Trust to perform only minor aspects of the task", 
                    value: "cc06_level_2" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc06_level_3" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 4. Trust to perform most aspects of the task", 
                    value: "cc06_level_4" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc06_level_5" 
                  },
                  { 
                    label: "  CC06-Treatment Plan: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc06_level_6" 
                  },
                  { 
                    label: "CC07 - Perform clinical procedures", 
                    value: "cc07_main" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 1. Don't trust to perform any aspect of the task", 
                    value: "cc07_level_1" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 2. Trust to perform only minor aspects of the task", 
                    value: "cc07_level_2" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc07_level_3" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 4. Trust to perform most aspects of the task", 
                    value: "cc07_level_4" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc07_level_5" 
                  },
                  { 
                    label: "  CC07-Clinical Procedures: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc07_level_6" 
                  },
                  { 
                    label: "CC08 - Communicate effectively with clients", 
                    value: "cc08_main" 
                  },
                  { 
                    label: "  CC08-Client Communication: 1. Don't trust to perform any aspect of the task", 
                    value: "cc08_level_1" 
                  },
                  { 
                    label: "  CC08-Client Communication: 2. Trust to perform only minor aspects of the task", 
                    value: "cc08_level_2" 
                  },
                  { 
                    label: "  CC08-Client Communication: 3. Trust to perform only uncomplicated aspects of the task", 
                    value: "cc08_level_3" 
                  },
                  { 
                    label: "  CC08-Client Communication: 4. Trust to perform most aspects of the task", 
                    value: "cc08_level_4" 
                  },
                  { 
                    label: "  CC08-Client Communication: 5. Trust to perform all aspects of the task alone in similar cases", 
                    value: "cc08_level_5" 
                  },
                  { 
                    label: "  CC08-Client Communication: 6. Trust to perform all aspects of the task alone in complicated cases", 
                    value: "cc08_level_6" 
                  }
                ]
              },
              validate: { required: true },
              description: "Hold Ctrl (Windows) or Cmd (Mac) to select multiple competencies. You can track multiple skills demonstrated in this case."
            },
            {
              label: "Selected Competencies Summary",
              type: "htmlelement",
              key: "competenciesSummary",
              content: "<div id='competencies-summary' style='margin-top: 15px; padding: 10px; background: #f0f8ff; border-left: 4px solid #1e90ff; display: none;'><strong>Selected Competencies:</strong><ul id='selected-list'></ul></div>",
              customConditional: "show = true;"
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

    // Create the form
    Formio.createForm(document.getElementById('formio'), formDefinition)
      .then((form: any) => {
        console.log('✅ Veterinary form created successfully with 3 Diagnoses and 3 Procedures!');
        
        // Handle competency selection display
        form.on('change', (changed: any) => {
          if (changed.changed && changed.changed.component && 
              changed.changed.component.key === 'clinicalCompetencyEntrustment') {
            const selectedValues = changed.data.clinicalCompetencyEntrustment || [];
            const summaryDiv = document.getElementById('competencies-summary');
            const selectedList = document.getElementById('selected-list');
            
           
          }
        });
        
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
        
        // Form data - now including diagnosis 3 and type 3
        studentRole: formSubmission.data.studentRole,
        patientType: formSubmission.data.patientType,
        setting: formSubmission.data.setting,
        speciesGroup: formSubmission.data.speciesGroup,
        primaryBodySystem: formSubmission.data.primaryBodySystem,
        description: formSubmission.data.description,
        
        // All three diagnoses and types
        diagnosis1: formSubmission.data.diagnosis1,
        type1: formSubmission.data.type1,
        diagnosis2: formSubmission.data.diagnosis2,
        type2: formSubmission.data.type2,
        diagnosis3: formSubmission.data.diagnosis3,
        type3: formSubmission.data.type3,
        
        diagnosisNotes: formSubmission.data.diagnosisNotes,
        
        // All three procedures and levels
        procedure1: formSubmission.data.procedure1,
        level1: formSubmission.data.level1,
        procedure2: formSubmission.data.procedure2,
        level2: formSubmission.data.level2,
        procedure3: formSubmission.data.procedure3,
        level3: formSubmission.data.level3,
        
        // Multiple competencies (array)
        clinicalCompetencyEntrustment: formSubmission.data.clinicalCompetencyEntrustment || [],
        
        // Personal reflection fields
        contextOfReflection: formSubmission.data.contextOfReflection,
        personalReactionsAndFeelings: formSubmission.data.personalReactionsAndFeelings,
        performanceEvaluation: formSubmission.data.performanceEvaluation,
        actionPlanForImprovement: formSubmission.data.actionPlanForImprovement
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