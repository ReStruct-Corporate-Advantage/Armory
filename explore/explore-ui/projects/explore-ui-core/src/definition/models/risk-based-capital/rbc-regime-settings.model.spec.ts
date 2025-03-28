import {RbcRegimeSettings} from './rbc-regime-settings.model';
import {RbcRegime} from './rbc-regime.model';
import {RbcRegimeRiskFactor} from './rbc-regime-risk-factor.model';

/**
 * Tests for RbcRegimeSettings
 */
describe('RbcRegimeSettings', () => {
    let rbcRegimeSettings: RbcRegimeSettings;

    it('Should initialize a new RBC Regime Settings object', () => {
        rbcRegimeSettings = new RbcRegimeSettings();
        expect(rbcRegimeSettings.riskFactors).toEqual([]);
    });

    it('Test serialize/deserialize', () => {
        rbcRegimeSettings = new RbcRegimeSettings();
        rbcRegimeSettings.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        rbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));
        rbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_EQUITY', 'Equity SCR'));

        const serialized = rbcRegimeSettings.serialize();
        const newRbcRegimeSettings = new RbcRegimeSettings();
        // Should not be equal
        expect(rbcRegimeSettings.equals(newRbcRegimeSettings)).toBeFalsy();

        newRbcRegimeSettings.deserialize(serialized);
        expect(rbcRegimeSettings.equals(newRbcRegimeSettings)).toBeTruthy();
    });

    it('Test equals', () => {
        rbcRegimeSettings = new RbcRegimeSettings();
        rbcRegimeSettings.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        rbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));
        rbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_EQUITY', 'Equity SCR'));
        expect(rbcRegimeSettings.equals(null)).toBeFalsy();

        const otherRbcRegimeSettings = new RbcRegimeSettings();
        expect(rbcRegimeSettings.equals(otherRbcRegimeSettings)).toBeFalsy();
        otherRbcRegimeSettings.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        expect(rbcRegimeSettings.equals(otherRbcRegimeSettings)).toBeFalsy();
        otherRbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));
        expect(rbcRegimeSettings.equals(otherRbcRegimeSettings)).toBeFalsy();
        otherRbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_EQUITY', 'Equity SCR'));
        expect(rbcRegimeSettings.equals(otherRbcRegimeSettings)).toBeTruthy();
    });

    it('Test isValid', () => {
        rbcRegimeSettings = new RbcRegimeSettings();
        expect(rbcRegimeSettings.isValid()).toBeFalsy();
        rbcRegimeSettings.regime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        expect(rbcRegimeSettings.isValid()).toBeFalsy();
        rbcRegimeSettings.riskFactors.push(RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR'));
        expect(rbcRegimeSettings.isValid()).toBeTruthy();
    });
});

export class RBCTestUtils {
    public static createRbcRegime(regimeId: string, regimeName: string): RbcRegime {
        const regime = new RbcRegime();
        regime.regimeName = regimeName;
        regime.regimeId = regimeId;
        return regime;
    }

    public static createRbcRegimeRiskFactor(riskFactorId: string, riskFactorName: string): RbcRegimeRiskFactor {
        const riskFactor = new RbcRegimeRiskFactor();
        riskFactor.riskFactorName = riskFactorName;
        riskFactor.riskFactorId = riskFactorId;
        return riskFactor;
    }
}
