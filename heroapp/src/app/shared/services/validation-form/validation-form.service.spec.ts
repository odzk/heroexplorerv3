import { TestBed, inject } from '@angular/core/testing';

import { ValidationFormService } from './validation-form.service';

describe('ValidationFormService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationFormService]
    });
  });

  it('should be created', inject([ValidationFormService], (service: ValidationFormService) => {
    expect(service).toBeTruthy();
  }));
});
