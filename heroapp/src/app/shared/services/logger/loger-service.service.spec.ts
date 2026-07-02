import { TestBed, inject } from '@angular/core/testing';

import { LogerServiceService } from './loger-service.service';

describe('LogerServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LogerServiceService]
    });
  });

  it('should be created', inject([LogerServiceService], (service: LogerServiceService) => {
    expect(service).toBeTruthy();
  }));
});
