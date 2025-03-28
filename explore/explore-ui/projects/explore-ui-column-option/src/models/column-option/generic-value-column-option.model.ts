import {isEmpty, isObject} from 'lodash';
import {AbstractColumnOption} from '@blk/explore-ui-core';

/**
 * Base class of a column option that only has 1 value.
 */
export abstract class GenericValueColumnOption<T> extends AbstractColumnOption {
    value: T;

    /**
     * Object constructor.  Optionally takes a serialized object to deserialize into this instance.
     */
    protected constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Initialises the column with the default settings.
     */
    public initialize(defaultSettings: any): void {
        if (defaultSettings && defaultSettings.columnOptionAttributes && defaultSettings.columnOptionAttributes[0].defaultValue) {
            this.value = defaultSettings.columnOptionAttributes[0].defaultValue.value;
        }
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof GenericValueColumnOption)) {
            return false;
        }
        return this.value === otherColOption.value && this.configType === otherColOption.configType;
    }

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isEmpty(this.value);
    }
}
