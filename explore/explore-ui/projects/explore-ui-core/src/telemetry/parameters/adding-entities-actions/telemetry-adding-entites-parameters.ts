import {isObject} from 'lodash';
import {ModellingColumn} from '../../enums/telemetry-modelling-columns-enum';
import {WayToAddSecurity} from '../../enums/telemetry-modelling-way-to-add-security-enum';
import {EntityType} from '../../enums/telemetry-explore-entity-type.enum';
import {ExplorePortfolioTypeEnum} from '../../enums';

/**
 * TelemetryAddEntitiesParameters captures information related to uploading security in custom portfolio panel.
 */
export class TelemetryAddEntitiesParameters {
    securitiesUploadedSuccessfully: number;
    securitiesFailedToUpload: number;
    modellingColumnUsed: ModellingColumn;
    wayToAddSecurity: WayToAddSecurity;
    addedEntityType: EntityType;
    basePortfolioType: ExplorePortfolioTypeEnum;
    addedPortfolioType: ExplorePortfolioTypeEnum;
    specificPortfolio: boolean;

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
        this.securitiesUploadedSuccessfully = data.securitiesUploadedSuccessfully;
        this.securitiesFailedToUpload = data.securitiesFailedToUpload;
        this.modellingColumnUsed = data.modellingColumnUsed;
        this.wayToAddSecurity = data.wayToAddSecurity;
        this.addedEntityType = data.addedEntityType;
        this.basePortfolioType = data.basePortfolioType;
        this.addedPortfolioType = data.addedPortfolioType;
        this.specificPortfolio = data.specificPortfolio;
    }
}
