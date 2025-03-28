import {isObject} from 'lodash';

/**
 * TelemetryComparisonModeTrackingParameters captures information related to comparison mode set by user.
 */
export class TelemetryComparisonModeTrackingParameters {
    // whether anchor portfolio was used or not
    anchorUsed: boolean;
    // number of Portfolios compared
    portfoliosCompared: number;
    // mapping of widgets to their count
    widgetsComparedCountMappings: Map<string, number>;
    // mapping of portfolio type to their count
    portfolioTypeCountMappings: Map<string, number>;
    // to check if current comparison config is being changed
    editMode: boolean;
    // to check whether the comparsion action was performed or cancelled
    changeApplied: boolean;

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
        this.anchorUsed = data.anchorUsed;
        this.portfoliosCompared = data.portfoliosCompared;
        this.widgetsComparedCountMappings = data.widgetsComparedCountMappings;
        this.portfolioTypeCountMappings = data.portfolioTypeCountMappings;
        this.changeApplied = data.changeApplied;
        this.editMode = data.editMode;
    }
}
