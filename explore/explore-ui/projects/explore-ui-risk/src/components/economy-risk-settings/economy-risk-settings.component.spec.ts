import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreDefinitionStore, DateStore, DateValue, RiskParameter, WeightingSchemes} from '@blk/explore-ui-core';
import {BehaviorSubject, Subject} from 'rxjs';
import {CoreRiskConstants} from '../../core-risk.constants';
import {EconomySettings} from '../../models/economy-settings/economy-settings.model';
import {EconomyRiskSettingsComponent} from './economy-risk-settings.component';

describe('EconomyRiskSettingsComponent', () => {
    let component: EconomyRiskSettingsComponent;
    let fixture: ComponentFixture<EconomyRiskSettingsComponent>;

    beforeAll(() => {
        CoreDefinitionStore.weightingSchemes = [new WeightingSchemes({
            'defaultDecay': 0.917,
            'defaultPeriod': 104,
            'label': 'Weekly Short-Term Half-Life',
            'halfLifeLabel': 'weeks',
            'isHalfLifeModifiable': false,
            'isPeriodModifiable': true,
            'toolTip': 'Weekly Short-Term Half-Life',
            'name': 'WKS',
            'isCustomScheme': false,
            'displayName': 'Weekly Short-Term Half-Life'
        }), new WeightingSchemes({
            'defaultDecay': 0.982820599,
            'defaultPeriod': 252,
            'label': 'Daily User-Defined Half-Life',
            'halfLifeLabel': 'days',
            'isHalfLifeModifiable': true,
            'isPeriodModifiable': true,
            'toolTip': 'Daily User-Defined Half-Life',
            'name': 'DLY',
            'isCustomScheme': false,
            'displayName': 'Daily User-Defined Half-Life'
        }), new WeightingSchemes({
            'defaultDecay': 0.9867586943,
            'defaultOverlap': 1,
            'defaultPeriod': 312,
            'editableFields': ['mat_src', 'var_fi_eq'],
            'label': 'Fermi',
            'halfLifeLabel': 'weeks',
            'isHalfLifeModifiable': false,
            'isPeriodModifiable': false,
            'name': 'FMI',
            'toolTip': 'Fermi',
            'displayName': 'Fermi'
        })];
        CoreDefinitionStore.riskHorizon = [new RiskParameter({
            value: 1,
            text: 'One Day'
        }), new RiskParameter({
            value: 2,
            text: 'One Week'
        }), new RiskParameter({
            value: 4,
            text: 'One Year'
        })];

        DateStore.currentDate$ = new BehaviorSubject<DateValue>(new DateValue({
            date: '05/18/2020',
            calCode: 'GP_HK_STD'
        }));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EconomyRiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(EconomyRiskSettingsComponent);
        component = fixture.componentInstance;

        component.economyRiskSettings = new EconomySettings();
        component.economyRiskSettings.selectedPeriod = '6Y';
        component.economyRiskSettings.riskHorizon = 4;
        component.economyRiskSettings.weightingScheme = 'FMI';
        component.economyRiskSettings.dateObject = new DateValue({date: '05/18/2020', calCode: 'GP_HK_STD'});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('tests onEconomyDateChange', () => {
        expect(component.economyRiskSettings.dateObject).toEqual(new DateValue({
            date: '05/18/2020',
            calCode: 'GP_HK_STD'
        }));
        component.onEconomyDateChange(new DateValue({date: '05/17/2020', calCode: 'GP_HK_STD'}));
        expect(component.economyRiskSettings.dateObject).toEqual(new DateValue({
            date: '05/17/2020',
            calCode: 'GP_HK_STD'
        }));
    });

    it('tests onWeightingSchemeSelectionChanged', () => {
        const auxInputStub = {
            validate: jest.fn()
        } as any;
        component.decayFactor = auxInputStub;
        component.halfLifeInDays = auxInputStub;

        expect(component.economyRiskSettings.weightingScheme === 'FMI').toBeTruthy();
        expect(component.economyRiskSettings.decayFactor === 0.9867586943).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 52).toBeTruthy();
        expect(component.economyRiskSettings.period === 312).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '6Y').toBeTruthy();

        component.onWeightingSchemeSelectionChanged({
            detail: {
                value: {
                    value: 'WKS',
                    displayValue: 'Weekly Short-Term Half-Life'
                }
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.weightingScheme === 'WKS').toBeTruthy();
        expect(component.economyRiskSettings.decayFactor === 0.917).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 8).toBeTruthy();
        expect(component.economyRiskSettings.period === 104).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '2Y').toBeTruthy();

        component.economyRiskSettings.parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        (component.economyRiskSettings.parentRiskSettings as EconomySettings).weightingScheme = 'DLY';
        component.weightingSchemeReset();

        expect(component.economyRiskSettings.weightingScheme).toBe('DLY');
        expect(component.economyRiskSettings.decayFactor).toBe(0.982820599);
        expect(component.economyRiskSettings.halfLifeInDays).toBe(40);
        expect(component.economyRiskSettings.period).toBe(252);
        expect(component.economyRiskSettings.selectedPeriod).toBe('1Y');
    });

    it('tests onPeriodListSelectionChanged', () => {
        expect(component.economyRiskSettings.period === 312).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '6Y').toBeTruthy();

        component.onPeriodListSelectionChanged({
            detail: {
                value: {
                    value: '2Y'
                }
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.period === 104).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '2Y').toBeTruthy();
    });

    it('tests onPeriodChangedHandler', () => {
        expect(component.economyRiskSettings.period === 312).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '6Y').toBeTruthy();

        component.onPeriodChanged({
            detail: {
                value: '252'
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.period === 252).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === 'Other').toBeTruthy();

        component.onPeriodChanged({
            detail: {
                value: '364'
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.period === 364).toBeTruthy();
        expect(component.economyRiskSettings.selectedPeriod === '7Y').toBeTruthy();
    });

    it('tests onHalfLifeChangedHandler', () => {
        expect(component.economyRiskSettings.decayFactor === 0.9867586943).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 52).toBeTruthy();

        component.onHalfLifeChanged({
            detail: {
                srcEvent: {target: {value: '252'}}
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.decayFactor === 0.9972532).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 252).toBeTruthy();
    });

    it('tests onDecayChangedHandler', () => {
        expect(component.economyRiskSettings.decayFactor === 0.9867586943).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 52).toBeTruthy();

        component.onDecayChanged({
            detail: {
                srcEvent: {target: {value: '0.996'}}
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.decayFactor = 0.996).toBeTruthy();
        expect(component.economyRiskSettings.halfLifeInDays === 173).toBeTruthy();
    });

    it('tests onRiskHorizonSelectionChanged', () => {
        expect(component.economyRiskSettings.riskHorizon === 4).toBeTruthy();
        component.onRiskHorizonSelectionChanged({
            detail: {
                value: {
                    value: 2
                }
            }
        } as CustomEvent);
        expect(component.economyRiskSettings.riskHorizon === 2).toBeTruthy();

        component.economyRiskSettings.parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        (component.economyRiskSettings.parentRiskSettings as EconomySettings).riskHorizon = 1;
        component.riskHorizonReset();
        expect(component.economyRiskSettings.riskHorizon === 1).toBeTruthy();
    });

    it('tests onConfidenceLevelPercentChangedHandler', () => {
        expect(component.economyRiskSettings.confidenceLevelPercentage === 84).toBeTruthy();
        expect(component.economyRiskSettings.confidenceLevelSD === 1).toBeTruthy();

        component.confidenceLevelPercent = {
            setValue: jest.fn((value: string) => component.confidenceLevelPercent.value = value),
            value: '',
        } as any;

        component.onConfidenceLevelPercentChanged({
            detail: {
                srcEvent: {target: {value: '83'}}
            }
        } as CustomEvent);

        expect(component.economyRiskSettings.confidenceLevelPercentage === 83).toBeTruthy();
        expect(component.economyRiskSettings.confidenceLevelSD).toBe(0.954165);
    });

    it('tests onConfidenceLevelSDChangedHandler', () => {
        expect(component.economyRiskSettings.confidenceLevelPercentage === 84).toBeTruthy();
        expect(component.economyRiskSettings.confidenceLevelSD === 1).toBeTruthy();
        component.ngOnInit();

        component.sigmaValue = {
            setValue: jest.fn((value: string) => component.sigmaValue.value = value),
            value: '',
            validate: jest.fn()
        } as any;

        component.confidenceLevelPercent = {
            validate: jest.fn()
        } as any;

        component.onConfidenceLevelSDChanged({
            detail: {srcEvent: {target: {value: '0.908'}}}
        } as CustomEvent);

        expect(component.economyRiskSettings.confidenceLevelPercentage).toBe(81.8061);
        expect(component.economyRiskSettings.confidenceLevelSD === 0.908).toBeTruthy();

        component.confidenceLevelReset();

        expect(component.economyRiskSettings.confidenceLevelPercentage === 84).toBeTruthy();
        expect(component.economyRiskSettings.confidenceLevelSD === 1).toBeTruthy();
    });

    it('tests onOverlapChanged', () => {
        component.onOverlapChanged({
            detail: {
                value: 2
            }
        } as CustomEvent);
        expect(component.economyRiskSettings.overlap === 2).toBeTruthy();
        expect(component.economyRiskSettings.selectedOverlap === 2).toBeTruthy();

        component.economyRiskSettings.parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        (component.economyRiskSettings.parentRiskSettings as EconomySettings).overlap = 1;
        component.overlapReset();
        expect(component.economyRiskSettings.overlap === 1).toBeTruthy();

        component.setIsOverlapEnabled();
        expect(component.isOverlapEnabled).toBeFalsy();
    });
});
