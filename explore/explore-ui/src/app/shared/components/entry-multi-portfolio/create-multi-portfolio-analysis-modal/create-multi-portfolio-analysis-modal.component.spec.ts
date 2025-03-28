import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateMultiPortfolioAnalysisModalComponent } from './create-multi-portfolio-analysis-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CreateMultiPortfolioAnalysisModalComponent', () => {
  let component: CreateMultiPortfolioAnalysisModalComponent;
  let fixture: ComponentFixture<CreateMultiPortfolioAnalysisModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateMultiPortfolioAnalysisModalComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMultiPortfolioAnalysisModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title as empty string', () => {
    expect(component.title).toBe('');
  });

  it('should have default description as empty string', () => {
    expect(component.description).toBe('');
  });

  it('should have default applyText as "Apply"', () => {
    expect(component.applyText).toBe('Apply');
  });

  it('should have default cancelText as "Cancel"', () => {
    expect(component.cancelText).toBe('Cancel');
  });

  it('should emit applyClick event when onApplyClick is called', () => {
    jest.spyOn(component.applyClick, 'emit');

    component.onApplyClick();

    expect(component.applyClick.emit).toHaveBeenCalled();
  });

  it('should emit cancelClick event when onCancelClick is called', () => {
    jest.spyOn(component.cancelClick, 'emit');

    component.onCancelClick();

    expect(component.cancelClick.emit).toHaveBeenCalled();
  });
});