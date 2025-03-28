import {ColumnFormat} from '@blk/explore-ui-core';

/**
 * Date Format model for column definitions
 */
export class DateFormat extends ColumnFormat {

    static CONFIG_TYPE = 'dateColumnFormat';
    /**
     * Date-Format field
     */
    value: string;
    label: string;

    /**
     * Constructor
     */
    constructor(data?: any) {
        super(data);
    }

    /**
     * Deserialize the give json object into this object
     */
    doDeserialize(data: any): void {
        this.value = data.value;
        this.label = data.label;
    }

    /**
     * ColumnFormat.getConfigType()
     */
    getConfigType(): string {
        return DateFormat.CONFIG_TYPE;
    }
}
