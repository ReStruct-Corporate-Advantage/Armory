import {isNil, isObject} from 'lodash';
import {AbstractColumnOption, ClimateDamageFunction, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model for Climate damage function column option
 */
export class ClimateDamageFunctionsColumnOption extends AbstractColumnOption {

    public static CONFIG_TYPE = 'climateDamageFunctionOptions';

    climateDamageFunctionOptions: ClimateDamageFunction[];

    /**
     * Constructor to create a new empty climate damage function option or initialize an existing one
     * @param data Optional data to construct existing climate damage function option
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
        return ClimateDamageFunctionsColumnOption.CONFIG_TYPE;
    }

    /**
     * Initializes the column with the default settings.
     */
    initialize(defaultSettings: any): void {
        super.initialize(defaultSettings);
        this.climateDamageFunctionOptions = [];
    }
    /**
     * See {@link AbstractColumnOption.doAddRequestParams}
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams['climateDamageFunctionOptions'] = this.doSerialize(false).climateDamageFunctionOptions;
    }

    /**
     * Deserialize saved damage function options from data to object
     * @param data ClimateDamageFunctions in JSON form
     */
    deserialize(data: any): void {
        // no damage functions to deserialize, set as empty array
        if (!data.climateDamageFunctionOptions) {
            this.climateDamageFunctionOptions = [];
            return;
        }
        this.climateDamageFunctionOptions = data.climateDamageFunctionOptions.map(damageFunctionOptionData => {
            const damageFunctionOption = new ClimateDamageFunction();
            damageFunctionOption.deserialize(damageFunctionOptionData);
            return damageFunctionOption;
        });
    }

    /**
     * Serialize object into JSON format for saving
     */
    doSerialize(isNested?: boolean | SerializeFavoriteType): any {
        // only serialize if the settings are valid
        if (!this.isValid()) {
            return undefined;
        }
        const serializedDamageFunctions = this.climateDamageFunctionOptions
            .filter(setting => setting.isValid())
            .map(validSetting => validSetting.serialize(isNested));

        return {
            climateDamageFunctionOptions: serializedDamageFunctions,
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (isNil(otherColOption) || !(otherColOption instanceof ClimateDamageFunctionsColumnOption)) {
            return false;
        }

        if (!(isNil(otherColOption.climateDamageFunctionOptions))) {
            if (this.climateDamageFunctionOptions.length !== otherColOption.climateDamageFunctionOptions.length) {
                return false;
            }
        } else {
            return false;
        }

        this.climateDamageFunctionOptions.forEach((setting, index) => {
            if (!setting.equals(otherColOption.climateDamageFunctionOptions[index])) {
                return false;
            }
        });
        return true;
    }

    /**
     * Checks if the ClimateDamageFunctionsColumnOption is valid (truthy)
     * Empty array is valid since it indicates no child columns.
     */
    isValid(): boolean {
        return !!this.climateDamageFunctionOptions;
    }
}
