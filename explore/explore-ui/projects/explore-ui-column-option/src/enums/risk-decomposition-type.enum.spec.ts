import {RiskDecompositionType} from './risk-decomposition-type.enum';

describe('Risk decompostion type test', () => {
    it('should get display name by risk decomposition type', () => {
        expect(RiskDecompositionType.displayName(RiskDecompositionType.XSR)).toBe('X-Sigma-Rho');
        expect(RiskDecompositionType.displayName(RiskDecompositionType.XSR_SYS_RESID)).toBe('X-Sigma-Rho (Systematic/Residual)');
    });

    it('should get all risk decomposition types', () => {
       const riskDecompositionTypes: RiskDecompositionType[] = RiskDecompositionType.values();
       expect(riskDecompositionTypes.length).toBe(2);
    });

    it('should get name of risk decomposition type', () => {
       expect(RiskDecompositionType.name(RiskDecompositionType.XSR)).toBe('XSR');
    });

    it('should get value of risk decomposition type', () => {
       expect(RiskDecompositionType.valueOf('XSR')).toBe(RiskDecompositionType.XSR);
    });
})
