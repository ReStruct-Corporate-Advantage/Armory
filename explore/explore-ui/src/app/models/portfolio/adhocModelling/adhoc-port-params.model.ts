import {AbstractConfig, CalendarDateUtils, DateValue, SerializeFavoriteType} from '@blk/explore-ui-core';
import {isNaN, isNil, isObject} from 'lodash';

/**
 * Model class for adhoc portfolio params
 */
export class AdhocPortParams extends AbstractConfig {
    name: string;
    fullName: string;
    currency: string;
    portMktNotional: number;
    date: DateValue;
    isPortGroup: boolean;

    /**
     * Constructor implementation
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Compares with other adhoc portfolio params object
     */
    equals(obj: AbstractConfig): boolean {
        if (!(obj instanceof AdhocPortParams)) {
            return false;
        }

        if (this.name !== obj.name) {
            return false;
        }

        if (this.fullName !== obj.fullName) {
            return false;
        }

        if (this.currency !== obj.currency) {
            return false;
        }

        if (!isNil(this.date) && !this.date.equals(obj.date)) {
            return false;
        }

        if (this.isPortGroup !== obj.isPortGroup) {
            return false;
        }

        return this.portMktNotional === obj.portMktNotional;
    }

    /**
     * deserialize the content into adhocPortParams object
     */
    deserialize(data: any): void {
        if (!data) {
            return;
        }

        this.name = data.name;
        this.fullName = data.fullName;
        this.currency = data.currency;
        this.date = !isNil(data.date) ? new DateValue(data.date) : CalendarDateUtils.getDefaultDateObject();
        this.portMktNotional = data.portMktNotional;
        this.isPortGroup = data.isPortGroup;
    }

    /**
     * serialize the content from adhocPortParams object
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            name: this.name,
            fullName: this.fullName,
            currency: this.currency,
            // For old favs initializing date with T-1
            date: !isNil(this.date) ? this.date.serialize() : CalendarDateUtils.getDefaultDateObject().serialize(),
            isPortGroup: this.isPortGroup,
            ...(!isNil(this.portMktNotional) ? {portMktNotional: this.portMktNotional} : {})
        };
    }

    /**
     * Determines if adhocPortParams are valid
     */
    isValid(): boolean {
        return !isNil(this.name) && !isNil(this.currency) && !isNaN(this.portMktNotional);
    }
}
