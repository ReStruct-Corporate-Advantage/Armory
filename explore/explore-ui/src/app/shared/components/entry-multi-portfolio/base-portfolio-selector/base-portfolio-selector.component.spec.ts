import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasePortfolioSelectorComponent } from './base-portfolio-selector.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('BasePortfolioSelectorComponent', () => {
  let component: BasePortfolioSelectorComponent;
  let fixture: ComponentFixture<BasePortfolioSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasePortfolioSelectorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasePortfolioSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selectionChanged event', () => {
    jest.spyOn(component.selectionChanged, 'emit');

    const mockEvent = new CustomEvent('selectionChanged', {
      detail: { value: { comparisonConfigId: '1' } }
    });
    component.setSelectedAnchorValue(mockEvent);

    expect(component.selectionChanged.emit).toHaveBeenCalledWith(mockEvent);
  });
});