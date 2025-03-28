import {isObject} from 'lodash';
import {GenericValueColumnOption} from './generic-value-column-option.model';

/**
 * Definition Column Options Model
 */
export class DefinitionColumnOption extends GenericValueColumnOption<number> {

    static CONFIG_TYPE = 'definition';
    definition;
    /**
     * Constructor
     */
    constructor(data?: any) {
        super();
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return DefinitionColumnOption.CONFIG_TYPE;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested: boolean|number): any {
        return undefined;
    }

}

