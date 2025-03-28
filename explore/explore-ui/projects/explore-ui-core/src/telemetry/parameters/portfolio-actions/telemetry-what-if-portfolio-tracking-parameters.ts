import {isObject} from 'lodash';
import {ExplorePortfolioTypeEnum} from '../../enums';

/**
 * TelemetryWhatIfPortfolioTrackingParameters captures information related to what-if portfolios created by user.
 */
export class TelemetryWhatIfPortfolioTrackingParameters {
    typeOfPortfolio: ExplorePortfolioTypeEnum;
    hasOtherWhatIfs?: boolean;
    whatIfName?: string;
    favoriteType?: string;

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
        this.typeOfPortfolio = data.typeOfPortfolio;
        this.hasOtherWhatIfs = data.hasOtherWhatIfs;
        this.whatIfName = data.whatIfName;
        this.favoriteType = data.favoriteType;
    }
}
