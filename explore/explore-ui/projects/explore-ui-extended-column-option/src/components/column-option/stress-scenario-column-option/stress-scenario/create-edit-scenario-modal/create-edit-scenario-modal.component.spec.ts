import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CreateEditScenarioModalComponent} from './create-edit-scenario-modal.component';
import {StressScenario} from '../../../../../models/stress-scenario.model';
import {ScenarioTypeEnum} from '../../../../../enums/scenario-type.enum';
import {
    ColumnOptionFactory,
    TelemetryActionConstants,
    TelemetryService,
} from '@blk/explore-ui-core';
import {ImpliedShockUnitEnum} from '../../../../../enums/implied-shock-unit.enum';
import {ShockSettingColumnOption} from '../../../../../models/column-option/shock-setting-column-option.model';
import {ScenarioConstants} from '../../../../../constants/scenario.constant';

describe('CreateEditScenarioModalComponent', () => {
    let component: CreateEditScenarioModalComponent;
    let fixture: ComponentFixture<CreateEditScenarioModalComponent>;

    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(ShockSettingColumnOption.CONFIG_TYPE, ShockSettingColumnOption);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ CreateEditScenarioModalComponent ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CreateEditScenarioModalComponent);
        component = fixture.componentInstance;
        component.scenario = new StressScenario();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test method onScenarioTypeChanged', () => {
        expect(component.scenario.scenType).toEqual(ScenarioTypeEnum.IMPLIED_SHOCK);

        expect(component.promptDialog$.getValue()).toBeNull();
        component.onScenarioTypeChanged(ScenarioTypeEnum.IMPLIED_SHOCK);
        expect(component.promptDialog$.getValue()).toBeNull();

        component.onScenarioTypeChanged(ScenarioTypeEnum.SPECIFIED_SHOCK);
        expect(component.promptDialog$.getValue()).not.toBeNull();
    });

    it('test method closeDialog', () => {
        component.onScenarioTypeChanged(ScenarioTypeEnum.SPECIFIED_SHOCK);
        expect(component.promptDialog$.getValue()).not.toBeNull();
        component.closeDialog();
        expect(component.promptDialog$.getValue()).toBeNull();
    });

    it('test method onSaveAndAddClicked', () => {
        expect(component.validateScenario).toBeFalsy();
        component.onSaveAndAddClicked();
        expect(component.validateScenario).toBeTruthy();
    });

    describe('test for open save scenario modal', () => {
        it('test method validateScenarioHandler when valid scenario is not Date Range', () => {
            component.validateScenario = true;
            component['saveClicked'] = true;
            jest.spyOn(component, 'trackCreateScenarioTelemetry').mockImplementationOnce(jest.fn());
            expect(component.openSaveScenarioModal).toBeFalsy();
            component.validateScenarioHandler(true);
            expect(component.openSaveScenarioModal).toBeTruthy();
            expect(component.validateScenario).toBeFalsy();
            expect(component['saveClicked']).toBeFalsy();
        });


        it('test method validateScenarioHandler when valid scenario is Date Range', () => {
            component.validateScenario = true;
            component['saveClicked'] = true;
            component.scenario.scenType = ScenarioTypeEnum.DATE_RANGE;
            jest.spyOn(component, 'trackCreateScenarioTelemetry').mockImplementationOnce(jest.fn());
            jest.spyOn(component.modalClosed, 'emit');
            expect(component.openSaveScenarioModal).toBeFalsy();
            component.validateScenarioHandler(true);
            expect(component.modalClosed.emit).toHaveBeenCalledWith(true);
            expect(component.openSaveScenarioModal).toBeFalsy();
            expect(component.validateScenario).toBeFalsy();
            expect(component['saveClicked']).toBeFalsy();
        });
    });

    describe('test for view as specified scenario only for Implied and Date Range', () => {
        it('test method validateScenarioHandler', () => {
            component.validateScenario = true;
            component['viewAsSpecifiedClicked'] = true;
            expect(component.scenarioType).toEqual(ScenarioTypeEnum.IMPLIED_SHOCK);
            component.validateScenarioHandler(true);
            expect(component.scenario.convertToSpecifiedShock).toBeTruthy();
            expect(component.scenario.convertFromScenario).toEqual(ScenarioTypeEnum.IMPLIED_SHOCK);
            expect(component.scenarioType).toEqual(ScenarioTypeEnum.SPECIFIED_SHOCK);
            expect(component.validateScenario).toBeFalsy();
            expect(component['viewAsSpecifiedClicked']).toBeFalsy();
        });
    });

    it('test method validateScenarioHandler when invalid scenario', () => {
        component.validateScenario = true;
        expect(component.openSaveScenarioModal).toBeFalsy();
        component.validateScenarioHandler(false);
        expect(component.openSaveScenarioModal).toBeFalsy();
        expect(component.validateScenario).toBeFalsy();
    });

    it('test method closeSaveScenarioModal', () => {
        component.openSaveScenarioModal = true;
        expect(component.openSaveScenarioModal).toBeTruthy();
        component.closeSaveScenarioModal(true);
        expect(component.openSaveScenarioModal).toBeFalsy();
    });

    describe('track telemetry for scenario creation', () => {
        let telemetryTrackSpy: jest.SpyInstance;

        beforeEach(() => {
            telemetryTrackSpy = jest.spyOn(TelemetryService, 'track');
        });

        it('should track telemetry for IMPLIED_SHOCK scenario', () => {
            component['oldScenario'] = new StressScenario({
                scenType: ScenarioTypeEnum.IMPLIED_SHOCK,
                impliedShocks: [
                    {
                        columnTag: 'USD_3m',
                        columnKey: 'USD_3m_55c1dd2e8295423',
                        shockSettings: {
                            shock: 15.89,
                            restrictImpliedShocks: 'a,b'
                        }
                    }
                ]
            });
            component.scenario = new StressScenario({
                scenType: ScenarioTypeEnum.IMPLIED_SHOCK,
                noiseDampening: 'LOW',
                shockCorrelationsDate: '03/12/2021',
                restrictImpliedShocks: 'x,y',
                impliedShockUnit: ImpliedShockUnitEnum.DXS_FACTOR_PCT_SPREAD,
                impliedShocks: [
                    {
                        columnTag: 'USD_3m',
                        columnKey: 'USD_3m_55c1dd2e829545d',
                        shockSettings: {
                            shock: 12.4,
                            restrictImpliedShocks: 'a,b'
                        }
                    }
                ]
            });

            component['trackCreateScenarioTelemetry']();

            const expectedParams = {
                'scenarioType': 'ImpliedShock',
                'dxsShockUnit': 'PERCENTAGE_OF_SPREAD',
                'impliedShockUnit': 'FACTOR_SPECIFIC',
                'restrictImpliedShock': 'x,y',
                'noiseDampening': 'LOW',
                'shockCorrelationsDateEnabled': true,
                'factorColumnsList': [
                    {
                        'factorKey': 'USD_3m_55c1dd2e829545d',
                        'factorTag': 'USD_3m',
                        'shockSettingsChanged': true
                    }
                ]
            };

            expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.COLUMN.STRESS_SCENARIO_CREATION, expectedParams);
        });

        it('should track telemetry for Specified_SHOCK scenario', () => {
            component.scenario = new StressScenario({
                scenType: ScenarioTypeEnum.SPECIFIED_SHOCK,
                dxsShockUnit: ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD,
            });
            component.scenario.convertToSpecifiedShock = true;

            component['trackCreateScenarioTelemetry']();

            const expectedParams = {
                'scenarioType': 'SpecifiedShock',
                'dxsShockUnit': 'PERCENTAGE_OF_SPREAD',
                'createNewSpecifiedScenario': false
            };

            expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.COLUMN.STRESS_SCENARIO_CREATION, expectedParams);
        });

        it('should track telemetry for Date Range scenario', () => {
            component.scenario = new StressScenario({
                scenType: ScenarioTypeEnum.DATE_RANGE,
                dxsShockUnit: ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD,
                startDate: '10/30/2020',
                forDate: '01/01/2021',
                holdingPeriodOverride: 5,
            });

            component['trackCreateScenarioTelemetry'](true);

            const expectedParams = {
                'scenarioType': 'DateRange',
                'viewedAsSpecifiedShock': true,
                'dxsShockUnit': 'PERCENTAGE_OF_SPREAD',
                'startDate': '10/30/2020',
                'endDate': '01/01/2021',
                'holdingPeriodOverride': 5
            };

            expect(telemetryTrackSpy).toHaveBeenCalledWith(TelemetryActionConstants.COLUMN.STRESS_SCENARIO_CREATION, expectedParams);
        });
    });
});
