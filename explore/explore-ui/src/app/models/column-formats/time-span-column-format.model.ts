import {ColumnFormat} from '@blk/explore-ui-core';

/**
 * Numeric Column format for column definitions
 */
export class TimeSpanColumnFormat extends ColumnFormat {
    static CONFIG_TYPE = 'timeSpanColumnFormat';
    displayType: string;
    decimalPlaces: number;
    daysCutOff: number;
    monthsCutOff: number;
    formatString: string;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Deserialize json into this object
     */
    doDeserialize(data: any) {
        this.displayType = data.displayType;
        this.decimalPlaces = data.decimalPlaces;
        this.daysCutOff = data.daysCutOff;
        this.monthsCutOff = data.monthsCutOff;
        this.formatString = data.formatString;
    }

    /**
     * ColumnFormat.getConfigType()
     */
    getConfigType(): string {
        return TimeSpanColumnFormat.CONFIG_TYPE;
    }
}
