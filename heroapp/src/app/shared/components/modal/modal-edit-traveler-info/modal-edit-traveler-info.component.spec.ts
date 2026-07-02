import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditTravellerComponent } from './modal-edit-traveler-info.component';

describe('ModalEditTravellerComponent', () => {
  let component: ModalEditTravellerComponent;
  let fixture: ComponentFixture<ModalEditTravellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEditTravellerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditTravellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
