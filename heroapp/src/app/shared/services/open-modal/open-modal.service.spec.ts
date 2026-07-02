import { TestBed, inject } from '@angular/core/testing';

import { OpenModalService } from './open-modal.service';

describe('OpenModalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenModalService]
    });
  });

  it('should be created', inject([OpenModalService], (service: OpenModalService) => {
    expect(service).toBeTruthy();
  }));
});
