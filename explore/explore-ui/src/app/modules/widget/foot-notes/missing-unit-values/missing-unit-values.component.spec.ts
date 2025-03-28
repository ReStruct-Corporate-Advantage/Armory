import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingUnitValuesComponent } from './missing-unit-values.component';

describe('MissingUnitValuesComponent', () => {
  let component: MissingUnitValuesComponent;
  let fixture: ComponentFixture<MissingUnitValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissingUnitValuesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissingUnitValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
