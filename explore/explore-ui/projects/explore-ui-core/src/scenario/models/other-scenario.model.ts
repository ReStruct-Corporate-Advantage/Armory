import {isNil} from 'lodash';
import {CommonUtils} from '../../core/utils';
import {AbstractScenario} from '../../definition/models/scenario/abstract-scenario.model';
import {SerializeFavoriteType} from '../../favorite/enums';

/**
 * Class to represent the other scenario information.
 */
export class OtherScenario extends AbstractScenario {
    /**
     * Unique id to identify this scenario.
     */
    id: string;

    /**
     * The name of the scenario.
     */
    name: string;

    /**
     * The purpose of the scenario.
     */
    purpose: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (!isNil(data)) {
            this.deserialize(data);
        }

        // If there is no id then generate one.
        // NOTE:  This is done after the deserialize above so that if there was an existing one in the serialized version it is kept.
        if (isNil(this.id)) {
            this.id = 'other' + CommonUtils.generateUniqueIdAsNumber();
        }
    }

    /**
     * Gets the generated code for this date scenario.
     */
    get code(): string {
        return this.name + '::' + this.purpose;
    }

    /**
     * Gets the generated code for this date scenario.
     */
    get description(): string {
        // This always seems to be blank, so need to figure out if it is needed.
        return '';
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        return {
            type: 'Other',  // Not sure if we actually need this but seems to be stored int he favorite.
            id: this.id,
            data: {
                name: this.name,
                purpose: this.purpose
            },
            enableOtherScenario: this.enabled,
            scenCode: this.code,
            scenName: this.code,  // This is the same as the code, do we need it?
            scenDescription: this.description
        };
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.id = data.id;
        this.name = data.data.name;
        this.purpose = data.data.purpose;
        this.enabled = data.enableOtherScenario;
    }
}
