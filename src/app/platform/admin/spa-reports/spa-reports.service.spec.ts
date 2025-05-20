import { TestBed } from '@angular/core/testing';

import { SpaReportsService } from './spa-reports.service';

describe('SpaReportsService', () => {
  let service: SpaReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpaReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
