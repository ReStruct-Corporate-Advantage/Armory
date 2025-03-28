import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RiskSettingsComponent} from './risk-settings.component';
import {CoreDefinitionStore ,DateValue, TokenConstants} from '@blk/explore-ui-core';
import {RiskSettings} from '../../models/risk-settings/risk-settings.model';
import {EconomySettings} from '../../models/economy-settings/economy-settings.model';
import {ExposureSettings} from '../../models/exposure-settings/exposure-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

describe('RiskSettingsComponent', () => {
    let component: RiskSettingsComponent;
    let fixture: ComponentFixture<RiskSettingsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(RiskSettingsComponent);
        component = fixture.componentInstance;
        component.riskSettings = new RiskSettings();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('update risk setting flag test case', () => {
        component.riskSettings.exposureRiskSettings = new ExposureSettings();
        component.riskSettings.economyRiskSettings = new EconomySettings();
        component.updateRiskSettingFlag();
        // risk setting always has riskMatrix by default as 1.
        // so initializing shouldn't change isRiskSettingChanged to true
        expect(component.isRiskSettingChanged).toBeFalsy();

        // change advance setting
        component.riskSettings.advancedRiskSettings.market = 'Anyvalue';
        component.updateRiskSettingFlag();
        expect(component.isRiskSettingChanged).toBeTruthy();
    });

    it('ngViewAfterInit test case', fakeAsync(() => {
        jest.spyOn(component, 'updateRiskSettingFlag').mockReturnValue({});
        component.ngAfterViewInit();
        tick();
        expect(component.updateRiskSettingFlag).toHaveBeenCalled();
    }));

    it('Resetting Economy Date', () => {
        component.economyRiskSettingsComponent.updatePeriodList = jest.fn();
        component.economyRiskSettingsComponent.refreshWeightingList = jest.fn();
        component.economyRiskSettingsComponent.refreshRiskHorizonList = jest.fn();
        component.exposureRiskSettingsComponent.refreshRiskModelList = jest.fn();

        const parentRiskSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        parentRiskSettings.dateObject = new DateValue({dateString: true, dateStringValue: 'T-1', calCode: 'UK'});
        component.riskSettings.economyRiskSettings.parentRiskSettings = new EconomySettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);

        component.resetRiskSettings();
        expect(component.economyRiskSettingsComponent.dateValueObject).toStrictEqual(parentRiskSettings.dateObject);
    });


    it('showFilterScalingOptions false', () => {
        expect(component.showFilterScalingOptions).toBeFalsy();
    });

    describe('test ngOnInit', () => {
        describe('RAS columns are enabled', () => {
            beforeEach(() => {
                CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ENABLE_RAS_HVAR_COLS] = 'Y';
            });
            it('portfolio level risk settings only show hvar settings', () => {
                component.ngOnInit();
                expect(component.showHVARSettings).toBeTruthy();
                expect(component.showTrimmedHVARSettings).toBeFalsy();
            });

            it('column level risk settings only show hvar settings', () => {
                component.showHVARSettings = true;
                component.ngOnInit();
                expect(component.showHVARSettings).toBeTruthy();
                expect(component.showTrimmedHVARSettings).toBeFalsy();
            });

            it('column level risk settings only show trimmed hvar settings', () => {
                component.showHVARSettings = false;
                component.showTrimmedHVARSettings = true;
                component.ngOnInit();
                expect(component.showHVARSettings).toBeFalsy();
                expect(component.showTrimmedHVARSettings).toBeTruthy();
            });
        });
    });
});
