import {ExploreModellingChangeLevel, ExplorePortfolioTypeEnum} from '../../enums';
import {isObject} from 'lodash';

/**
 * TelemetryCompositionChangeTrackingParameters captures information related to composition change done by user.
 */
export class TelemetryCompositionChangeTrackingParameters {
    modellingLevel: ExploreModellingChangeLevel;
    portfolioType: ExplorePortfolioTypeEnum;

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
        this.modellingLevel = data.modellingLevel;
        this.portfolioType = data.portfolioType;
    }
}
