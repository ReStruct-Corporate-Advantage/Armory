import {ClimateScenarioAvailableOptions, CoreDefinitionStore} from '@blk/explore-ui-core';
import {ClimateFiscalYearsColumnOption} from './climate-fiscal-years-column-option.model';

const mockClimateAssumptions = {
    decodeMap: {
        LATEST_YEAR: 'Latest Available'
    },
    optionsSortOrder: {
        _timeframeOverrides: {
            CAI_FISCAL_YEARS: ['LATEST_YEAR', '2018', '2019', '2020', '2021', '2022', '2023'],
            FISCAL_YEAR_DEFAULT: ['DEFAULT']
        },
    }
}

describe('ClimateFiscalYearsColumnOption', () => {
    let climateFiscalYearsColumnOption: ClimateFiscalYearsColumnOption;

    beforeAll(() => {
        CoreDefinitionStore.climateScenarioAssumptions = new ClimateScenarioAvailableOptions(mockClimateAssumptions);
    });

    it('should initialize a model with defaults', () => {
        climateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        climateFiscalYearsColumnOption.initialize(null);
        expect(climateFiscalYearsColumnOption.years).toBeDefined();
        expect(climateFiscalYearsColumnOption.years.length).toBe(1);
        expect(climateFiscalYearsColumnOption.years[0]).toBe('DEFAULT');
    });

    it('should initialize a model with timeframe override key', () => {
        climateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        const defaultSettings = {
            columnOptionAttributes: [{
                key: 'timeframeOverride',
                defaultValue: {
                    value: 'CAI_FISCAL_YEARS'
                }
            }]
        };
        climateFiscalYearsColumnOption.initialize(defaultSettings);
        expect(climateFiscalYearsColumnOption.years).toBeDefined();
        expect(climateFiscalYearsColumnOption.years.length).toBe(1);
        expect(climateFiscalYearsColumnOption.years[0]).toBe('LATEST_YEAR');
    });

    it('should serialize and deserialize the model', () => {
        climateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        climateFiscalYearsColumnOption.years = ['2020'];

        jest.spyOn(climateFiscalYearsColumnOption, 'doSerialize');
        const serializedData = climateFiscalYearsColumnOption.serialize();
        expect(climateFiscalYearsColumnOption.doSerialize).toHaveBeenCalled();

        const newClimateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        jest.spyOn(newClimateFiscalYearsColumnOption, 'deserialize');
        newClimateFiscalYearsColumnOption.deserialize(serializedData);
        expect(newClimateFiscalYearsColumnOption.deserialize).toHaveBeenCalled();
        expect(newClimateFiscalYearsColumnOption.equals(climateFiscalYearsColumnOption)).toBe(true);
    });

    it('doAddRequestParams : should add serialized data to request param', () => {
        climateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        climateFiscalYearsColumnOption.years = ['2020'];

        const requestParams: any = {};
        climateFiscalYearsColumnOption.addRequestParams(requestParams);
        expect(requestParams['years']).toBeDefined();
        expect(requestParams['years']).toStrictEqual(['2020']);
    });

    it('equals', function () {
        climateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        climateFiscalYearsColumnOption.initialize(null);
        const otherclimateFiscalYearsColumnOption = new ClimateFiscalYearsColumnOption();
        otherclimateFiscalYearsColumnOption.initialize(null);

        // Equal
        expect(climateFiscalYearsColumnOption.equals(otherclimateFiscalYearsColumnOption)).toStrictEqual(true);

        // Not equals undefined
        expect(climateFiscalYearsColumnOption.equals(undefined)).toStrictEqual(false);

        climateFiscalYearsColumnOption.years = ['2020'];
        expect(climateFiscalYearsColumnOption.equals(otherclimateFiscalYearsColumnOption)).toStrictEqual(false);

        otherclimateFiscalYearsColumnOption.years = ['2020'];
        expect(climateFiscalYearsColumnOption.equals(otherclimateFiscalYearsColumnOption)).toStrictEqual(true);

        climateFiscalYearsColumnOption.years = ['2020', '2021'];
        expect(climateFiscalYearsColumnOption.equals(otherclimateFiscalYearsColumnOption)).toStrictEqual(false);

        otherclimateFiscalYearsColumnOption.years = ['2020', '2021'];
        expect(climateFiscalYearsColumnOption.equals(otherclimateFiscalYearsColumnOption)).toStrictEqual(true);
    });

    /**
     * checks is valid
     */
    it('isValid', function () {
        // Invalid
        climateFiscalYearsColumnOption.years = undefined;
        expect(climateFiscalYearsColumnOption.isValid()).toStrictEqual(false);

        climateFiscalYearsColumnOption.years = [];
        expect(climateFiscalYearsColumnOption.isValid()).toStrictEqual(false);

        // Valid
        climateFiscalYearsColumnOption.years = ['2020'];
        expect(climateFiscalYearsColumnOption.isValid()).toStrictEqual(true);
    });
});
