import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ImpliedShockScenarioComponent} from './implied-shock-scenario.component';
import {StressScenario} from '../../../../../../models/stress-scenario.model';
import {BehaviorSubject} from 'rxjs';
import {ImpliedShockUnitEnum} from '../../../../../../enums/implied-shock-unit.enum';
import {ScenarioConstants} from '../../../../../../constants/scenario.constant';
import {ColumnConfig, DateValue} from '@blk/explore-ui-core';
import {ShockSettingColumnOption} from '../../../../../../models/column-option/shock-setting-column-option.model';

describe('ImpliedShockScenarioComponent', () => {
    let component: ImpliedShockScenarioComponent;
    let fixture: ComponentFixture<ImpliedShockScenarioComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ImpliedShockScenarioComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ImpliedShockScenarioComponent);
        component = fixture.componentInstance;
        component.showSpinner$ = new BehaviorSubject<boolean>(false);
        component.isApplyButtonDisabled = { value: 0 };
        component.scenario = new StressScenario();
        component.scenario.impliedShockScenario.shockCorrelationsDate = '2024-05-01';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.shockCorrelationsDateValue).toBeDefined();
        expect(component.shockCorrelationsDateValue.date).toBe('05/01/2024');
    });

    it('test method onNoiseDampeningModeChanged', () => {
        expect(component.scenario.impliedShockScenario.noiseDampening).toBeUndefined();
        component.onNoiseDampeningModeChanged('LOW');
        expect(component.scenario.impliedShockScenario.noiseDampening).toEqual('LOW');
    });

    it('test method onImpliedShockUnitChanged', () => {
        expect(component.scenario.impliedShockScenario.impliedShockUnit).toEqual(ImpliedShockUnitEnum.FACTOR_SPECIFIC);
        expect(component.isDxsShockUnitReadOnly).toBeFalsy();

        // case 1: when changing from FACTOR_SPECIFIC to any other value
        component.onImpliedShockUnitChanged(ImpliedShockUnitEnum.FACTOR_LEVELS);
        expect(component.scenario.impliedShockScenario.impliedShockUnit).toEqual(ImpliedShockUnitEnum.FACTOR_LEVELS);
        expect(component.scenario.impliedShockScenario.dxsShockUnit).toEqual(ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD);
        expect(component.isDxsShockUnitReadOnly).toBeTruthy();

        // case 2: when changing from any other value to FACTOR_SPECIFIC
        component.onImpliedShockUnitChanged(ImpliedShockUnitEnum.FACTOR_SPECIFIC);
        expect(component.scenario.impliedShockScenario.impliedShockUnit).toEqual(ImpliedShockUnitEnum.FACTOR_SPECIFIC);
        expect(component.scenario.impliedShockScenario.dxsShockUnit).toEqual(ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD);
        expect(component.isDxsShockUnitReadOnly).toBeFalsy();
    });

    it('test method onRestrictImpliedShocksChanged', () => {
        expect(component.scenario.impliedShockScenario.restrictImpliedShocks).toEqual([]);
        component.onRestrictImpliedShocksChanged([ 'a', 'b' ]);
        expect(component.scenario.impliedShockScenario.restrictImpliedShocks).toEqual([ 'a', 'b' ]);
    });

    it('test method controlDxsShockUnit', () => {
        expect(component.isDxsShockUnitReadOnly).toBeFalsy();

        component.scenario.impliedShockScenario.dxsShockUnit = undefined;
        component.scenario.impliedShockScenario.impliedShockUnit = ImpliedShockUnitEnum.FACTOR_LEVELS;

        component['controlDxsShockUnit']();
        expect(component.isDxsShockUnitReadOnly).toBeTruthy();
        expect(component.scenario.impliedShockScenario.dxsShockUnit).toBeUndefined();
    });

    it('test validateStressScenario', () => {
        const validateEmitterSpy = jest.spyOn(component.scenarioValidatedEmitter, 'emit');

        // no columns present
        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        const col = new ColumnConfig();
        col.columnTag = 'col_tag';
        component.scenario.impliedShockScenario.columns.columns = [ col ];

        // no shockColumnOption present
        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        const shockColumnOption = new ShockSettingColumnOption();
        col.optionValues = [ shockColumnOption ];

        // no shock value (invalid)
        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        // set shock to 0 (invalid)
        shockColumnOption.shock = 0.0;

        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        // set valid shock
        shockColumnOption.shock = 0.78;

        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(true);

        const cols: ColumnConfig[] = [
            ColumnConfig.createColumn('MXEF', '', 'MXEF_1212'),
            ColumnConfig.createColumn('[@260557103]', '', 'custom_factor_tag_1232'),
            ColumnConfig.createColumn('[MXEF-@260557103]', '', 'custom_factor_tag_1235'),
            ColumnConfig.createColumn('[MXEF]', '', 'custom_factor_tag_1289'),
        ];
        cols.forEach(column => {
            column.optionValues = [ shockColumnOption ];
        });
        component.scenario.impliedShockScenario.columns.columns = cols;

        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        // remove duplicate factors MXEF
        component.scenario.impliedShockScenario.columns.columns.splice(-1, 1);

        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(false);

        // remove all storm factors
        component.scenario.impliedShockScenario.columns.columns.splice(1, 2);

        component['validateStressScenario']();
        expect(validateEmitterSpy).toHaveBeenLastCalledWith(true);
    });

    it('test method onShockCorrelationsDateEnabledCheckboxChanged', () => {
        expect(component.scenario.impliedShockScenario.isShockCorrelationsDateEnabled).toBeFalsy();
        component.onShockCorrelationsDateEnabledCheckboxChanged();
        expect(component.scenario.impliedShockScenario.isShockCorrelationsDateEnabled).toBeTruthy();
    });

    it('test method onShockCorrelationDateValueChanged', () => {
        const expectedDate = DateValue.newDate('01/31/2024');
        component.onShockCorrelationDateValueChanged(expectedDate);
        expect(component.scenario.impliedShockScenario.shockCorrelationsDate).toBe('01/31/2024');
    });

});
