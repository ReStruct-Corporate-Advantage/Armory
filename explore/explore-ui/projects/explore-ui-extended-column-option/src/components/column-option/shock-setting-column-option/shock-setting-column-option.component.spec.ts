import {ColumnOptionTestBed} from '@blk/explore-ui-column-option';
import {ShockSettingColumnOptionComponent} from './shock-setting-column-option.component';
import {ShockSettingColumnOption} from '../../../models/column-option/shock-setting-column-option.model';
import {NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {FactorDefinitionsService} from '../../../services/factor-definitions.service';
import {of, throwError} from 'rxjs';
import {ImpliedShockUnitEnum} from '../../../enums/implied-shock-unit.enum';
import {StressScenario} from '../../../models/stress-scenario.model';

describe('ShockSettingColumnOptionComponent', () => {
    let testBed: ColumnOptionTestBed<ShockSettingColumnOptionComponent, ShockSettingColumnOption>;

    const factorDefinitionsServiceMock = {
        fetchFactorDefinitionsForFactorShocks$: jest.fn(() => of([{
            colTag: 'pct_mv',
            shockUnit: 'pct/yr',
        }]))
    };
    const notificationServiceMock = {
        error: jest.fn()
    };

    beforeEach(async () => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [],
            'columnOptionConfigType': 'shockSettingColumnOption',
            'columnOptionTitle': 'Shock settings',
            'columnOptionKey': 'shockSettingColumnOption'
        };

        const providers = [
            {provide: FactorDefinitionsService, useValue: factorDefinitionsServiceMock},
            {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock},
        ];

        const shockSettingColumnOption = new ShockSettingColumnOption();
        shockSettingColumnOption.scenario = new StressScenario();
        shockSettingColumnOption.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_SPECIFIC;

        testBed = new ColumnOptionTestBed<ShockSettingColumnOptionComponent, ShockSettingColumnOption>(ShockSettingColumnOptionComponent, shockSettingColumnOption, mockedOption, undefined, undefined, undefined, undefined, providers);
    });

    it('should create', () => {
        expect(testBed.component).toBeTruthy();
        expect(testBed.component.shockUnit).toEqual('pct/yr');
    });

    it('test method onRestrictImpliedShocksChanged', () => {
        testBed.component.optionValue.restrictImpliedShocks = [ 'a' ];
        const expectedValue = [  'x', 'y' ];
        testBed.component.onRestrictImpliedShocksChanged(expectedValue);
        expect(testBed.component.optionValue.restrictImpliedShocks).toEqual(expectedValue);
    });

    it('test method onShockValueChanged', () => {
        testBed.component.onShockValueChanged({
            detail: {srcEvent: {target: {value: '2.5'}}}
        } as CustomEvent);
        expect(testBed.component.optionValue.shock).toEqual(2.5);
    });

    describe('test method setShockUnitLabel', () => {
        it('test for impliedShockUnit value as NUMBER_OF_STD_DEVS', () => {
            testBed.component.optionValue.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.NUMBER_OF_STD_DEVS;
            testBed.component['setShockUnitLabel']();
            expect(testBed.component.shockUnit).toEqual(testBed.component['STD_DEV']);
        });

        it('test for other impliedShockUnit values - success', () => {
            testBed.component.optionValue.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;
            testBed.component['setShockUnitLabel']();
            expect(testBed.component.shockUnit).toEqual('pct/yr');
        });

        it('test for other impliedShockUnit values - failure', () => {
            testBed.component.optionValue.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;
            jest.spyOn(testBed.component['notificationService'], 'error');
            jest.spyOn(testBed.component['factorDefinitionsService'], 'fetchFactorDefinitionsForFactorShocks$').mockReturnValue(throwError(() => new Error()));
            testBed.component['setShockUnitLabel']();
            expect(testBed.component['notificationService'].error).toHaveBeenCalled();
            expect(testBed.component.shockUnit).toEqual(testBed.component['SHOCK_VALUE']);
        });
    });
});
