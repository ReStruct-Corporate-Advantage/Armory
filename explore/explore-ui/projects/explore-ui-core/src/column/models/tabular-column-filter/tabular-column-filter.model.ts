import {AbstractConfig} from '../../../core/models/abstract-config.model';
import {each, isObject, isEmpty} from 'lodash';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Model for column filters for table widgets
 */
export class TabularColumnFilters extends AbstractConfig {
    // Object straight from ag-grid for the column filter
    // Ex: {filter: 100, type: 'greaterThan', filterType: 'number'}
    columnFilters: any = {};

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Adds a filter object to the columnFilters object keyed with the key passed in
     */
    add(key: string, filter: any): void {
        this.columnFilters[key] = filter;
    }

    /**
     * Empty out the columnFilters object
     */
    clearFilters(): void {
        this.columnFilters = {};
    }

    /**
     * Returns true if the columnFilters object is empty
     */
    isEmpty(): boolean {
        return isEmpty(this.columnFilters);
    }

    /**
     * Serialize the config.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return this.columnFilters;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        const self = this;
        if (!data) {
            return;
        }
        each(data, (filter: any, key: string) => {
            self.columnFilters[key] = filter;
        });
    }
}
