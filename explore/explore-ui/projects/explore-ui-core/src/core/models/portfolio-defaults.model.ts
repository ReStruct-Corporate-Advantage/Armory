import {isObject} from 'lodash';

/**
 * contains the calendar code used to identify which holidays to use in the datePicker
 */
export class PortfolioDefaults {
    calendar: string;
    defaultVarType: string;
    defaultModelCode: string;
    defaultDecay: number;
    liquidityDefaults: {};

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    private deserialize(data: any) {
        if (!data) {
            return;
        }

        if (data.calendar) {
            this.calendar = data.calendar;
        }

        if (data.defaultDecay) {
            this.defaultDecay = data.defaultDecay;
        }

        if (data.defaultModelCode) {
            this.defaultModelCode = data.defaultModelCode;
        }

        if (data.defaultVarType) {
            this.defaultVarType = data.defaultVarType;
        }

        if (data.liquidityDefaults) {
            this.liquidityDefaults = data.liquidityDefaults;
        }
    }
}
