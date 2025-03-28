import {isNil} from 'lodash';
import {AbstractScenario} from './abstract-scenario.model';
import {SerializeFavoriteType} from '../../../favorite/enums';

/**
 * Class to represent the named scenario information.  This class is used in 2 contexts:
 *  1.  The definitions that come back from the server for the list of scenarios
 *  2.  The column options for the scenarios
 */
export class NamedScenario extends AbstractScenario {
    /**
     * The code of the scenario.
     */
    code: string;

    /**
     * The long description of the scenario.
     */
    description: string;

    /**
     * The short name of the scenario.
     */
    name: string;

    /**
     * The scenario category : Aladdin or My or Team or Enterprise scenarios
     */
    category?: string;

    /**
     * Constructor.
     */
    constructor(data?: any) {
        super();
        if (!isNil(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Serialize the config to json.
     */
    serialize(_isNested?: boolean | SerializeFavoriteType): any {
        const obj: any = {
            type: 'NamedScenario',  // Not sure if we actually need this but seems to be stored int he favorite.
            scenCode: this.code,
            scenDescription: this.description,
            scenName: this.name,
        };
        if (this.category) {
            obj.scenCategory = this.category;
        }
        return obj;
    }

    /**
     * Deserialize the json data into this object.
     */
    deserialize(data: any): void {
        this.code = data.scenCode;
        this.description = data.scenDescription;
        this.name = data.scenName;
        if (data.scenCategory) {
            this.category = data.scenCategory;
        }
        this.updateScenarioCode();
    }

    updateScenarioCode(): void {
        if (this.category === 'Aladdin Scenarios') {
            this.code = this.code?.split('::')[0];
        }
    }
}
