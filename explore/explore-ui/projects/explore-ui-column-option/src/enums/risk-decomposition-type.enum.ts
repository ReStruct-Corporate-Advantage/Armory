import {isNumber} from 'lodash';

/**
 * Risk Decomposition Type
 */
export enum RiskDecompositionType {
    XSR,
    XSR_SYS_RESID
}

export namespace RiskDecompositionType {

    /**
     * Get display name for given risk decomposition type
     * @param type enum
     */
    export function displayName(type: RiskDecompositionType): string {
        let label: string;
        switch (type) {
            case RiskDecompositionType.XSR:
                label = 'X-Sigma-Rho';
                break;
            case RiskDecompositionType.XSR_SYS_RESID:
                label = 'X-Sigma-Rho (Systematic/Residual)';
                break;
        }

        return label;
    }

    /**
     * Get risk decomposition types
     */
    export function values(): RiskDecompositionType[] {
        return Object.keys(RiskDecompositionType)
            .map(riskDecompositionType => RiskDecompositionType[riskDecompositionType])
            .filter(riskDecompositionType => isNumber(riskDecompositionType));
    }

    /**
     * Get risk decomposition type
     * @param type enum name
     */
    export function valueOf(type: string): RiskDecompositionType {
        return RiskDecompositionType[type];
    }

    /**
     * Get risk decomposition type name
     * @param type enum
     */
    export function name(type: RiskDecompositionType): string {
        return RiskDecompositionType[type];
    }
}
