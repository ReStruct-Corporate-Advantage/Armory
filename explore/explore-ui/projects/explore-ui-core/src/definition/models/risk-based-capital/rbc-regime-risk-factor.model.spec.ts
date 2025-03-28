import {RbcRegimeRiskFactor} from './rbc-regime-risk-factor.model';
import {RBCTestUtils} from './rbc-regime-settings.model.spec';

/**
 * Tests for RbcRegimeRiskFactor
 */
describe('RbcRegimeRiskFactor', () => {
    let rbcRegimeRiskFactor: RbcRegimeRiskFactor;

    it('Test serialize/deserialize', () => {
        rbcRegimeRiskFactor = RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR');

        const serialized = rbcRegimeRiskFactor.serialize();
        const newRbcRegimeRiskFactor = new RbcRegimeRiskFactor();
        // Should not be equal
        expect(rbcRegimeRiskFactor.equals(newRbcRegimeRiskFactor)).toBeFalsy();

        newRbcRegimeRiskFactor.deserialize(serialized);
        expect(rbcRegimeRiskFactor.equals(newRbcRegimeRiskFactor)).toBeTruthy();
    });

    it('Test equals', () => {
        rbcRegimeRiskFactor = RBCTestUtils.createRbcRegimeRiskFactor('RISK_TYPE_INTEREST_RATE', 'Interest Rate SCR');
        expect(rbcRegimeRiskFactor.equals(null)).toBeFalsy();

        const otherRbcRegimeRiskFactor = new RbcRegimeRiskFactor();
        expect(rbcRegimeRiskFactor.equals(otherRbcRegimeRiskFactor)).toBeFalsy();
        otherRbcRegimeRiskFactor.riskFactorName = 'Interest Rate SCR';
        expect(rbcRegimeRiskFactor.equals(otherRbcRegimeRiskFactor)).toBeFalsy();
        otherRbcRegimeRiskFactor.riskFactorId = 'RISK_TYPE_INTEREST_RATE';
        expect(rbcRegimeRiskFactor.equals(otherRbcRegimeRiskFactor)).toBeTruthy();
    });
});
