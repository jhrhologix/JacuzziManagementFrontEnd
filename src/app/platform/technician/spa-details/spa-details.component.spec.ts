import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaDetailsComponent } from './spa-details.component';

describe('SpaDetailsComponent', () => {
  let component: SpaDetailsComponent;
  let fixture: ComponentFixture<SpaDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
