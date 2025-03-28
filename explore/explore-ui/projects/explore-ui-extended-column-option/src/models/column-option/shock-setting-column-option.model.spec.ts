import {AbstractColumnOption, ColumnOptionFactory} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from './shock-setting-column-option.model';
import {StressScenario} from '../stress-scenario.model';

describe('Shock setting column option', () => {

    let shockSettingColumnOption: ShockSettingColumnOption;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    });

    beforeEach(() => {
        shockSettingColumnOption = new ShockSettingColumnOption();
    });

    it('Test model initialization', () => {
        expect(shockSettingColumnOption).not.toBeUndefined();
        expect(shockSettingColumnOption).not.toBeNull();
    });

    it('test CreateRequest Params', () => {
        shockSettingColumnOption.shock = 12.23;
        const optionValues: any = {};
        shockSettingColumnOption.addRequestParams(optionValues);
        expect(optionValues.shockSettings.shock).toBe(12.23);
    });

    it('Test serialize/deserialize', () => {
        shockSettingColumnOption.shock = 12.23;
        shockSettingColumnOption.restrictImpliedShocks = ['a', 'b'];
        const data: any = shockSettingColumnOption.serialize(false);
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        expect(data.configType).toBe(shockSettingColumnOption.configType);
        expect(data.shock).toBe(shockSettingColumnOption.shock);
        expect(data.restrictImpliedShocks).toBe('a,b');


        const shockSettingColumnOption1 = new ShockSettingColumnOption();
        shockSettingColumnOption1.deserialize(data);
        expect(shockSettingColumnOption1.shock).toBe(shockSettingColumnOption.shock);
        expect(shockSettingColumnOption1.restrictImpliedShocks).toEqual(shockSettingColumnOption.restrictImpliedShocks);
    });


    it('Test create from factory', () => {
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(ShockSettingColumnOption.CONFIG_TYPE);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof ShockSettingColumnOption).toBeTruthy();
    });

    it('Test equals', () => {
        const model1: ShockSettingColumnOption = new ShockSettingColumnOption();
        const model2: ShockSettingColumnOption = new ShockSettingColumnOption();
        expect(model1.equals(model2)).toBeTruthy();

        // Different shock
        model1.shock = 10.25;
        model2.shock = 15.26;
        expect(model1.equals(model2)).toBeFalsy();

        // Same shock
        model2.shock = 10.25;
        expect(model1.equals(model2)).toBeTruthy();

        // different restrictImpliedShocks
        model1.restrictImpliedShocks = ['a'];
        model2.restrictImpliedShocks = ['a', 'b'];
        expect(model1.equals(model2)).toBeFalsy();

        // different restrictImpliedShocks
        model1.restrictImpliedShocks = ['a', 'c'];
        model2.restrictImpliedShocks = ['a', 'b'];
        expect(model1.equals(model2)).toBeFalsy();

        // Same restrictImpliedShocks
        model1.restrictImpliedShocks = ['a', 'b'];
        model2.restrictImpliedShocks = ['b', 'a'];
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', () => {
        expect(shockSettingColumnOption.isValid()).toBeTruthy();
    });

    it('test getParentWidgetSettingKey', () => {
        expect(shockSettingColumnOption.getParentWidgetSettingKey()).toEqual(StressScenario.STRESS_SCENARIO_SETTINGS);
    });

    it('test getParentPortfolioSettingKey', () => {
        expect(shockSettingColumnOption.getParentPortfolioSettingKey()).toBeUndefined();
    });

    it('test updateDerivedSettings', () => {
        const scenario = new StressScenario();
        shockSettingColumnOption.updateDerivedSettings(scenario);
        expect(shockSettingColumnOption.scenario).toEqual(scenario);
    });

});

