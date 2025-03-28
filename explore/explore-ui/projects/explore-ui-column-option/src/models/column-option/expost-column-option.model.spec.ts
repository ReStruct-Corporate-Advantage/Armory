import {AbstractColumnOption, ColumnOptionFactory, ExpostSettings, TimePeriod} from '@blk/explore-ui-core';
import {ExpostColumnOption} from './expost-column-option.model';

/**
 * Test class for the ex-post column option model.
 */
describe('Ex-post Column Option Model', () => {
    let expostColumnModel: ExpostColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ExpostColumnOption.CONFIG_TYPE, ExpostColumnOption);
    });

    beforeEach(() => {
        expostColumnModel = new ExpostColumnOption();
        expostColumnModel.expostSettings = new ExpostSettings();
        expostColumnModel.expostSettings.samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        expostColumnModel.expostSettings.statisticPeriods[0] = new TimePeriod('1 Year', 1, 'Years');
        expostColumnModel.expostSettings.isNetReturns = true;
        expostColumnModel.expostSettings.isLogNormal = false;
    });

    it('Test model initialization', () => {
        expect(expostColumnModel).not.toBeUndefined();
        expect(expostColumnModel).not.toBeNull();
        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = new TimePeriod('1 Month', 1, 'Months');
        expostSettings.statisticPeriods[0] = new TimePeriod('1 Year', 1, 'Years');
        expostSettings.isNetReturns = true;
        expostSettings.isLogNormal = false;
        expect(expostColumnModel.expostSettings.equals(expostSettings)).toBeTruthy();
    });

    it('test CreateRequest Params', () => {
        const optionValues: any = {};
        expostColumnModel.expostSettings.isGrossAndNetReturns = true;
        expostColumnModel.addRequestParams(optionValues);
        expect(optionValues['samplingPeriodShortName']).toBe('Months');
        expect(optionValues['numberOfSamplingPeriods']).toBe(1);
        expect(optionValues['statisticPeriodShortName']).toBe('Years');
        expect(optionValues['numberOfStatisticPeriods']).toBe(1);
        expect(optionValues['isGrossAndNetReturns']).toBe(true);
        expect(optionValues['isNetReturns']).toBe(true);
        expect(optionValues['isLogNormal']).toBe(false);
    });

    it('test getModifiedColumnTitle Params', () => {
        const modifiedTitle = expostColumnModel.getModifiedColumnTitle('Annualized Total Return');
        expect(modifiedTitle).toBe('Annualized Total Return(1 Month,1 Year,Net)');
    });

    it('Test serialize', () => {
        const data: any = expostColumnModel.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(expostColumnModel.configType);
        expect(data.samplingPeriod.shortName).toBe('Months');
        expect(data.samplingPeriod.numberOfPeriods).toBe(1);
        expect(data.statisticPeriods[0].shortName).toBe('Years');
        expect(data.statisticPeriods[0].numberOfPeriods).toBe(1);
        expect(data.isNetReturns).toBe(true);
        expect(data.isLogNormal).toBe(false);
    });

    it('Test deserialize', () => {
        const data: any = {
            samplingPeriod: {
                shortName: 'Months',
                numberOfPeriods: 1
            },
            statisticPeriods: [{
                shortName: 'Years',
                numberOfPeriods: 1
            }],
            isNetReturns: true,
            isLogNormal: false
        };
        const model: ExpostColumnOption = new ExpostColumnOption(data);
        expect(model).not.toBeUndefined();
        expect(model).not.toBeNull();
        const expostSettings = new ExpostSettings();
        expostSettings.samplingPeriod = new TimePeriod(undefined, 1, 'Months');
        expostSettings.statisticPeriods[0] = new TimePeriod(undefined, 1, 'Years');
        expostSettings.isNetReturns = true;
        expostSettings.isLogNormal = false;
        const otherModel = new ExpostColumnOption();
        otherModel.expostSettings = expostSettings;
        expect(model.equals(otherModel)).toBeTruthy();
    });

    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ExpostColumnOption.CONFIG_TYPE);

        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ExpostColumnOption).toBeTruthy();
    });

    it('Test create legacy expost model', () => {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: ExpostColumnOption = ExpostColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.samplingPeriodShortName = 'Months';
        data.numberOfSamplingPeriods = 1;
        data.statisticPeriodShortName = 'Years';
        data.numberOfStatisticPeriods = 2;
        data.isNetReturns = false;
        data.isLogNormal = true;
        model = ExpostColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.expostSettings.samplingPeriod.equals(new TimePeriod('', 1, 'Months'))).toBeTruthy();
        expect(model.expostSettings.statisticPeriods.length === 1).toBeTruthy();
        expect(model.expostSettings.statisticPeriods[0].equals(new TimePeriod('', 2, 'Years'))).toBeTruthy();
        expect(model.expostSettings.isNetReturns).not.toBeTruthy();
        expect(model.expostSettings.isLogNormal).toBeTruthy();
    });
});
