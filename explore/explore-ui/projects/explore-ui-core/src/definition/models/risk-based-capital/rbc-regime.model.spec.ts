import {RBCTestUtils} from './rbc-regime-settings.model.spec';
import {RbcRegime} from './rbc-regime.model';

/**
 * Tests for RbcRegime
 */
describe('RbcRegime', () => {
    let rbcRegime: RbcRegime;

    it('Test serialize/deserialize', () => {
        rbcRegime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');

        const serialized = rbcRegime.serialize();
        const newRbcRegime = new RbcRegime();
        // Should not be equal
        expect(rbcRegime.equals(newRbcRegime)).toBeFalsy();

        newRbcRegime.deserialize(serialized);
        expect(rbcRegime.equals(newRbcRegime)).toBeTruthy();
    });

    it('Test equals', () => {
        rbcRegime = RBCTestUtils.createRbcRegime('REGIME_EU_SOLVII', 'Eu Solvency II');
        expect(rbcRegime.equals(null)).toBeFalsy();

        const otherRbcRegime = new RbcRegime();
        expect(rbcRegime.equals(otherRbcRegime)).toBeFalsy();
        otherRbcRegime.regimeName = 'Eu Solvency II';
        expect(rbcRegime.equals(otherRbcRegime)).toBeFalsy();
        otherRbcRegime.regimeId = 'REGIME_EU_SOLVII';
        expect(rbcRegime.equals(otherRbcRegime)).toBeTruthy();
    });
});
