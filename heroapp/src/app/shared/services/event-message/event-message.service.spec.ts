import { TestBed, inject } from '@angular/core/testing';

import { EventMessage } from './event-message.service';

describe('EventMessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventMessage]
    });
  });

  it('should be created', inject([EventMessage], (service: EventMessage) => {
    expect(service).toBeTruthy();
  }));
});
