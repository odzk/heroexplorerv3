import { TestBed, inject } from '@angular/core/testing';

import { I18nServiceService } from './i18n-service.service';

describe('I18nServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [I18nServiceService]
    });
  });

  it('should be created', inject([I18nServiceService], (service: I18nServiceService) => {
    expect(service).toBeTruthy();
  }));
});
