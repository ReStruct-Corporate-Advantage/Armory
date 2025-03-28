import {RbcRegimeSettingsColumnOption} from './rbc-regime-settings-column-option.model';
import {NotificationType, RbcRegimeSettings} from '@blk/explore-ui-core';
import {RBCTestUtils} from '../../../../explore-ui-core/src/definition/models/risk-based-capital/rbc-regime-settings.model.spec';

/**
 * Tests for RbcRegimeSettingsColumnOption class
 */
describe('RbcRegimeSettingsColumnOption', () => {
    const columnOption = new RbcRegimeSettingsColumnOption();
    columnOption.regimeSelection = new RbcRegimeSettings();
    columnOption.regimeSelection.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
    columnOption.regimeSelection.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));

    it('Test configType', () => {
        expect(columnOption.configType).toEqual(RbcRegimeSettingsColumnOption.CONFIG_TYPE);
    });

    it('Test doAddRequestParams', () => {
        const requestParams: any = {};
        columnOption.doAddRequestParams(requestParams);
        expect(requestParams.rbcRegime).toBeDefined();
    });

    it('Test serialize/deserialize', () => {
        const serialized = columnOption.serialize();
        const deserialized = new RbcRegimeSettingsColumnOption(serialized);
        expect(columnOption.equals(deserialized)).toBeTruthy();
    });

    it('Test isValidColumnOption', () => {
        const validationInfo = new RbcRegimeSettingsColumnOption().isValidColumnOption();
        expect(validationInfo.notificationType).toEqual(NotificationType.ERROR);
        expect(validationInfo.message).toEqual(RbcRegimeSettingsColumnOption.INVALID_RBC_REGIME_SETTINGS_MESSAGE);
    });

    it('Test getModifiedWidgetTitleDetails', () => {
        columnOption.regimeSelection = null;
        expect(columnOption.getModifiedWidgetTitleDetails()).toEqual('');
        columnOption.regimeSelection = new RbcRegimeSettings();
        columnOption.regimeSelection.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        columnOption.regimeSelection.isRegimeOnly = true;
        expect(columnOption.getModifiedWidgetTitleDetails()).toEqual('(Eu Solvency II)');
        columnOption.regimeSelection.isRegimeOnly = false;
        columnOption.regimeSelection.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));
        expect(columnOption.getModifiedWidgetTitleDetails()).toEqual('(Eu Solvency II) Interest Rate SCR');
    });
});
