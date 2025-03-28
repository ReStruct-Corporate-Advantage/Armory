import {ColumnOptionTestBed} from '../../../test-utils';
import {ClimateFiscalYearsColumnOptionComponent} from './climate-fiscal-years-column-option.component';
import {ClimateScenarioAvailableOptions, CoreDefinitionStore, ExploreSelectOption} from '@blk/explore-ui-core';
import {ClimateFiscalYearsColumnOption} from '../../../models/column-option/climate-fiscal-years-column-option.model';

describe('ClimateFiscalYearsColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ClimateFiscalYearsColumnOptionComponent, ClimateFiscalYearsColumnOption>;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions({
            decodeMap: {
                LATEST_YEAR: 'Latest Available'
            },
            optionsSortOrder: {
                _timeframeOverrides: {
                    CAI_FISCAL_YEARS: ['LATEST_YEAR', '2018', '2019', '2020', '2021', '2022', '2023'],
                    FISCAL_YEAR_DEFAULT: ['LATEST_YEAR']
                }
            }
        });
    });

    beforeEach(() => {
        const mockedOption = {
            columnOptionTitle: 'ClimateScenario',
            columnOptionConfigType: 'climateScenario',
            columnOptionKey: 'climateScenario',
            columnOptionAttributes: [
                {
                    key: 'timeframeOverride',
                    defaultValue: {
                        label: 'timeframeOverride',
                        value: 'CAI_FISCAL_YEARS'
                    }
                }]
        };
        // Additional column config

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<ClimateFiscalYearsColumnOptionComponent, ClimateFiscalYearsColumnOption>(
            ClimateFiscalYearsColumnOptionComponent, new ClimateFiscalYearsColumnOption(), mockedOption,
            undefined,
            undefined,
            undefined,
            undefined);
    });

    describe('ngOnInit Tests', () => {
        it('should initialize the component', () => {
            expect(testBed.component).toBeTruthy();
        });

        it('should initialize fiscal year options - default', () => {
            testBed.component.option.columnOptionAttributes = [
                {
                    key: 'timeframeOverride',
                    defaultValue: {
                        label: 'timeframeOverride',
                        value: ''
                    }
                } as any
            ];
            testBed.component.setTimeframeOverride();
            testBed.component.initFiscalYearOptions();
            expect(testBed.component.fiscalYearsColumnOption.years.length).toBe(1);
            expect(testBed.component.fiscalYearsColumnOption.years[0]).toBe('LATEST_YEAR');
            expect(testBed.component.fiscalYearOptions[0].values.length).toBe(1);
            expect(testBed.component.fiscalYearOptions[0].values[0].value).toBe('LATEST_YEAR');
            expect(testBed.component.fiscalYearOptions[0].values[0].displayValue).toBe('Latest Available');
        });

        it('should initialize fiscal year options', () => {
            testBed.component.initFiscalYearOptions();
            expect(testBed.component.fiscalYearsColumnOption.years.length).toBe(1);
            expect(testBed.component.fiscalYearsColumnOption.years[0]).toBe('LATEST_YEAR');
            expect(testBed.component.fiscalYearOptions[0].values.length).toBe(7);
            expect(testBed.component.fiscalYearOptions[0].values[0].value).toBe('LATEST_YEAR');
            expect(testBed.component.fiscalYearOptions[0].values[0].displayValue).toBe('Latest Available');
            expect(testBed.component.fiscalYearOptions[0].values[6].value).toBe('2023');
            expect(testBed.component.fiscalYearOptions[0].values[6].displayValue).toBe('2023');
        });

        it('should update the year when select box is changed', () => {
            testBed.component.fiscalYearsColumnOption.years = [];
            testBed.component.initFiscalYearOptions();
            const timeframeVal = testBed.component.fiscalYearOptions[0].values[0].value;
            const timeframeDisplayVal = testBed.component.fiscalYearOptions[0].values[0].displayValue;
            const yearOption = new ExploreSelectOption(timeframeDisplayVal, timeframeVal);
            testBed.component.updateFiscalYears({detail: {value: [yearOption]}} as CustomEvent);
            expect(testBed.component.fiscalYearsColumnOption.years[0]).toBe(yearOption.value);

            const timeframeVal2 = testBed.component.fiscalYearOptions[0].values[1].value;
            const timeframeDisplayVal2 = testBed.component.fiscalYearOptions[0].values[1].displayValue;
            const yearOption2 = new ExploreSelectOption(timeframeDisplayVal2, timeframeVal2);
            testBed.component.updateFiscalYears({detail: {value: [yearOption, yearOption2]}} as CustomEvent);
            expect(testBed.component.fiscalYearsColumnOption.years.length).toBe(2);
            expect(testBed.component.fiscalYearsColumnOption.years[1]).toBe(yearOption2.value);
        });

        it('should update the year when select box is changed for simple selection mode', () => {
            testBed.component.initFiscalYearOptions();
            testBed.component.selectionMode = 'simple';
            const yearOption = new ExploreSelectOption('2020', '2020');
            jest.spyOn(testBed.component.optionValueUpdated, 'emit');
            testBed.component.updateFiscalYears({detail: {value: yearOption}} as CustomEvent);
            expect(testBed.component.fiscalYearsColumnOption.years[0]).toBe('2020');
            expect(testBed.component.optionValueUpdated.emit).toHaveBeenCalled();
            const expectedCallParam = new ClimateFiscalYearsColumnOption();
            expectedCallParam.years = ['2020'];
            expect(testBed.component.optionValueUpdated.emit).toHaveBeenCalledWith(expectedCallParam);
        });

    });
});
