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

  // Veterinary Student Form - Same wizard format, different Patient Encounter fields
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
                          { label: "2,4-dichlorophenoxyacetic acid toxicity", value: "2_4_d_toxicity" },
                          { label: "4-aminopyridine toxicity", value: "4_aminopyridine_toxicity" },
                          { label: "Abdominal hernia", value: "abdominal_hernia" },
                          { label: "Abdominal, gastric, abomasal, intestinal, hepatic, splenic, neoplasia", value: "abdominal_neoplasia" },
                          { label: "Abdominal, intra-abdominal adhesions", value: "abdominal_adhesions" },
                          { label: "Abnormalities nasal septum", value: "abnormalities_nasal_septum" },
                          { label: "Abomasal bloat, tympany", value: "abomasal_bloat" },
                          { label: "Abomasal emptying defect, dilatation and impaction", value: "abomasal_emptying_defect" },
                          { label: "Abomasal fistulae", value: "abomasal_fistulae" },
                          { label: "Abomasal, duodenal or intestinal ulcers", value: "abomasal_ulcers" },
                          { label: "Abomasal, omasal impaction", value: "abomasal_omasal_impaction" },
                          { label: "Abortion, bacterial", value: "abortion_bacterial" },
                          { label: "Abscess, cellulitis", value: "abscess_cellulitis" },
                          { label: "Absence, segmental aplasia, of the uterine horn, cervix", value: "absence_uterine_aplasia" },
                          { label: "Acanthamebiasis", value: "acanthamebiasis" },
                          { label: "Acanthosis nigricans", value: "acanthosis_nigricans" },
                          { label: "Acidophil hepatitis", value: "acidophil_hepatitis" },
                          { label: "Aconitum spp., monkshood, poisoning", value: "aconitum_poisoning" },
                          { label: "Acorn, oak, quercus, poisoning", value: "acorn_oak_poisoning" },
                          { label: "Acquired skin hypopigmentation, vitiligo", value: "acquired_hypopigmentation" },
                          { label: "Acute respiratory distress syndrome", value: "ards" },
                          { label: "Addison's disease", value: "addisons_disease" },
                          { label: "Adenocarcinoma", value: "adenocarcinoma" },
                          { label: "Adenovirus infection", value: "adenovirus" },
                          { label: "Allergic dermatitis", value: "allergic_dermatitis" },
                          { label: "Anemia", value: "anemia" },
                          { label: "Arrhythmia", value: "arrhythmia" },
                          { label: "Arthritis", value: "arthritis" },
                          { label: "Aspiration pneumonia", value: "aspiration_pneumonia" },
                          { label: "Ataxia", value: "ataxia" },
                          { label: "Bacterial infection", value: "bacterial_infection" },
                          { label: "Bloat/GDV", value: "bloat_gdv" },
                          { label: "Bronchitis", value: "bronchitis" },
                          { label: "Cardiomyopathy", value: "cardiomyopathy" },
                          { label: "Cataracts", value: "cataracts" },
                          { label: "Chronic kidney disease", value: "chronic_kidney_disease" },
                          { label: "Colitis", value: "colitis" },
                          { label: "Conjunctivitis", value: "conjunctivitis" },
                          { label: "Corneal ulcer", value: "corneal_ulcer" },
                          { label: "Cushing's disease", value: "cushings_disease" },
                          { label: "Cystitis", value: "cystitis" },
                          { label: "Dental disease", value: "dental_disease" },
                          { label: "Diabetes mellitus", value: "diabetes_mellitus" },
                          { label: "Diarrhea", value: "diarrhea" },
                          { label: "Ear infection/Otitis", value: "otitis" },
                          { label: "Ectopic ureter", value: "ectopic_ureter" },
                          { label: "Endocarditis", value: "endocarditis" },
                          { label: "Epilepsy/Seizures", value: "epilepsy_seizures" },
                          { label: "Feline lower urinary tract disease (FLUTD)", value: "flutd" },
                          { label: "Fracture", value: "fracture" },
                          { label: "Gastritis", value: "gastritis" },
                          { label: "Gastroenteritis", value: "gastroenteritis" },
                          { label: "Glaucoma", value: "glaucoma" },
                          { label: "Heart failure", value: "heart_failure" },
                          { label: "Heartworm disease", value: "heartworm" },
                          { label: "Heatstroke", value: "heatstroke" },
                          { label: "Hemangiosarcoma", value: "hemangiosarcoma" },
                          { label: "Hepatitis", value: "hepatitis" },
                          { label: "Hip dysplasia", value: "hip_dysplasia" },
                          { label: "Hyperthyroidism", value: "hyperthyroidism" },
                          { label: "Hypothyroidism", value: "hypothyroidism" },
                          { label: "Immune-mediated hemolytic anemia (IMHA)", value: "imha" },
                          { label: "Inflammatory bowel disease (IBD)", value: "ibd" },
                          { label: "Intervertebral disc disease (IVDD)", value: "ivdd" },
                          { label: "Lameness", value: "lameness" },
                          { label: "Laryngeal paralysis", value: "laryngeal_paralysis" },
                          { label: "Lens luxation", value: "lens_luxation" },
                          { label: "Lymphoma", value: "lymphoma" },
                          { label: "Mast cell tumor", value: "mast_cell_tumor" },
                          { label: "Megaesophagus", value: "megaesophagus" },
                          { label: "Pancreatitis", value: "pancreatitis" },
                          { label: "Parvovirus", value: "parvovirus" },
                          { label: "Patent ductus arteriosus (PDA)", value: "pda" },
                          { label: "Periodontal disease", value: "periodontal_disease" },
                          { label: "Pneumonia", value: "pneumonia" },
                          { label: "Polyuria/Polydipsia", value: "pu_pd" },
                          { label: "Pyometra", value: "pyometra" },
                          { label: "Renal failure", value: "renal_failure" },
                          { label: "Retinal detachment", value: "retinal_detachment" },
                          { label: "Skin infection/Pyoderma", value: "pyoderma" },
                          { label: "Urinary tract infection (UTI)", value: "uti" },
                          { label: "Urolithiasis", value: "urolithiasis" },
                          { label: "Vestibular disease", value: "vestibular_disease" },
                          { label: "Viral infection", value: "viral_infection" },
                          { label: "Vomiting", value: "vomiting" }
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
                          { label: "2,4-dichlorophenoxyacetic acid toxicity", value: "2_4_d_toxicity" },
                          { label: "4-aminopyridine toxicity", value: "4_aminopyridine_toxicity" },
                          { label: "Abdominal hernia", value: "abdominal_hernia" },
                          { label: "Abdominal, gastric, abomasal, intestinal, hepatic, splenic, neoplasia", value: "abdominal_neoplasia" },
                          { label: "Abdominal, intra-abdominal adhesions", value: "abdominal_adhesions" },
                          { label: "Abnormalities nasal septum", value: "abnormalities_nasal_septum" },
                          { label: "Abomasal bloat, tympany", value: "abomasal_bloat" },
                          { label: "Abomasal emptying defect, dilatation and impaction", value: "abomasal_emptying_defect" },
                          { label: "Abomasal fistulae", value: "abomasal_fistulae" },
                          { label: "Abomasal, duodenal or intestinal ulcers", value: "abomasal_ulcers" },
                          { label: "Abomasal, omasal impaction", value: "abomasal_omasal_impaction" },
                          { label: "Abortion, bacterial", value: "abortion_bacterial" },
                          { label: "Abscess, cellulitis", value: "abscess_cellulitis" },
                          { label: "Absence, segmental aplasia, of the uterine horn, cervix", value: "absence_uterine_aplasia" },
                          { label: "Acanthamebiasis", value: "acanthamebiasis" },
                          { label: "Acanthosis nigricans", value: "acanthosis_nigricans" },
                          { label: "Acidophil hepatitis", value: "acidophil_hepatitis" },
                          { label: "Aconitum spp., monkshood, poisoning", value: "aconitum_poisoning" },
                          { label: "Acorn, oak, quercus, poisoning", value: "acorn_oak_poisoning" },
                          { label: "Acquired skin hypopigmentation, vitiligo", value: "acquired_hypopigmentation" },
                          { label: "Acute respiratory distress syndrome", value: "ards" },
                          { label: "Addison's disease", value: "addisons_disease" },
                          { label: "Adenocarcinoma", value: "adenocarcinoma" },
                          { label: "Adenovirus infection", value: "adenovirus" },
                          { label: "Allergic dermatitis", value: "allergic_dermatitis" },
                          { label: "Anemia", value: "anemia" },
                          { label: "Arrhythmia", value: "arrhythmia" },
                          { label: "Arthritis", value: "arthritis" },
                          { label: "Aspiration pneumonia", value: "aspiration_pneumonia" },
                          { label: "Ataxia", value: "ataxia" },
                          { label: "Bacterial infection", value: "bacterial_infection" },
                          { label: "Bloat/GDV", value: "bloat_gdv" },
                          { label: "Bronchitis", value: "bronchitis" },
                          { label: "Cardiomyopathy", value: "cardiomyopathy" },
                          { label: "Cataracts", value: "cataracts" },
                          { label: "Chronic kidney disease", value: "chronic_kidney_disease" },
                          { label: "Colitis", value: "colitis" },
                          { label: "Conjunctivitis", value: "conjunctivitis" },
                          { label: "Corneal ulcer", value: "corneal_ulcer" },
                          { label: "Cushing's disease", value: "cushings_disease" },
                          { label: "Cystitis", value: "cystitis" },
                          { label: "Dental disease", value: "dental_disease" },
                          { label: "Diabetes mellitus", value: "diabetes_mellitus" },
                          { label: "Diarrhea", value: "diarrhea" },
                          { label: "Ear infection/Otitis", value: "otitis" },
                          { label: "Ectopic ureter", value: "ectopic_ureter" },
                          { label: "Endocarditis", value: "endocarditis" },
                          { label: "Epilepsy/Seizures", value: "epilepsy_seizures" },
                          { label: "Feline lower urinary tract disease (FLUTD)", value: "flutd" },
                          { label: "Fracture", value: "fracture" },
                          { label: "Gastritis", value: "gastritis" },
                          { label: "Gastroenteritis", value: "gastroenteritis" },
                          { label: "Glaucoma", value: "glaucoma" },
                          { label: "Heart failure", value: "heart_failure" },
                          { label: "Heartworm disease", value: "heartworm" },
                          { label: "Heatstroke", value: "heatstroke" },
                          { label: "Hemangiosarcoma", value: "hemangiosarcoma" },
                          { label: "Hepatitis", value: "hepatitis" },
                          { label: "Hip dysplasia", value: "hip_dysplasia" },
                          { label: "Hyperthyroidism", value: "hyperthyroidism" },
                          { label: "Hypothyroidism", value: "hypothyroidism" },
                          { label: "Immune-mediated hemolytic anemia (IMHA)", value: "imha" },
                          { label: "Inflammatory bowel disease (IBD)", value: "ibd" },
                          { label: "Intervertebral disc disease (IVDD)", value: "ivdd" },
                          { label: "Lameness", value: "lameness" },
                          { label: "Laryngeal paralysis", value: "laryngeal_paralysis" },
                          { label: "Lens luxation", value: "lens_luxation" },
                          { label: "Lymphoma", value: "lymphoma" },
                          { label: "Mast cell tumor", value: "mast_cell_tumor" },
                          { label: "Megaesophagus", value: "megaesophagus" },
                          { label: "Pancreatitis", value: "pancreatitis" },
                          { label: "Parvovirus", value: "parvovirus" },
                          { label: "Patent ductus arteriosus (PDA)", value: "pda" },
                          { label: "Periodontal disease", value: "periodontal_disease" },
                          { label: "Pneumonia", value: "pneumonia" },
                          { label: "Polyuria/Polydipsia", value: "pu_pd" },
                          { label: "Pyometra", value: "pyometra" },
                          { label: "Renal failure", value: "renal_failure" },
                          { label: "Retinal detachment", value: "retinal_detachment" },
                          { label: "Skin infection/Pyoderma", value: "pyoderma" },
                          { label: "Urinary tract infection (UTI)", value: "uti" },
                          { label: "Urolithiasis", value: "urolithiasis" },
                          { label: "Vestibular disease", value: "vestibular_disease" },
                          { label: "Viral infection", value: "viral_infection" },
                          { label: "Vomiting", value: "vomiting" }
                        ]
                      }
                    },
                    {
                      label: "Diagnosis 3",
                      type: "select",
                      key: "diagnosis3",
                      input: true,
                      searchEnabled: true,
                      data: {
                        values: [
                          { label: "- No clinical problem", value: "no_clinical_problem" },
                          { label: "2,4-dichlorophenoxyacetic acid toxicity", value: "2_4_d_toxicity" },
                          { label: "4-aminopyridine toxicity", value: "4_aminopyridine_toxicity" },
                          { label: "Abdominal hernia", value: "abdominal_hernia" },
                          { label: "Abdominal, gastric, abomasal, intestinal, hepatic, splenic, neoplasia", value: "abdominal_neoplasia" },
                          { label: "Abdominal, intra-abdominal adhesions", value: "abdominal_adhesions" },
                          { label: "Abnormalities nasal septum", value: "abnormalities_nasal_septum" },
                          { label: "Abomasal bloat, tympany", value: "abomasal_bloat" },
                          { label: "Abomasal emptying defect, dilatation and impaction", value: "abomasal_emptying_defect" },
                          { label: "Abomasal fistulae", value: "abomasal_fistulae" },
                          { label: "Abomasal, duodenal or intestinal ulcers", value: "abomasal_ulcers" },
                          { label: "Abomasal, omasal impaction", value: "abomasal_omasal_impaction" },
                          { label: "Abortion, bacterial", value: "abortion_bacterial" },
                          { label: "Abscess, cellulitis", value: "abscess_cellulitis" },
                          { label: "Absence, segmental aplasia, of the uterine horn, cervix", value: "absence_uterine_aplasia" },
                          { label: "Acanthamebiasis", value: "acanthamebiasis" },
                          { label: "Acanthosis nigricans", value: "acanthosis_nigricans" },
                          { label: "Acidophil hepatitis", value: "acidophil_hepatitis" },
                          { label: "Aconitum spp., monkshood, poisoning", value: "aconitum_poisoning" },
                          { label: "Acorn, oak, quercus, poisoning", value: "acorn_oak_poisoning" },
                          { label: "Acquired skin hypopigmentation, vitiligo", value: "acquired_hypopigmentation" },
                          { label: "Acute respiratory distress syndrome", value: "ards" },
                          { label: "Addison's disease", value: "addisons_disease" },
                          { label: "Adenocarcinoma", value: "adenocarcinoma" },
                          { label: "Adenovirus infection", value: "adenovirus" },
                          { label: "Allergic dermatitis", value: "allergic_dermatitis" },
                          { label: "Anemia", value: "anemia" },
                          { label: "Arrhythmia", value: "arrhythmia" },
                          { label: "Arthritis", value: "arthritis" },
                          { label: "Aspiration pneumonia", value: "aspiration_pneumonia" },
                          { label: "Ataxia", value: "ataxia" },
                          { label: "Bacterial infection", value: "bacterial_infection" },
                          { label: "Bloat/GDV", value: "bloat_gdv" },
                          { label: "Bronchitis", value: "bronchitis" },
                          { label: "Cardiomyopathy", value: "cardiomyopathy" },
                          { label: "Cataracts", value: "cataracts" },
                          { label: "Chronic kidney disease", value: "chronic_kidney_disease" },
                          { label: "Colitis", value: "colitis" },
                          { label: "Conjunctivitis", value: "conjunctivitis" },
                          { label: "Corneal ulcer", value: "corneal_ulcer" },
                          { label: "Cushing's disease", value: "cushings_disease" },
                          { label: "Cystitis", value: "cystitis" },
                          { label: "Dental disease", value: "dental_disease" },
                          { label: "Diabetes mellitus", value: "diabetes_mellitus" },
                          { label: "Diarrhea", value: "diarrhea" },
                          { label: "Ear infection/Otitis", value: "otitis" },
                          { label: "Ectopic ureter", value: "ectopic_ureter" },
                          { label: "Endocarditis", value: "endocarditis" },
                          { label: "Epilepsy/Seizures", value: "epilepsy_seizures" },
                          { label: "Feline lower urinary tract disease (FLUTD)", value: "flutd" },
                          { label: "Fracture", value: "fracture" },
                          { label: "Gastritis", value: "gastritis" },
                          { label: "Gastroenteritis", value: "gastroenteritis" },
                          { label: "Glaucoma", value: "glaucoma" },
                          { label: "Heart failure", value: "heart_failure" },
                          { label: "Heartworm disease", value: "heartworm" },
                          { label: "Heatstroke", value: "heatstroke" },
                          { label: "Hemangiosarcoma", value: "hemangiosarcoma" },
                          { label: "Hepatitis", value: "hepatitis" },
                          { label: "Hip dysplasia", value: "hip_dysplasia" },
                          { label: "Hyperthyroidism", value: "hyperthyroidism" },
                          { label: "Hypothyroidism", value: "hypothyroidism" },
                          { label: "Immune-mediated hemolytic anemia (IMHA)", value: "imha" },
                          { label: "Inflammatory bowel disease (IBD)", value: "ibd" },
                          { label: "Intervertebral disc disease (IVDD)", value: "ivdd" },
                          { label: "Lameness", value: "lameness" },
                          { label: "Laryngeal paralysis", value: "laryngeal_paralysis" },
                          { label: "Lens luxation", value: "lens_luxation" },
                          { label: "Lymphoma", value: "lymphoma" },
                          { label: "Mast cell tumor", value: "mast_cell_tumor" },
                          { label: "Megaesophagus", value: "megaesophagus" },
                          { label: "Pancreatitis", value: "pancreatitis" },
                          { label: "Parvovirus", value: "parvovirus" },
                          { label: "Patent ductus arteriosus (PDA)", value: "pda" },
                          { label: "Periodontal disease", value: "periodontal_disease" },
                          { label: "Pneumonia", value: "pneumonia" },
                          { label: "Polyuria/Polydipsia", value: "pu_pd" },
                          { label: "Pyometra", value: "pyometra" },
                          { label: "Renal failure", value: "renal_failure" },
                          { label: "Retinal detachment", value: "retinal_detachment" },
                          { label: "Skin infection/Pyoderma", value: "pyoderma" },
                          { label: "Urinary tract infection (UTI)", value: "uti" },
                          { label: "Urolithiasis", value: "urolithiasis" },
                          { label: "Vestibular disease", value: "vestibular_disease" },
                          { label: "Viral infection", value: "viral_infection" },
                          { label: "Vomiting", value: "vomiting" }
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
                    },
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
                          { label: "Alternative medicine therapy", value: "alternative_medicine" },
                          { label: "Amputation / artificial joint", value: "amputation" },
                          { label: "Anal glands expression", value: "anal_glands" },
                          { label: "Analgesic dosage", value: "analgesic_dosage" },
                          { label: "Analgesic drugs", value: "analgesic_drugs" },
                          { label: "Anesthetic dosage", value: "anesthetic_dosage" },
                          { label: "Anesthetic drug", value: "anesthetic_drug" },
                          { label: "Anesthetic equipment, accessories and drugs", value: "anesthetic_equipment" },
                          { label: "Anesthetic report", value: "anesthetic_report" }
                        ]
                      },
                      validate: { required: true }
                    },
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
                          { label: "Alternative medicine therapy", value: "alternative_medicine" },
                          { label: "Amputation / artificial joint", value: "amputation" },
                          { label: "Anal glands expression", value: "anal_glands" },
                          { label: "Analgesic dosage", value: "analgesic_dosage" },
                          { label: "Analgesic drugs", value: "analgesic_drugs" },
                          { label: "Anesthetic dosage", value: "anesthetic_dosage" },
                          { label: "Anesthetic drug", value: "anesthetic_drug" },
                          { label: "Anesthetic equipment, accessories and drugs", value: "anesthetic_equipment" },
                          { label: "Anesthetic report", value: "anesthetic_report" }
                        ]
                      }
                    },
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
                          { label: "Alternative medicine therapy", value: "alternative_medicine" },
                          { label: "Amputation / artificial joint", value: "amputation" },
                          { label: "Anal glands expression", value: "anal_glands" },
                          { label: "Analgesic dosage", value: "analgesic_dosage" },
                          { label: "Analgesic drugs", value: "analgesic_drugs" },
                          { label: "Anesthetic dosage", value: "anesthetic_dosage" },
                          { label: "Anesthetic drug", value: "anesthetic_drug" },
                          { label: "Anesthetic equipment, accessories and drugs", value: "anesthetic_equipment" },
                          { label: "Anesthetic report", value: "anesthetic_report" }
                        ]
                      }
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
                          { label: "Performed with Supervision", value: "performed_with_supervision" },
                          { label: "Interpreted", value: "interpreted" },
                          { label: "Developed", value: "developed" },
                          { label: "Prioritized", value: "prioritized" }
                        ]
                      }
                    },
                    {
                      label: "Level 2",
                      type: "select",
                      key: "level2",
                      input: true,
                      data: {
                        values: [
                          { label: "Observed", value: "observed" },
                          { label: "Performed with Assistance", value: "performed_with_assistance" },
                          { label: "Performed with Supervision", value: "performed_with_supervision" },
                          { label: "Interpreted", value: "interpreted" },
                          { label: "Developed", value: "developed" },
                          { label: "Prioritized", value: "prioritized" }
                        ]
                      }
                    },
                    {
                      label: "Level 3",
                      type: "select",
                      key: "level3",
                      input: true,
                      data: {
                        values: [
                          { label: "Observed", value: "observed" },
                          { label: "Performed with Assistance", value: "performed_with_assistance" },
                          { label: "Performed with Supervision", value: "performed_with_supervision" },
                          { label: "Interpreted", value: "interpreted" },
                          { label: "Developed", value: "developed" },
                          { label: "Prioritized", value: "prioritized" }
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
              label: "Clinical Competency Section: Select the competency(ies) you are completing for this case (you can select more than one). The preceptor or faculty member you have selected will be prompted to confirm your selection(s).",
              type: "content",
              key: "competencyHeader",
              html: "<h3>Clinical Competency Section: Select the competency(ies) you are completing for this case (you can select more than one). The preceptor or faculty member you have selected will be prompted to confirm your selection(s).</h3>"
            },
            {
              label: "Clinical Competency Entrustment",
              type: "select",
              key: "clinicalCompetencyEntrustment",
              input: true,
              searchEnabled: true,
              data: {
                values: [
                  { label: "CC01 - Evaluate patient behavior and temperament", value: "cc01" },
                  { label: "CC01-Patient Behavior: 1. Don't trust to perform any aspect of the task", value: "cc01_behavior_1" },
                  { label: "CC01-Patient Behavior: 2. Trust to perform only minor aspects of the task", value: "cc01_behavior_2" },
                  { label: "CC01-Patient Behavior: 3. Trust to perform only uncomplicated aspects of the task", value: "cc01_behavior_3" },
                  { label: "CC01-Patient Behavior: 4. Trust to perform most aspects of the task", value: "cc01_behavior_4" },
                  { label: "CC01-Patient Behavior: 5. Trust to perform all aspects of the task alone in similar cases", value: "cc01_behavior_5" },
                  { label: "CC01-Patient Behavior: 6. Trust to perform all aspects of the task even in challenging situations", value: "cc01_behavior_6" },
                  { label: "CC02 - Safely handle and restrain patient", value: "cc02" },
                  { label: "CC03 - Perform complete physical examination", value: "cc03" },
                  { label: "CC04 - Assessment of pain", value: "cc04" },
                  { label: "CC05 - Create a problem list", value: "cc05" },
                  { label: "CC06 - Emergency and critical care evaluation", value: "cc06" },
                  { label: "CC07 - Rank ordered differential list", value: "cc07" },
                  { label: "CC08 - Develop a diagnostic plan", value: "cc08" },
                  { label: "CC09 - Select, perform and interpret appropriate diagnostic tests", value: "cc09" },
                  { label: "CC10 - Develop appropriate therapeutic plan", value: "cc10" },
                  { label: "CC11 - Select appropriate medications", value: "cc11" }
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
              label: "What did you learn from this case?",
              type: "textarea",
              key: "learningPoints",
              input: true,
              rows: 5,
              placeholder: "Reflect on the key learning points from this clinical encounter...",
              validate: { required: true }
            },
            {
              label: "What would you do differently next time?",
              type: "textarea",
              key: "improvements",
              input: true,
              rows: 4,
              placeholder: "Consider what you might approach differently in a similar case..."
            },
            {
              label: "What questions remain?",
              type: "textarea",
              key: "questions",
              input: true,
              rows: 3,
              placeholder: "Note any questions or topics you'd like to explore further..."
            },
            {
              label: "Additional Notes",
              type: "textarea",
              key: "additionalNotes",
              input: true,
              rows: 3,
              placeholder: "Any other reflections or observations..."
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

  // Medical Student Form
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
              label: "Learning Points & Reflection",
              type: "textarea",
              key: "reflection",
              input: true,
              rows: 5,
              placeholder: "Reflect on what you learned from this case. What would you do differently? What questions remain?",
              validate: { required: true }
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
}