import { TestBed, inject } from '@angular/core/testing';

import { HttpHeaderService } from './http-header.service';

describe('HttpHeaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpHeaderService]
    });
  });

  it('should be created', inject([HttpHeaderService], (service: HttpHeaderService) => {
    expect(service).toBeTruthy();
  }));
});
