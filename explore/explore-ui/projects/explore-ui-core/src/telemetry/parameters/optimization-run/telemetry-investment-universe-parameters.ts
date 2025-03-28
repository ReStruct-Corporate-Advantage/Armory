import {isObject} from 'lodash';
import {TelemetryInvestmentUniverseTypeParameters} from './telemetry-investment-universe-type-parameters';

/**
 *  TelemetryInvestmentUniverseParameters captures information related to investment universe items added by user.
 */
export class TelemetryInvestmentUniverseParameters {
    workspaceId: number|string;
    requestId: string;
    investmentUniverseTypeAndNamesList: TelemetryInvestmentUniverseTypeParameters[];

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
        this.workspaceId = data.workspaceId;
        this.requestId = data.requestId;
        this.investmentUniverseTypeAndNamesList = data.investmentUniverseTypeAndNamesList;
    }
}
