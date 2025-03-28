import {ColumnDefinition} from './column-definition.model';

/**
 * This class is used to model and create ishare definition objects.
 * It is extending ColumnDefinition class so that we can reuse the column selector
 * component and tree creation logic already present.
 *
 * Mapping of ishare fields to column definition objects is as follows:
 * ticker - colTag
 * name - title
 * cusip - cusip
 * hierarchy of ishares - groups
 */
export class IShareDefinition extends ColumnDefinition {
    cusip: string;

    constructor(ticker: string, name: string, cusip: string, groups: string[]) {
        super();
        this.columnTag = ticker;
        this.title = name;
        this.cusip = cusip;
        this.groups = groups;
    }
}
