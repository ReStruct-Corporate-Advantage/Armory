import { ESGFiscalYearsColumnOption } from './esg-fiscal-years-column-option.model';
import { AbstractColumnOption } from '@blk/explore-ui-core';

describe('ESGFiscalYearColumnOption', () => {
    let esgFiscalYearsColumnOption: ESGFiscalYearsColumnOption;

    beforeEach(() => {
        esgFiscalYearsColumnOption = new ESGFiscalYearsColumnOption();
    });

    it('should initialize a model with defaults', () => {
        esgFiscalYearsColumnOption.initialize(null);
        expect(esgFiscalYearsColumnOption.years).toBeDefined();
        expect(esgFiscalYearsColumnOption.years.length).toBe(1);
        expect(esgFiscalYearsColumnOption.years[0]).toBe('Latest Available');
    });
    
    it('should serialize and deserialize the model', () => {
        esgFiscalYearsColumnOption.years = ['2020'];

        jest.spyOn(esgFiscalYearsColumnOption, 'doSerialize');
        const serializedData = esgFiscalYearsColumnOption.serialize();
        expect(esgFiscalYearsColumnOption.doSerialize).toHaveBeenCalled();

        const newEsgFiscalYearsColumnOption = new ESGFiscalYearsColumnOption();
        jest.spyOn(newEsgFiscalYearsColumnOption, 'deserialize');
        newEsgFiscalYearsColumnOption.deserialize(serializedData);
        expect(newEsgFiscalYearsColumnOption.deserialize).toHaveBeenCalled();
        expect(newEsgFiscalYearsColumnOption.equals(esgFiscalYearsColumnOption)).toBe(true);
    });

    describe('deserialize', () => {
        it('should set years when data has years', () => {
          const data = { years: ['2020', '2021'] };
          esgFiscalYearsColumnOption.deserialize(data);
          expect(esgFiscalYearsColumnOption.years).toEqual(['2020', '2021']);
        });
    
        it('should not set years when data has no years', () => {
          const data = {};
          esgFiscalYearsColumnOption.deserialize(data);
          expect(esgFiscalYearsColumnOption.years).toEqual([]);
        });
    
        it('should not set years when data has empty years', () => {
          const data = { years: [] };
          esgFiscalYearsColumnOption.deserialize(data);
          expect(esgFiscalYearsColumnOption.years).toEqual([]);
        });
      });

      describe('doSerialize', () => {
        it('should return serialized data when years are valid', () => {
            esgFiscalYearsColumnOption.years = ['2020', '2021'];
          const serializedData = esgFiscalYearsColumnOption.doSerialize();
          expect(serializedData).toEqual({ years: ['2020', '2021'] });
        });
    
        it('should return undefined when years are not valid', () => {
            esgFiscalYearsColumnOption.years = [];
          const serializedData = esgFiscalYearsColumnOption.doSerialize();
          expect(serializedData).toBeUndefined();
        });
      });
    
      describe('equals', () => {
        it('should return true when years are equal', () => {
          const otherColumnOption = new ESGFiscalYearsColumnOption();
          otherColumnOption.years = ['2020', '2021'];
          esgFiscalYearsColumnOption.years = ['2020', '2021'];
          expect(esgFiscalYearsColumnOption).toEqual(otherColumnOption);
        });
    
        it('should return false when years are not equal', () => {
          const otherColumnOption = new ESGFiscalYearsColumnOption();
          otherColumnOption.years = ['2020', '2022'];
          esgFiscalYearsColumnOption.years = ['2020', '2021'];
          expect(esgFiscalYearsColumnOption.equals(otherColumnOption)).toBe(false);
        });
    
        it('should return false when other column option is not an instance of ESGFiscalYearsColumnOption', () => {
          const otherColumnOption = new AbstractColumnOption();
          expect(esgFiscalYearsColumnOption.equals(otherColumnOption)).toBe(false);
        });
      });
});