import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaReportsComponent } from './spa-reports.component';

describe('SpaReportsComponent', () => {
  let component: SpaReportsComponent;
  let fixture: ComponentFixture<SpaReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
