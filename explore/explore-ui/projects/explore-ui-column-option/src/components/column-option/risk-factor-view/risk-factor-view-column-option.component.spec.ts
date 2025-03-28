import {RiskFactorViewColumnOptionComponent} from './risk-factor-view-column-option.component';
import {RiskSettings, CoreRiskConstants} from '@blk/explore-ui-risk';
import {ColumnOptionTestBed} from '../../../test-utils/column-option-test-bed.testutil';

describe('RiskFactorViewComponent', () => {
    let testBed: ColumnOptionTestBed<RiskFactorViewColumnOptionComponent, RiskSettings>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'Risk Settings',
            columnOptionAttributes: [
                {title: 'Depends on Economy', key: 'DEPENDS-ON-ECONOMY'},
                {title: 'Depends on Exposure', key: 'DEPENDS-ON-EXPOSURE'},
                {title: 'HVAR', key: 'SHOW-HVAR-SETTINGS'},
                {title: 'HVAR Trimmed', key: 'SHOW-HVAR-SETTINGS-TRIMMED'}
            ],
            columnOptionConfigType: 'riskSettings'
        };

        CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN = 'Column';

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<RiskFactorViewColumnOptionComponent, RiskSettings>(RiskFactorViewColumnOptionComponent, new RiskSettings(), mockedOption);
    });

    it('Validate init of the component', () => {
        // Should have the variables defined.
        expect(testBed.component.dependsOnExposure).toBeTruthy();
        expect(testBed.component.dependsOnEconomy).toBeTruthy();
        expect(testBed.component.showHVARSettings).toBeTruthy();
        expect(testBed.component.showTrimmedHVARSettings).toBeTruthy();
        expect(testBed.component.optionValue.economyRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        expect(testBed.component.optionValue.exposureRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
        expect(testBed.component.optionValue.advancedRiskSettings.name).toBe(CoreRiskConstants.RISK_SETTINGS_HIERARCHY_TYPE.COLUMN);
    });
});
