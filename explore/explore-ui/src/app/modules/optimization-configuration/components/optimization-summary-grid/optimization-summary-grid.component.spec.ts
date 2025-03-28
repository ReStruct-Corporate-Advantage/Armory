import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OptimizationSummaryGridComponent} from './optimization-summary-grid.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('OptimizationSummaryGridComponent', () => {
  let component: OptimizationSummaryGridComponent;
  let fixture: ComponentFixture<OptimizationSummaryGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimizationSummaryGridComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(OptimizationSummaryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
