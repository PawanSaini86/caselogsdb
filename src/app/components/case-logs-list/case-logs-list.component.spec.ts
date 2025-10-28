import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseLogsListComponent } from './case-logs-list.component';

describe('CaseLogsListComponent', () => {
  let component: CaseLogsListComponent;
  let fixture: ComponentFixture<CaseLogsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseLogsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseLogsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
