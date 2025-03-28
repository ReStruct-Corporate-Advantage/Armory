import {isObject} from 'lodash';
import {TypeInInvestmentUniverse} from '../../enums/telemetry-investment-universe-type.enum';

/**
 * TelemetryInvestmentUniverseTypeParameters captures information related to investment universe items added by user.
 */
export class TelemetryInvestmentUniverseTypeParameters{
    investmentUniverseType:TypeInInvestmentUniverse;
    name:string;

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
        this.investmentUniverseType=data.investmentUniverseType;
        this.name=data.name;
    }
}
