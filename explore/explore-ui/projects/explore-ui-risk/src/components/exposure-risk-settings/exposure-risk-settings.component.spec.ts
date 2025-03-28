import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CoreDefinitionStore, RiskModel} from '@blk/explore-ui-core';
import {Subject} from 'rxjs';
import {ExposureSettings} from '../../models/exposure-settings/exposure-settings.model';
import {ExposureRiskSettingsComponent} from './exposure-risk-settings.component';
import {CoreRiskConstants} from '../../core-risk.constants';

describe('ExposureRiskSettingsComponent', () => {
    let component: ExposureRiskSettingsComponent;
    let fixture: ComponentFixture<ExposureRiskSettingsComponent>;

    beforeAll(() => {
        CoreDefinitionStore.riskModelList = [new RiskModel({
            Value: 'DEFAULT',
            Label: 'Organization Default'
        }), new RiskModel({
            Value: '^EMEAA',
            Label: 'BFRE Europe, Mid East & Africa'
        }), new RiskModel({
            Value: '^USAMA',
            Label: 'BFRE US Equity'
        })];
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExposureRiskSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(ExposureRiskSettingsComponent);
        component = fixture.componentInstance;
        component.exposureRiskSettings = new ExposureSettings();
        component.exposureRiskSettings.parentRiskSettings = new ExposureSettings();
        (component.exposureRiskSettings.parentRiskSettings as ExposureSettings).riskModel = '^APWDA';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('tests onRiskModelSelectionChanged - value picked from parent', () => {
        const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentExposureRiskSettings.riskModel = 'b';
        component.exposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, 'name2');
        expect(component.exposureRiskSettings.riskModel === 'b').toBeTruthy();
        component.onRiskModelSelectionChanged({'detail': {'value': 'b'}} as CustomEvent);
        expect(component.exposureRiskSettings.riskModel === 'b').toBeTruthy();
    });

    it('tests onRiskModeSelectionChanged - value picked from same level', () => {
        const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentExposureRiskSettings.riskModel = 'b';
        component.exposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, 'name2');
        expect(component.exposureRiskSettings.riskModel === 'b').toBeTruthy();
        component.onRiskModelSelectionChanged({detail: {value: {value: 'c'}}} as CustomEvent);
        expect(component.exposureRiskSettings.riskModel === 'c').toBeTruthy();
    });

    it('tests riskModelReset - picks reset from parent', () => {
        const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentExposureRiskSettings.riskModel = '^USAMA';
        component.exposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, 'name1');
        component.exposureRiskSettings.riskModel = '^EMEAA';
        expect(component.exposureRiskSettings.riskModel === '^EMEAA').toBeTruthy();
        component.riskModelReset();
        expect(component.exposureRiskSettings.riskModel === '^USAMA').toBeTruthy();
    });

    /**
     * Test checkGPDefault
     */
    it('Test checkGPDefault', function () {
        // GIVEN
        const defaultRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT);
        const parentRiskSettings = new ExposureSettings(defaultRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        component.exposureRiskSettings = new ExposureSettings(parentRiskSettings, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORTFOLIO);
        parentRiskSettings.riskModel = '^JAPNA';

        // WHEN
        component.riskModels = [
            new RiskModel({
                'Value': 'DEFAULT',
                'Label': 'Organization Default'
            }), new RiskModel({'Value': '^^STORM,^PRT_FI', 'Label': 'STORM for Equity'}), new RiskModel({
                'Value': '^^STMNLT,^PRT_FI',
                'Label': 'STORM (No Look Through)'
            }), new RiskModel({'Value': '^NAMRA', 'Label': 'BFRE North America Equity'}), new RiskModel({
                'Value': '^JAPNA',
                'Label': 'BFRE Japan Equity'
            }), new RiskModel({'Value': '^EMEAA', 'Label': 'BFRE Europe, Mid East & Africa'}), new RiskModel({
                'Value': '^LATCA',
                'Label': 'BFRE Latin America Equity'
            }), new RiskModel({'Value': '^APXJA', 'Label': 'BFRE Asia Pacific Ex Japan'}), new RiskModel({
                'Value': '^WRLDA',
                'Label': 'BFRE World Equity'
            }), new RiskModel({'Value': '^UKINA', 'Label': 'BFRE UK Equity'}), new RiskModel({
                'Value': '^AUSTA',
                'Label': 'BFRE Aust Equity'
            }), new RiskModel({'Value': '^CANDA', 'Label': 'BFRE Canada Equity'}), new RiskModel({
                'Value': '^USAMA',
                'Label': 'BFRE US Equity'
            }), new RiskModel({'Value': '^EMKTA', 'Label': 'BFRE EM Equity'}), new RiskModel({
                'Value': '^NAMHA',
                'Label': 'STORM 2.0 North America Equity'
            }), new RiskModel({'Value': '^JAPHA', 'Label': 'STORM 2.0 Japan Equity'}), new RiskModel({
                'Value': '^EMEHA',
                'Label': 'STORM 2.0 Europe, Mid East & Africa'
            }), new RiskModel({'Value': '^LATHA', 'Label': 'STORM 2.0 Latin America Equity'}), new RiskModel({
                'Value': '^APXHA',
                'Label': 'STORM 2.0 Asia Pacific Ex Japan'
            }), new RiskModel({'Value': '^UKIHA', 'Label': 'STORM 2.0 UK Equity'})
        ];

        const expectedRiskModels = [new RiskModel({'Value': '^JAPNA', 'Label': 'GP Default (^JAPNA)'}),
            new RiskModel({
                'Value': 'DEFAULT',
                'Label': 'Organization Default'
            }), new RiskModel({'Value': '^^STORM,^PRT_FI', 'Label': 'STORM for Equity'}), new RiskModel({
                'Value': '^^STMNLT,^PRT_FI',
                'Label': 'STORM (No Look Through)'
            }), new RiskModel({'Value': '^NAMRA', 'Label': 'BFRE North America Equity'}), new RiskModel({
                'Value': '^JAPNA',
                'Label': 'BFRE Japan Equity'
            }), new RiskModel({'Value': '^EMEAA', 'Label': 'BFRE Europe, Mid East & Africa'}), new RiskModel({
                'Value': '^LATCA',
                'Label': 'BFRE Latin America Equity'
            }), new RiskModel({'Value': '^APXJA', 'Label': 'BFRE Asia Pacific Ex Japan'}), new RiskModel({
                'Value': '^WRLDA',
                'Label': 'BFRE World Equity'
            }), new RiskModel({'Value': '^UKINA', 'Label': 'BFRE UK Equity'}), new RiskModel({
                'Value': '^AUSTA',
                'Label': 'BFRE Aust Equity'
            }), new RiskModel({'Value': '^CANDA', 'Label': 'BFRE Canada Equity'}), new RiskModel({
                'Value': '^USAMA',
                'Label': 'BFRE US Equity'
            }), new RiskModel({'Value': '^EMKTA', 'Label': 'BFRE EM Equity'}), new RiskModel({
                'Value': '^NAMHA',
                'Label': 'STORM 2.0 North America Equity'
            }), new RiskModel({'Value': '^JAPHA', 'Label': 'STORM 2.0 Japan Equity'}), new RiskModel({
                'Value': '^EMEHA',
                'Label': 'STORM 2.0 Europe, Mid East & Africa'
            }), new RiskModel({'Value': '^LATHA', 'Label': 'STORM 2.0 Latin America Equity'}), new RiskModel({
                'Value': '^APXHA',
                'Label': 'STORM 2.0 Asia Pacific Ex Japan'
            }), new RiskModel({'Value': '^UKIHA', 'Label': 'STORM 2.0 UK Equity'})
        ];

        component.checkGPDefault();

        // THEN
        expect(JSON.stringify(component.riskModels)).toEqual(JSON.stringify(expectedRiskModels));

        // WHEN
        parentRiskSettings.riskModel = null;
        defaultRiskSettings.riskModel = '^JAPNA';

        component.riskModels = [new RiskModel({
            'Value': 'DEFAULT',
            'Label': 'Organization Default'
        }), new RiskModel({'Value': '^^STORM,^PRT_FI', 'Label': 'STORM for Equity'}), new RiskModel({
            'Value': '^^STMNLT,^PRT_FI',
            'Label': 'STORM (No Look Through)'
        }), new RiskModel({'Value': '^NAMRA', 'Label': 'BFRE North America Equity'}), new RiskModel({
            'Value': '^JAPNA',
            'Label': 'BFRE Japan Equity'
        }), new RiskModel({'Value': '^EMEAA', 'Label': 'BFRE Europe, Mid East & Africa'}), new RiskModel({
            'Value': '^LATCA',
            'Label': 'BFRE Latin America Equity'
        }), new RiskModel({'Value': '^APXJA', 'Label': 'BFRE Asia Pacific Ex Japan'}), new RiskModel({
            'Value': '^WRLDA',
            'Label': 'BFRE World Equity'
        }), new RiskModel({'Value': '^UKINA', 'Label': 'BFRE UK Equity'}), new RiskModel({
            'Value': '^AUSTA',
            'Label': 'BFRE Aust Equity'
        }), new RiskModel({'Value': '^CANDA', 'Label': 'BFRE Canada Equity'}), new RiskModel({
            'Value': '^USAMA',
            'Label': 'BFRE US Equity'
        }), new RiskModel({'Value': '^EMKTA', 'Label': 'BFRE EM Equity'}), new RiskModel({
            'Value': '^NAMHA',
            'Label': 'STORM 2.0 North America Equity'
        }), new RiskModel({'Value': '^JAPHA', 'Label': 'STORM 2.0 Japan Equity'}), new RiskModel({
            'Value': '^EMEHA',
            'Label': 'STORM 2.0 Europe, Mid East & Africa'
        }), new RiskModel({'Value': '^LATHA', 'Label': 'STORM 2.0 Latin America Equity'}), new RiskModel({
            'Value': '^APXHA',
            'Label': 'STORM 2.0 Asia Pacific Ex Japan'
        }), new RiskModel({'Value': '^UKIHA', 'Label': 'STORM 2.0 UK Equity'})];

        const expectedRiskModels2 = [new RiskModel({
            'Value': '^JAPNA',
            'Label': 'Organization Default'
        }), new RiskModel({'Value': '^^STORM,^PRT_FI', 'Label': 'STORM for Equity'}), new RiskModel({
            'Value': '^^STMNLT,^PRT_FI',
            'Label': 'STORM (No Look Through)'
        }), new RiskModel({'Value': '^NAMRA', 'Label': 'BFRE North America Equity'}), new RiskModel({
            'Value': '^JAPNA',
            'Label': 'BFRE Japan Equity'
        }), new RiskModel({'Value': '^EMEAA', 'Label': 'BFRE Europe, Mid East & Africa'}), new RiskModel({
            'Value': '^LATCA',
            'Label': 'BFRE Latin America Equity'
        }), new RiskModel({'Value': '^APXJA', 'Label': 'BFRE Asia Pacific Ex Japan'}), new RiskModel({
            'Value': '^WRLDA',
            'Label': 'BFRE World Equity'
        }), new RiskModel({'Value': '^UKINA', 'Label': 'BFRE UK Equity'}), new RiskModel({
            'Value': '^AUSTA',
            'Label': 'BFRE Aust Equity'
        }), new RiskModel({'Value': '^CANDA', 'Label': 'BFRE Canada Equity'}), new RiskModel({
            'Value': '^USAMA',
            'Label': 'BFRE US Equity'
        }), new RiskModel({'Value': '^EMKTA', 'Label': 'BFRE EM Equity'}), new RiskModel({
            'Value': '^NAMHA',
            'Label': 'STORM 2.0 North America Equity'
        }), new RiskModel({'Value': '^JAPHA', 'Label': 'STORM 2.0 Japan Equity'}), new RiskModel({
            'Value': '^EMEHA',
            'Label': 'STORM 2.0 Europe, Mid East & Africa'
        }), new RiskModel({'Value': '^LATHA', 'Label': 'STORM 2.0 Latin America Equity'}), new RiskModel({
            'Value': '^APXHA',
            'Label': 'STORM 2.0 Asia Pacific Ex Japan'
        }), new RiskModel({'Value': '^UKIHA', 'Label': 'STORM 2.0 UK Equity'})];

        component.checkGPDefault();

        // THEN
        expect(JSON.stringify(component.riskModels)).toEqual(JSON.stringify(expectedRiskModels2));
    });


    it('tests onOtherRiskModelChange', () => {
        const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentExposureRiskSettings.riskModel = 'ABCD';
        component.exposureRiskSettings = new ExposureSettings(parentExposureRiskSettings, 'name2');
        expect(component.exposureRiskSettings.riskModel === 'ABCD').toBeTruthy();
        component.onOtherRiskModelChange({'detail': {'value': 'DEFG'}} as CustomEvent);
        expect(component.exposureRiskSettings.riskModel === 'DEFG').toBeTruthy();
    });

    it('tests refreshRiskModelList', () => {
        const parentExposureRiskSettings = new ExposureSettings(undefined, CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT);
        parentExposureRiskSettings.riskModel = 'ABCD';
        component.exposureRiskSettings = parentExposureRiskSettings;
        component.refreshRiskModelList();
        expect(component.riskModelList[0].values.length).toBe(4);
        expect(component.riskModelList[0].values[component.riskModelList[0].values.length - 1].isSelected).toBeTruthy();
    });

});
