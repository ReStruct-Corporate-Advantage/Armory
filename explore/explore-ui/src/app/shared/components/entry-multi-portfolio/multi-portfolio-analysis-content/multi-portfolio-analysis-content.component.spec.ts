import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiPortfolioAnalysisContentComponent } from './multi-portfolio-analysis-content.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MultiPortfolioAnalysisContentComponent', () => {
  let component: MultiPortfolioAnalysisContentComponent;
  let fixture: ComponentFixture<MultiPortfolioAnalysisContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiPortfolioAnalysisContentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiPortfolioAnalysisContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default comparisonStackedData as an empty array', () => {
    expect(component.comparisonStackedData).toEqual([]);
  });

  it('should have default anchorOptions as an empty array', () => {
    expect(component.anchorOptions).toEqual([]);
  });

  it('should have default isDisabled as false', () => {
    expect(component.isDisabled).toBeFalsy();
  });

  it('should emit checkboxGroupChanged event when onCheckboxGroupChanged is called', () => {
    jest.spyOn(component.checkboxGroupChanged, 'emit');

    component.onCheckboxGroupChanged();

    expect(component.checkboxGroupChanged.emit).toHaveBeenCalled();
  });

  it('should emit selectionChanged event when setSelectedAnchorValue is called', () => {
    const event = { value: 'test' };
    jest.spyOn(component.selectionChanged, 'emit');

    component.setSelectedAnchorValue(event);

    expect(component.selectionChanged.emit).toHaveBeenCalledWith(event);
  });
});