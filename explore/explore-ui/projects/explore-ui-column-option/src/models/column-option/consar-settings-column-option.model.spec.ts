import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ConsarScenarioType} from '../../enums/consar-scenario-type.enum';
import {ConsarSettingsColumnOption} from './consar-settings-column-option.model';
import {NumericColumnFormatColumnOption} from './numeric-column-format-column-option.model';

describe('Consar settings column option model test', () => {
    let consarSettingsColumnOption: ConsarSettingsColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ConsarSettingsColumnOption.CONFIG_TYPE, ConsarSettingsColumnOption);
    });

    beforeEach(() => {
        consarSettingsColumnOption = new ConsarSettingsColumnOption();
    });

    it('should create model from factory', () => {
        const defaultSettings: any = {
            columnOptionAttributes: [{
                title: 'Consar settings',
                key: 'consarSettings',
                dataType: 'S',
                values: [
                    {label: 'SCENARIO_TYPE', value: true},
                    {label: 'CONFIDENCE_LEVEL', value: true},
                    {label: 'HISTORY', value: true}
                ]
            }]
        };

        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ConsarSettingsColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model instanceof ConsarSettingsColumnOption).toBeTruthy();
    });

    it('should check equals', () => {
        const model1: ConsarSettingsColumnOption = new ConsarSettingsColumnOption();
        const model2: ConsarSettingsColumnOption = new ConsarSettingsColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        const model3: NumericColumnFormatColumnOption = new NumericColumnFormatColumnOption();
        expect(model1.equals(model3)).toBeFalsy();

        model1.scenarioType = ConsarScenarioType.REGULAR;
        model2.scenarioType = ConsarScenarioType.STRESS;
        expect(model1.equals(model2)).toBeFalsy();

        model1.scenarioType = ConsarScenarioType.REGULAR;
        model2.scenarioType = ConsarScenarioType.REGULAR;
        model1.confidenceLevel = 26;
        model2.confidenceLevel = 28;
        expect(model1.equals(model2)).toBeFalsy();

        model1.confidenceLevel = 26;
        model2.confidenceLevel = 26;
        model1.history = 1000;
        model2.history = 1001;
        expect(model1.equals(model2)).toBeFalsy();

        model1.history = 1000;
        model2.history = 1000;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('should initialize model', () => {
        consarSettingsColumnOption.initialize(null);
        expect(consarSettingsColumnOption.scenarioType).toBeUndefined();

        const defaultSettings: any = {};
        consarSettingsColumnOption.initialize(defaultSettings);
        expect(consarSettingsColumnOption.scenarioType).toBeUndefined();

        defaultSettings.columnOptionAttributes = [{
            title: 'Consar settings',
            key: 'consarSettings',
            dataType: 'S',
            values: [
                {label: 'SCENARIO_TYPE', value: true},
                {label: 'CONFIDENCE_LEVEL', value: true},
                {label: 'HISTORY', value: true}
            ]
        }];
        consarSettingsColumnOption.initialize(defaultSettings);
        expect(consarSettingsColumnOption.scenarioType).toBeDefined();
        expect(consarSettingsColumnOption.confidenceLevel).toBeDefined();
        expect(consarSettingsColumnOption.history).toBeDefined();
    });

    it('should add request params', () => {
        let requestParams: any = {};
        consarSettingsColumnOption.addRequestParams(requestParams);
        expect(requestParams.consarSettings).toBeUndefined();

        requestParams = {};
        consarSettingsColumnOption.scenarioType = ConsarScenarioType.REGULAR;
        consarSettingsColumnOption.confidenceLevel = 26;
        consarSettingsColumnOption.history = 1000;
        consarSettingsColumnOption.addRequestParams(requestParams);
        expect(requestParams.consarSettings).toBeDefined();
    });

    it('should serialize', () => {
        let data: any = consarSettingsColumnOption.serialize(false);
        expect(data).toBeNull();

        consarSettingsColumnOption.scenarioType = ConsarScenarioType.REGULAR;
        consarSettingsColumnOption.confidenceLevel = 26;
        consarSettingsColumnOption.history = 1000;
        data = consarSettingsColumnOption.serialize(false);
        expect(data.scenarioType).toBe('REGULAR');
        expect(data.confidenceLevel).toBe(26);
        expect(data.history).toBe(1000);
    });

    it('should deserialize', () => {
        let data: any;
        consarSettingsColumnOption.deserialize(data);
        expect(consarSettingsColumnOption.scenarioType).toBeUndefined();
        expect(consarSettingsColumnOption.confidenceLevel).toBeUndefined();
        expect(consarSettingsColumnOption.history).toBeUndefined();

        data = {};
        consarSettingsColumnOption.deserialize(data);
        expect(consarSettingsColumnOption.scenarioType).toBeUndefined();
        expect(consarSettingsColumnOption.confidenceLevel).toBeUndefined();
        expect(consarSettingsColumnOption.history).toBeUndefined();

        data = {
            scenarioType: 'REGULAR',
            confidenceLevel: 26,
            history: 1000
        };
        consarSettingsColumnOption.deserialize(data);
        expect(consarSettingsColumnOption.scenarioType).toBe(ConsarScenarioType.REGULAR);
        expect(consarSettingsColumnOption.confidenceLevel).toBe(26);
        expect(consarSettingsColumnOption.history).toBe(1000);
    });
});
