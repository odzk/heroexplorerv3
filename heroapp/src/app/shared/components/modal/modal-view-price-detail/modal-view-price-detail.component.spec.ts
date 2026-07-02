import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewPriceDetailComponent } from './modal-view-price-detail.component';

describe('ModalViewPriceDetailComponent', () => {
  let component: ModalViewPriceDetailComponent;
  let fixture: ComponentFixture<ModalViewPriceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalViewPriceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewPriceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
