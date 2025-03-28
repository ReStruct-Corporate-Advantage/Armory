import {isObject} from 'lodash';
import {ExplorePortfolioTypeEnum} from '../../enums';
import {TelemetryAddEntitiesParameters} from '../adding-entities-actions/telemetry-adding-entites-parameters';

/**
 * TelemetryWhatIfPortfolioTrackingParameters captures information related to custom portfolios created by user.
 */
export class TelemetryCustomPortfolioTrackingParameters extends TelemetryAddEntitiesParameters {
    typeOfPortfolio: ExplorePortfolioTypeEnum;
    isCalculateNavUsed = false;
    isSecuritiesCleared = false;
    hasOtherWhatIfs = false;
    addedPortfoliosTypeToCountMap: Map<string, number> = new Map();

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super(data);
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
        this.securitiesUploadedSuccessfully = data.securitiesUploadedSuccessfully;
        this.securitiesFailedToUpload = data.securitiesFailedToUpload;
        this.modellingColumnUsed = data.modellingColumnUsed;
        this.wayToAddSecurity = data.wayToAddSecurity;
        this.hasOtherWhatIfs = data.hasOtherWhatIfs;
        this.isCalculateNavUsed = data.isCalculateNavUsed;
        this.isSecuritiesCleared = data.isSecuritiesCleared;
        this.addedPortfoliosTypeToCountMap = data.addedPortfoliosTypeToCountMap;
    }
}
