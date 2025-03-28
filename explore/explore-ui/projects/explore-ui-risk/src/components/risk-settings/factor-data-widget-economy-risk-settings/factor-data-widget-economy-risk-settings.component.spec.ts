import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FactorDataWidgetEconomyRiskSettingsComponent } from './factor-data-widget-economy-risk-settings.component';
import {CoreDefinitionStore, DateStore, DateValue, RiskParameter, WeightingSchemes} from '@blk/explore-ui-core';
import {BehaviorSubject} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EconomySettings} from '../../../models/economy-settings/economy-settings.model';

describe('FactorDataWidgetEconomyRiskSettingsComponent', () => {
    let component: FactorDataWidgetEconomyRiskSettingsComponent;
    let fixture: ComponentFixture<FactorDataWidgetEconomyRiskSettingsComponent>;

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
            declarations: [FactorDataWidgetEconomyRiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FactorDataWidgetEconomyRiskSettingsComponent);
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
});
