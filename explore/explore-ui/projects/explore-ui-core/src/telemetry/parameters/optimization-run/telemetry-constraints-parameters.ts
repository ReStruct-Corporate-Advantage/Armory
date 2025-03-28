import {isObject} from 'lodash';
import {TelemetrySectorConstraintDetailParameter} from './telemetry-sector-constraint-detail-parameter';
import {TelemetrySecurityConstraintDetailParameter} from './telemetry-security-constraint-parameter';
import {TelemetryPortfolioConstraintDetailParameter} from './telemetry-portfolio-constraint-parameter';
import {TelemetryFactorConstraintDetailParameter} from './telemetry-factor-constraint-parameter';

/**
 * TelemetryConstraintsParameters captures information related to all constraints while running optimization.
 */
export class TelemetryConstraintsParameters {
    securityConstraints: TelemetrySecurityConstraintDetailParameter[];
    sectorConstraints: TelemetrySectorConstraintDetailParameter[];
    portfolioConstraints: TelemetryPortfolioConstraintDetailParameter[];
    factorConstraints: TelemetryFactorConstraintDetailParameter[];

    /**
     * Constructor.
     */
    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Deserialize.
     */
    protected deserialize(data: any): void {
        // Get out of here if there is no data.
        if (!data) {
            return;
        }
        this.sectorConstraints = data.sectorConstraints;
        this.securityConstraints = data.securityConstraints;
        this.portfolioConstraints = data.portfolioConstraints;
        if (data.factorConstraints != null) {
            this.factorConstraints = data.factorConstraints;
        }
    }
}
