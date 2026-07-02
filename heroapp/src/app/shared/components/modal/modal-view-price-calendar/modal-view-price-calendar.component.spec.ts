import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewPriceCalendarComponent } from './modal-view-price-calendar.component';

describe('ModalViewPriceCalendarComponent', () => {
  let component: ModalViewPriceCalendarComponent;
  let fixture: ComponentFixture<ModalViewPriceCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalViewPriceCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewPriceCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
