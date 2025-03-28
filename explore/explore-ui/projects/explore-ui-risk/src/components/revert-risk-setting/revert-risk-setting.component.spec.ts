import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RevertRiskSettingComponent} from './revert-risk-setting.component';
import {EconomySettings} from '../../models/economy-settings/economy-settings.model';
import {CoreRiskConstants} from '../../core-risk.constants';

describe('RevertRiskSettingComponent', () => {
    let component: RevertRiskSettingComponent;
    let fixture: ComponentFixture<RevertRiskSettingComponent>;

    beforeEach(() => {
        const parentSettings = new EconomySettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentSettings.overlap = 2;
        const childSettings = new EconomySettings(parentSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.WIDGET);

        TestBed.configureTestingModule({
            declarations: [RevertRiskSettingComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(RevertRiskSettingComponent);
        component = fixture.componentInstance;
        component.riskSetting = childSettings;
        component.propertyName = CoreRiskConstants.ECONOMY_SETTINGS_PROPERTIES.OVERLAP;
        fixture.detectChanges();
    });

    it('should initialize parent source', () => {
        expect(component).toBeTruthy();
        expect(component.tooltip).toEqual('Return to Portfolio (Default):');
    });
});
