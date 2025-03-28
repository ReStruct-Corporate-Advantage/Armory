import {ColumnConstants, NamedScenario} from '@blk/explore-ui-core';
import {ScenarioResponse} from '../interfaces/scenario-response.interface';
import {ScenarioUtils} from './scenario.utils';
import {StressScenario} from '../models/stress-scenario.model';
import {ScenarioCategoryEnum} from '../enums/scenario-category.enum';

describe('ScenarioUtils', () => {

    it('test method createNamedScenarioFromScenarioResponse', () => {
        const scenarioParams: ScenarioResponse = {
            'level': 'My Scenarios@@@Demo Scenario',
            'scenarioName': 'Demo Scenario',
            'scenarioDesc': '1983003430.23',
            'scenarioCode': 's272::DEV',
            'scenarioPurpose': 's272',
            'scenarioCreatedDate': '03:12:01'
        };

        const expectedNamedScenario = new NamedScenario({
            scenCode: scenarioParams.scenarioCode,
            scenDescription: scenarioParams.scenarioDesc,
            scenName: scenarioParams.scenarioName,
            scenCategory: 'My Scenarios'
        });

        const namedScenario = ScenarioUtils.createNamedScenarioFromScenarioResponse(scenarioParams);

        expect(namedScenario).toEqual(expectedNamedScenario);
    });

    it('test method createNamedScenarioFromStressScenario', () => {
        const stressScenario = new StressScenario();
        stressScenario.scenName = 'a';
        stressScenario.scenDesc = 'a';
        stressScenario.scenCode = 'ABC::XY';
        stressScenario.scenCategory = ScenarioCategoryEnum.MY_SCENARIOS;

        const expectedNamedScenario = new NamedScenario({
            scenCode: 'ABC::XY',
            scenDescription: 'a',
            scenName: 'a',
            scenCategory: ScenarioCategoryEnum.MY_SCENARIOS,
        });

        const namedScenario = ScenarioUtils.createNamedScenarioFromStressScenario(stressScenario);

        expect(namedScenario).toEqual(expectedNamedScenario);
    });

    it('test method getScenarioCodeForCheckingIfScenarioSelected', () => {
        let scenarioCode = 'ABC::XY';
        let expectedScenarioCode = 'ABC::XY';

        let scenarioCodeResult = ScenarioUtils.getScenarioCodeForCheckingIfScenarioSelected(scenarioCode);

        expect(scenarioCodeResult).toEqual(expectedScenarioCode);

        scenarioCode = 'ABC';
        expectedScenarioCode = 'ABC::P100';

        scenarioCodeResult = ScenarioUtils.getScenarioCodeForCheckingIfScenarioSelected(scenarioCode);

        expect(scenarioCodeResult).toEqual(expectedScenarioCode);
    });

    it('test method getScenarioCodeSplitArray', () => {
        const scenarioCode = 'ABC::XY';
        const expectedScenarioCodeArray = ['ABC', 'XY'];

        const scenarioCodeArray = ScenarioUtils['getScenarioCodeSplitArray'](scenarioCode);

        expect(scenarioCodeArray).toEqual(expectedScenarioCodeArray);
    });

    it('test method getNamedScenarioCode', () => {
        expect(ScenarioUtils.getNamedScenarioCode({ category: ScenarioCategoryEnum.ALADDIN_SCENARIOS, code: 'ABC::XYZ' })).toStrictEqual('ABC');
        expect(ScenarioUtils.getNamedScenarioCode({ code: 'ABC::XYZ' })).toStrictEqual('ABC::XYZ');
    });

    describe('getColumnFactorTag', () => {
        it('should return null if columnKey starts with CUSTOM_FACTOR_TAG and columnTag is CUSTOM_FACTOR_TAG', () => {
            const column: any = {
                columnKey: ColumnConstants.CUSTOM_FACTOR_TAG + 'test',
                columnTag: ColumnConstants.CUSTOM_FACTOR_TAG
            };
            const result = ScenarioUtils.getColumnFactorTag(column);
            expect(result).toBeNull();
        });

        it('should return columnTag if columnKey does not start with CUSTOM_FACTOR_TAG', () => {
            const column: any = {
                columnKey: 'test',
                columnTag: 'testTag'
            };
            const result = ScenarioUtils.getColumnFactorTag(column);
            expect(result).toEqual('testTag');
        });
    });

    describe('isCustomFactorTag', () => {
        it('should return true if columnTag is CUSTOM_FACTOR_TAG', () => {
            const result = ScenarioUtils.isCustomFactorTag(ColumnConstants.CUSTOM_FACTOR_TAG);
            expect(result).toBeTruthy();
        });

        it('should return false if columnTag is not CUSTOM_FACTOR_TAG', () => {
            const result = ScenarioUtils.isCustomFactorTag('testTag');
            expect(result).toBeFalsy();
        });
    });

});
