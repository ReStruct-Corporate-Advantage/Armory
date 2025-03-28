/**
 * Column filters interface
 */
export interface ColumnFilter {
    key: string;
    type: string;
    value?: any;
}

/**
 * Creates a new column filter with the given parameters
 */
export function createColumnFilter(key: string, type: string, value?: any) {
    return new class implements ColumnFilter {
        key = key;
        type = type;
        value = value;
    };
}
