/**
 * Class to hold the values for each column attribute
 */
export interface ColumnOptionAttributeValue {
    value: any;
    label: string;
}

/**
 * ColumnOptionAttribute represents the individual items that comprise of a column option. An example of this would be within Custom Column Title options
 * where there would be an attribute with title 'Custom Column Title'
 */
export interface ColumnOptionAttribute {
    title: string;
    key: string;
    dataType: string;
    values?: ColumnOptionAttributeValue[];
    defaultValue?: ColumnOptionAttributeValue;
    isRestricted?: boolean;
}

/**
 * Metadata of a column option indicating what the column option needs to offer to the user to act upon
 */
export interface ColumnOptionMetaDataInterface {
    columnOptionKey: string;
    columnOptionTitle: string;
    columnOptionConfigType: string;
    columnOptionAttributes: ColumnOptionAttribute[];
}
