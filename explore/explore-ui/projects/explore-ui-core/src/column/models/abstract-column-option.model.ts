import {find, isEmpty} from 'lodash';
import {ColumnOptionValidatorInterface} from '../interfaces';
import {AbstractConfig} from '../../core/models/abstract-config.model';
import {isDerivedSetting, RequestParamsCreator, RequestParamsWithFavCreator} from '../../core/interfaces';
import {SerializeFavoriteType} from '../../favorite/enums';
import {CoreFavoriteUtils} from '../../favorite/utils';
import {ConfigState} from '../../core/enums';

/**
 * Base class for all the column option models.  Adds int he default behaviours that a column option needs to implement.
 */
export abstract class AbstractColumnOption extends AbstractConfig implements RequestParamsCreator, RequestParamsWithFavCreator {
    // Holds the state of the column option to determine if it is new/default, part of existing favorite, or modified
    optionState: ConfigState;

    /**
     * Gets the type of the config object.
     */
    abstract get configType(): string;

    /**
     * Adds option values as parameters to the given request parameters
     * @param requestParams request parameters to add option values to
     * @param paramName the key to which the option values object would be mapped
     */
    addRequestParams(requestParams: any, paramName?: string): void {
        if (!this.isValid()) {
            return;
        }
        this.doAddRequestParams(requestParams, paramName);
    }

    /**
     * Called to generate API request. This method retains the favId in column Options
     * Column Option should overide this method
     * @param requestParams request parameters to add option values to
     */
      addRequestParamsWithFavId(requestParams: any) {
          this.addRequestParams(requestParams);
      }

    /**
     * Initialises the column with the default settings.
     */
    initialize(defaultSettings: any, definitions?: Map<string, any>): void {
        // Intentionally left empty
    }

    /**
     * Serialize the config to json.
     *
     * NOTE:  This should be a final method to ensure that the nested fav is handled correctly.
     */
    serialize(isNested?: boolean | SerializeFavoriteType): any {
        // do not serialize if we are trying to detect favorite changes and column option has not been modified
        if (CoreFavoriteUtils.isFavoriteChangeDetection(isNested) && this.optionState !== ConfigState.MODIFIED) {
            return;
        }
        // Serialize the data within this fav.
        const data: any = this.doSerialize(isNested);

        // only include the configType if there is serialized data or
        // the column option is a derived setting (performance setting) so that the next time the column is loaded, it can initialize to the parent performance setting
        if (data && (!isEmpty(data) || isDerivedSetting(this))) {
            data.configType = this.configType;
        }
        return data;
    }

    /**
     * This function is used to serialize the implementation favorite.
     */
    abstract doSerialize(isNested?: boolean | SerializeFavoriteType): any;

    /**
     * Finds a setting in the list of settings given with a given key value.
     */
    findSetting(settings: any, key: string): any {
        if (!settings) {
            return undefined;
        }

        return find(settings.columnOptionAttributes, (attribute: any) => {
            return attribute.key === key;
        });
    }

    /**
     * check if column option implements ColumnOptionValidatorInterface
     */
    hasColumnOptionValidator(): this is ColumnOptionValidatorInterface {
        return 'isValidColumnOption' in this;
    }

    /**
     * Returns true if the passed in otherColOption is equal to this one
     */
    abstract equals(otherColOption: AbstractColumnOption): boolean;

    /**
     * Method that validates if the column option settings are valid to be serialized or to be added on to the request
     */
    abstract isValid(): boolean;

    /**
     * Lets the subclasses add specific option values as parameters to the given request parameters
     * @param _requestParams request parameters
     * @param _paramName the key to which the option values object would be mapped
     */
    protected doAddRequestParams(_requestParams: any, _paramName?: string) {
         // keeping this blank so that implementation does not need to add this if not required
    }

    /**
     * Update the state of the column option based on if it has been modified
     * @param previousColumnOptionValue  The previous column option value to compare against
     */
    public updateColumnOptionState(previousColumnOptionValue: AbstractColumnOption): void {
        // if this column option no longer matches the original value when it was initialized, update the state to MODIFIED
        // if the column option does match the same value as when it was initialized, reset the column option back to the state it was in when it was originally opened because it has not changed
        this.optionState = !this.equals(previousColumnOptionValue) ? ConfigState.MODIFIED : previousColumnOptionValue.optionState;
    }
}
