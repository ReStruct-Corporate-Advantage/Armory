import {Setting} from '../../../core/models/setting.model';

/**
 * Base for all types of column formats
 */
export abstract class ColumnFormat extends Setting {

    /**
     * Constructor
     */
    protected constructor(data?: any) {
        super(data);
    }

    /**
     * Return the config type of the column format
     */
    abstract getConfigType(): string;
}


