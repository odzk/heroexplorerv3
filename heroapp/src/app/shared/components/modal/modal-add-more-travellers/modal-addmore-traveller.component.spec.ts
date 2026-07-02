import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddmoreTravellerComponent } from './modal-addmore-traveller.component';

describe('ModalAddmoreTravellerComponent', () => {
  let component: ModalAddmoreTravellerComponent;
  let fixture: ComponentFixture<ModalAddmoreTravellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddmoreTravellerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddmoreTravellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
