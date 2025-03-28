import {ExplorePortfolioFavoriteTypeEnum, ExplorePortfolioTypeEnum} from '../../enums';
import {isObject} from 'lodash';


/**
 * LoadPortfolioTypeParameters serves to capture the data inputs needed for
 * portfolio loading related tracking in telemetry.
 */

export class TelemetryLoadPortfolioTypeParameters {
    /**
     * Whether a favorite is personal or shared
     */
    typeOfFavorite: ExplorePortfolioFavoriteTypeEnum;

    /**
     * Name of loaded favorite
     */
    whatIfName: string;

    /**
     * Type of loaded portfolio
     */
    whatIfPortfolioType: ExplorePortfolioTypeEnum;

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
        this.typeOfFavorite = data.typeOfFavorite;
        this.whatIfPortfolioType = data.whatIfPortfolioType;
        this.whatIfName = data.whatIfName;
    }
}
