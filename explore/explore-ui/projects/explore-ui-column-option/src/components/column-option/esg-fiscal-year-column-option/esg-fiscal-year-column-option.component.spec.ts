import {ColumnOptionTestBed} from '../../../test-utils';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EsgFiscalYearColumnOptionComponent } from './esg-fiscal-year-column-option.component';
import { AuxSelectOption, AuxSelectSelectionChangedDetailInterface } from '@blk/aladdin-angular-components';
import { ExploreSelectOption } from '@blk/explore-ui-core';
import { EventEmitter } from '@angular/core';
import { ESGFiscalYearsColumnOption } from '../../../models/column-option/esg-fiscal-years-column-option.model';

describe('EsgFiscalYearColumnOptionComponent', () => {
  
  let testBed: ColumnOptionTestBed<EsgFiscalYearColumnOptionComponent, ESGFiscalYearsColumnOption>;
  let component: EsgFiscalYearColumnOptionComponent;

  beforeEach(() => {
      testBed = new ColumnOptionTestBed<EsgFiscalYearColumnOptionComponent, ESGFiscalYearsColumnOption>(EsgFiscalYearColumnOptionComponent, new ESGFiscalYearsColumnOption(), undefined, undefined, undefined, undefined, undefined);
      component = new EsgFiscalYearColumnOptionComponent();
      component.fiscalYearsColumnOption = new ESGFiscalYearsColumnOption();
      component.optionValueUpdated = new EventEmitter<ESGFiscalYearsColumnOption>();
  });

  describe('initFiscalYearOptions Tests', () => {
    it('should initialize fiscal year options when yearOptions is empty', () => {
      testBed.component.fiscalYearsColumnOption.yearOptions = [];
      testBed.component.initFiscalYearOptions();
      expect(testBed.component.fiscalYearOptions.length).toBe(1);
      expect(testBed.component.fiscalYearOptions[0].values.length).toBe(0);
    });
  
    it('should initialize fiscal year options with provided yearOptions', () => {
      testBed.component.fiscalYearsColumnOption.yearOptions = ['2020', '2021', '2022'];
      testBed.component.fiscalYearsColumnOption.years = ['2021'];
      testBed.component.initFiscalYearOptions();
      expect(testBed.component.fiscalYearOptions.length).toBe(1);
      expect(testBed.component.fiscalYearOptions[0].values.length).toBe(3);
      expect(testBed.component.fiscalYearOptions[0].values[0].value).toBe('2020');
      expect(testBed.component.fiscalYearOptions[0].values[1].value).toBe('2021');
      expect(testBed.component.fiscalYearOptions[0].values[1].isSelected).toBe(true);
      expect(testBed.component.fiscalYearOptions[0].values[2].value).toBe('2022');
    });
  
    it('should set selectedYears based on yearOptions and years', () => {
      testBed.component.fiscalYearsColumnOption.yearOptions = ['2020', '2021', '2022'];
      testBed.component.fiscalYearsColumnOption.years = ['2021'];
      testBed.component.initFiscalYearOptions();
      expect(testBed.component.selectedYears.length).toBe(1);
      expect(testBed.component.selectedYears[0]).toBe('2021');
    });
  });

  describe('updateFiscalYears', () => {

    it('should update fiscalYearsColumnOption.years and emit optionValueUpdated for multiple selection mode', () => {
      component.selectionMode = 'multiple';
      const event = {
        detail: {
          value: [
            { value: '2025' },
            { value: '2026' },
          ] as AuxSelectOption[],
        },
      } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

      component.updateFiscalYears(event);

      expect(component.selectedYears).toEqual(['2025', '2026']);
      expect(component.fiscalYearsColumnOption.years).toEqual(['2025', '2026']);
    });
  });

  describe('onSelectionChange', () => {
    it('should update fiscalYearsColumnOption.years and emit optionValueUpdated', () => {
      const selectedValues = ['2025', '2026'];

      component.onSelectionChange(selectedValues);

      expect(component.fiscalYearsColumnOption.years).toEqual(selectedValues);
    });
  });
});
