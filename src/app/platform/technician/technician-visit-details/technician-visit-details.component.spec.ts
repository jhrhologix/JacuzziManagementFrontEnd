import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicianVisitDetailsComponent } from './technician-visit-details.component';

describe('TechnicianVisitDetailsComponent', () => {
  let component: TechnicianVisitDetailsComponent;
  let fixture: ComponentFixture<TechnicianVisitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicianVisitDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicianVisitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
