import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RotationsListComponent } from './rotations-list.component';

describe('RotationsListComponent', () => {
  let component: RotationsListComponent;
  let fixture: ComponentFixture<RotationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RotationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RotationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
