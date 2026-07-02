import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalManagerBookingComponent } from './modal-manager-booking.component';

describe('ModalManagerBookingComponent', () => {
  let component: ModalManagerBookingComponent;
  let fixture: ComponentFixture<ModalManagerBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalManagerBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalManagerBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
