import { TestBed, inject } from '@angular/core/testing';

import { LocalstoreService } from './localstore.service';

describe('LocalstoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalstoreService]
    });
  });

  it('should be created', inject([LocalstoreService], (service: LocalstoreService) => {
    expect(service).toBeTruthy();
  }));
});
