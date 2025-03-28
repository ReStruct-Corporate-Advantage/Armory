import {isEmpty, isNil, isObject} from 'lodash';
import {AbstractColumnOption, SerializeFavoriteType} from '@blk/explore-ui-core';

/**
 * Model class for date column format column option
 */
export class FxFactorOptionsColumnOption extends AbstractColumnOption {

    static CONFIG_TYPE = 'fxFactorOptionsColumnOption';

    fxCrossCurrency: string;
    isFxCrossCurrencyChanged = false;

    /**
     * Looks at the list of option values and if it can create a column option model from it does so.
     * NOTE:  That the list of option values is modified by this function if a model can be created.
     */
    static createModelLegacy(optionValues: any): FxFactorOptionsColumnOption {
        // If there is none of the required parameters then get out of here.
        if (isNil(optionValues.fxCrossCurrency)) {
            return undefined;
        }

        // Create the model.
        const columnOption: FxFactorOptionsColumnOption = new FxFactorOptionsColumnOption();
        columnOption.fxCrossCurrency = optionValues.fxCrossCurrency;

        // Remove the used settings.
        delete optionValues.fxCrossCurrency;

        return columnOption;
    }

    /**
     * Gets the type of the config object.
     */
    get configType(): string {
        return FxFactorOptionsColumnOption.CONFIG_TYPE;
    }

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
     * Deserialize the data into this object.
     */
    deserialize(data: any): void {
        this.fxCrossCurrency = data.fxCrossCurrency;
        this.isFxCrossCurrencyChanged = data.isFxCrossCurrencyChanged;
    }

    /**
     * See AbstractColumnOption.doAddRequestParams
     */
    protected doAddRequestParams(requestParams: any) {
        requestParams.fxCrossCurrency = this.fxCrossCurrency;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    doSerialize(_isNested?: boolean | SerializeFavoriteType): any {
        if (!this.isValid()) {
            return undefined;
        }
        return {
            fxCrossCurrency: this.fxCrossCurrency,
            isFxCrossCurrencyChanged: this.isFxCrossCurrencyChanged,
        };
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    equals(otherColOption: AbstractColumnOption): boolean {
        if (!(otherColOption instanceof FxFactorOptionsColumnOption)) {
            return false;
        }
        return this.fxCrossCurrency === otherColOption.fxCrossCurrency;
    }

    /**
     * Method that validates if the column option settinsg are valid to be serialized or to be added on to the request
     */
    isValid(): boolean {
        return !isEmpty(this.fxCrossCurrency);
    }

}
